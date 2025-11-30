import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '../firebaseConfig';
import { ADMIN_EMAILS, DATA_VERSION } from '../constants';
import { ActivityLog } from '../types';

export interface User {
  id: string; // Firebase UID
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  isAdmin?: boolean;
  isOnboardingComplete?: boolean;
  dataVersion?: number; // Para controlar migraciones
  lastLogin?: string;
  deviceInfo?: string;
  accessLogs?: ActivityLog[];
  isBlocked?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadPhoto: (file: Blob, base64Fallback?: string) => Promise<string>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Escuchar cambios de sesión (Backup & Initial Load)
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
        if (loading) {
            console.warn("Firebase slow response - Forcing UI load");
            setLoading(false);
        }
    }, 2000);

    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimer);

      if (firebaseUser) {
        // STRICT SECURITY CHECK
        const email = firebaseUser.email?.toLowerCase() || "";
        const isOfficialAdmin = ADMIN_EMAILS.includes(email);

        let baseUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuario",
            email: email,
            avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
            role: isOfficialAdmin ? "Administrador" : "Streamer",
            isAdmin: isOfficialAdmin, // FORCE TRUE/FALSE BASED ON EMAIL
            isOnboardingComplete: false,
            dataVersion: DATA_VERSION
        };

        try {
            if (db) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const dbData = userDoc.data();
                    
                    // --- MIGRATION LOGIC ---
                    const needsMigration = !dbData.dataVersion || dbData.dataVersion < DATA_VERSION;

                    if (needsMigration) {
                        const updatedProfile = {
                            ...baseUser,
                            ...dbData,
                            isAdmin: isOfficialAdmin, // Re-validar admin
                            role: isOfficialAdmin ? "Administrador" : (dbData.role || "Streamer"),
                            isOnboardingComplete: false, // FORZAR ONBOARDING
                            dataVersion: DATA_VERSION
                        };
                        
                        await setDoc(userDocRef, updatedProfile, { merge: true });
                        setUser(updatedProfile);

                    } else {
                        setUser({ 
                            ...baseUser, 
                            ...dbData, 
                            isAdmin: isOfficialAdmin,
                            role: isOfficialAdmin ? "Administrador" : (dbData.role || "Streamer")
                        } as User);
                    }
                } else {
                    // Usuario nuevo (no existe doc)
                    setUser(baseUser);
                }
            } else {
                setUser(baseUser);
            }
        } catch (error: any) {
            console.warn("Firestore offline/error: Using cached/basic profile.");
            setUser(baseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
        unsubscribe();
        clearTimeout(safetyTimer);
    };
  }, []); 

  // --- LOGIN ---
  const login = async (email: string, pass: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = credential.user;
      
      // --- CAPTURA DE DATOS REALES DE SEGURIDAD ---
      const now = new Date();
      // Simple User Agent Parser for better readability
      const ua = navigator.userAgent;
      let deviceString = "Desconocido";
      if (ua.includes("iPhone")) deviceString = "iPhone iOS";
      else if (ua.includes("iPad")) deviceString = "iPadOS";
      else if (ua.includes("Android")) deviceString = "Android Device";
      else if (ua.includes("Windows")) deviceString = "PC Windows";
      else if (ua.includes("Mac")) deviceString = "Macintosh";
      else if (ua.includes("Linux")) deviceString = "Linux Desktop";

      // Append Browser info
      if (ua.includes("Chrome")) deviceString += " (Chrome)";
      else if (ua.includes("Firefox")) deviceString += " (Firefox)";
      else if (ua.includes("Safari")) deviceString += " (Safari)";

      const newLog: ActivityLog = {
          action: 'Inicio de Sesión Exitoso',
          timestamp: now.toISOString(),
          device: deviceString,
          type: 'login'
      };

      // Update Firestore with Real Data (Using arrayUnion for append)
      if (db) {
          try {
              const userRef = doc(db, "users", fbUser.uid);
              await updateDoc(userRef, {
                  lastLogin: now.toISOString(),
                  deviceInfo: deviceString,
                  accessLogs: arrayUnion(newLog) 
              });
          } catch (e) {
              console.error("Error logging activity", e);
              // Fallback if doc doesn't exist (edge case)
              const userRef = doc(db, "users", fbUser.uid);
              await setDoc(userRef, {
                   lastLogin: now.toISOString(),
                   deviceInfo: deviceString,
                   accessLogs: [newLog]
              }, { merge: true });
          }
      }
      // UI state will be handled by onAuthStateChanged
  };

  // --- REGISTRO ---
  const register = async (email: string, pass: string, name: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      const userEmail = fbUser.email?.toLowerCase() || "";
      const isOfficialAdmin = ADMIN_EMAILS.includes(userEmail);

      sendEmailVerification(fbUser).catch(e => console.warn("Email verification error", e));

      const now = new Date();
      const deviceString = navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Web Browser';

      const newUserProfile: User = {
        id: fbUser.uid,
        name: name,
        email: userEmail,
        avatarUrl: `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${name}`,
        role: isOfficialAdmin ? "Administrador" : "Streamer Oficial",
        isAdmin: isOfficialAdmin,
        isOnboardingComplete: false,
        dataVersion: DATA_VERSION,
        lastLogin: now.toISOString(),
        deviceInfo: deviceString,
        accessLogs: [{ action: 'Cuenta Creada', timestamp: now.toISOString(), device: deviceString, type: 'login' }]
      };

      setUser(newUserProfile);
      setLoading(false);

      try {
        if (db) {
            await setDoc(doc(db, "users", fbUser.uid), newUserProfile);
        }
        await updateAuthProfile(fbUser, { displayName: name });
      } catch (e) {
        console.error("Error creating user profile in DB", e);
      }
  };

  const logout = async () => {
      if (!auth) return;
      await signOut(auth);
      setUser(null);
  };

  const uploadPhoto = async (file: Blob, base64Fallback?: string): Promise<string> => {
      if (!user) throw new Error("No authenticated user");
      
      if (storage) {
          try {
              const storageRef = ref(storage, `avatars/${user.id}_profile.jpg`);
              await uploadBytes(storageRef, file);
              const downloadURL = await getDownloadURL(storageRef);
              return `${downloadURL}?t=${new Date().getTime()}`; 
          } catch (error) {
              console.warn("Storage upload failed. Switching to Base64 fallback.", error);
          }
      }

      if (base64Fallback) {
          return base64Fallback;
      }

      throw new Error("No se pudo subir la imagen.");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // Security Check
    if (data.isAdmin !== undefined) {
        const isOfficialAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
        if (!isOfficialAdmin) {
            delete data.isAdmin;
        }
    }

    // Log Profile Changes
    if (db) {
        const now = new Date();
        const deviceString = navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Web Browser';
        
        // If updating name or avatar, log it
        if (data.name || data.avatarUrl) {
             const log: ActivityLog = {
                 action: 'Perfil Actualizado',
                 timestamp: now.toISOString(),
                 device: deviceString,
                 type: 'profile_update'
             };
             try {
                // We do this separately to avoid circular logic in state
                const userRef = doc(db, "users", user.id);
                await updateDoc(userRef, { accessLogs: arrayUnion(log) });
             } catch(e) {}
        }
    }
    
    // 1. Optimistic Update
    setUser(prev => prev ? { ...prev, ...data } : null);

    // 2. Background Sync
    try {
        if (db) {
            const userDocRef = doc(db, "users", user.id);
            await setDoc(userDocRef, data, { merge: true });
        }
        
        if (auth && auth.currentUser) {
            const authUpdates: { displayName?: string; photoURL?: string } = {};
            if (data.name) authUpdates.displayName = data.name;
            if (data.avatarUrl) authUpdates.photoURL = data.avatarUrl;

            if (Object.keys(authUpdates).length > 0) {
                await updateAuthProfile(auth.currentUser, authUpdates);
            }
        }
    } catch (e) {
        console.warn("Profile sync warning:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, uploadPhoto, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};