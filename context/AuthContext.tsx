import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '../firebaseConfig';
import { ADMIN_EMAILS, DATA_VERSION } from '../constants';

export interface User {
  id: string; // Firebase UID
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  isAdmin?: boolean;
  isOnboardingComplete?: boolean;
  dataVersion?: number; // Para controlar migraciones
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
                    // Si el usuario tiene una versión de datos vieja O no tiene versión
                    // Forzamos la actualización
                    const needsMigration = !dbData.dataVersion || dbData.dataVersion < DATA_VERSION;

                    if (needsMigration) {
                        console.log("Migrating user profile to version", DATA_VERSION);
                        
                        // Reseteamos valores críticos
                        const updatedProfile = {
                            ...baseUser,
                            ...dbData,
                            isAdmin: isOfficialAdmin, // Re-validar admin
                            role: isOfficialAdmin ? "Administrador" : (dbData.role || "Streamer"),
                            isOnboardingComplete: false, // FORZAR ONBOARDING
                            dataVersion: DATA_VERSION
                        };
                        
                        // Guardar en DB inmediatamente
                        await setDoc(userDocRef, updatedProfile, { merge: true });
                        setUser(updatedProfile);

                    } else {
                        // Usuario actualizado, cargar normal
                        setUser({ 
                            ...baseUser, 
                            ...dbData, 
                            // Siempre reforzamos la seguridad del admin en memoria
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
      const userEmail = fbUser.email?.toLowerCase() || "";
      const isOfficialAdmin = ADMIN_EMAILS.includes(userEmail);

      // Optimistic User Set
      const instantUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || "Usuario",
          email: userEmail,
          avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${fbUser.displayName || 'User'}`,
          role: isOfficialAdmin ? "Administrador" : "Streamer",
          isAdmin: isOfficialAdmin,
          isOnboardingComplete: true // Will be checked against DB in next tick
      };
      
      setUser(instantUser);
      setLoading(false);
  };

  // --- REGISTRO ---
  const register = async (email: string, pass: string, name: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      const userEmail = fbUser.email?.toLowerCase() || "";
      const isOfficialAdmin = ADMIN_EMAILS.includes(userEmail);

      sendEmailVerification(fbUser).catch(e => console.warn("Email verification error", e));

      const newUserProfile: User = {
        id: fbUser.uid,
        name: name,
        email: userEmail,
        avatarUrl: `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${name}`,
        role: isOfficialAdmin ? "Administrador" : "Streamer Oficial",
        isAdmin: isOfficialAdmin,
        isOnboardingComplete: false,
        dataVersion: DATA_VERSION
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

  // HYBRID UPLOAD STRATEGY: Storage -> Fallback to Base64 string
  const uploadPhoto = async (file: Blob, base64Fallback?: string): Promise<string> => {
      if (!user) throw new Error("No authenticated user");
      
      // 1. Try Firebase Storage
      if (storage) {
          try {
              const storageRef = ref(storage, `avatars/${user.id}_profile.jpg`);
              await uploadBytes(storageRef, file);
              const downloadURL = await getDownloadURL(storageRef);
              return `${downloadURL}?t=${new Date().getTime()}`; // Cache busting
          } catch (error) {
              console.warn("Storage upload failed (permissions/network). Switching to Base64 fallback.", error);
          }
      }

      // 2. Fallback: Return the Base64 string directly
      // This saves the image *inside* the text profile in Firestore
      if (base64Fallback) {
          return base64Fallback;
      }

      throw new Error("No se pudo subir la imagen ni usar el respaldo.");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // Security Check: Prevent setting isAdmin via updateProfile unless email is whitelisted
    if (data.isAdmin !== undefined) {
        const isOfficialAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
        if (!isOfficialAdmin) {
            delete data.isAdmin; // Remove attempt to gain admin rights
            console.warn("Security Block: Attempt to set Admin privileges denied.");
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
        console.warn("Profile sync warning (offline/network):", e);
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