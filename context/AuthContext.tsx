
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '../firebaseConfig';
import { DATA_VERSION } from '../constants';
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
  forceRelogin?: number; // Timestamp para forzar cierre de sesión
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

// LISTA MAESTRA DE DUEÑOS (Acceso total inmediato)
const MASTER_EMAILS = ['joan6141318@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Escuchar cambios de sesión y DE BASE DE DATOS en Tiempo Real
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
        if (loading) {
            console.warn("Firebase slow response - Forcing UI load");
            setLoading(false);
        }
    }, 3000);

    if (!auth) {
        setLoading(false);
        return;
    }

    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(safetyTimer);

      // Si teníamos un listener de otro usuario anterior, lo cerramos
      if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
      }

      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase() || "";
        // VERIFICACIÓN MAESTRA: Si es tu correo, eres admin SIEMPRE.
        const isMasterAdmin = MASTER_EMAILS.includes(email);
        
        // Estructura base por defecto
        const baseUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuario",
            email: email,
            avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
            role: isMasterAdmin ? "Dueño" : "Streamer",
            isAdmin: isMasterAdmin, // FORZAR TRUE SI ES EL DUEÑO
            isOnboardingComplete: false,
            dataVersion: DATA_VERSION
        };

        if (db) {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            
            // --- AQUÍ ESTÁ LA MAGIA: LISTENER EN TIEMPO REAL ---
            unsubscribeFirestore = onSnapshot(userDocRef, async (docSnap) => {
                if (docSnap.exists()) {
                    const dbData = docSnap.data();
                    
                    // Seguridad: Si es Master Email, ignorar DB y dar permisos
                    const isAdminAccess = isMasterAdmin || dbData.isAdmin === true;

                    // --- MIGRACIÓN DE DATOS ---
                    const needsMigration = !dbData.dataVersion || dbData.dataVersion < DATA_VERSION;

                    if (needsMigration) {
                        const updatedProfile = {
                            ...baseUser,
                            ...dbData,
                            isAdmin: isAdminAccess,
                            role: isAdminAccess ? "Administrador" : (dbData.role || "Streamer"),
                            isOnboardingComplete: false, 
                            dataVersion: DATA_VERSION
                        };
                        
                        // Guardar migración
                        try {
                            await setDoc(userDocRef, updatedProfile, { merge: true });
                        } catch(e) { console.error("Migration failed", e); }
                        
                        // Actualizar estado local
                        setUser(updatedProfile);

                    } else {
                        // ACTUALIZACIÓN INSTANTÁNEA
                        setUser({ 
                            ...baseUser, 
                            ...dbData, 
                            isAdmin: isAdminAccess, // Prioridad al Master Email
                            role: isAdminAccess ? "Administrador" : (dbData.role || "Streamer")
                        } as User);
                    }
                } else {
                    // Usuario nuevo (no existe doc) - Crear perfil
                    try {
                        await setDoc(userDocRef, baseUser);
                        setUser(baseUser);
                    } catch (e) {
                        console.error("Error creating initial profile", e);
                        setUser(baseUser); // Fallback visual
                    }
                }
                setLoading(false);
            }, (error) => {
                console.error("Firestore listener error:", error);
                // En caso de error de lectura, si es Master, mantener acceso
                if (isMasterAdmin) setUser(baseUser);
                setLoading(false);
            });
        } else {
            // Sin conexión a DB
            setUser(baseUser);
            setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeFirestore) unsubscribeFirestore();
        clearTimeout(safetyTimer);
    };
  }, []); 

  // --- LOGIN ---
  const login = async (email: string, pass: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = credential.user;
      
      const now = new Date();
      const ua = navigator.userAgent;
      let deviceString = "Desconocido";
      if (ua.includes("iPhone")) deviceString = "iPhone iOS";
      else if (ua.includes("Android")) deviceString = "Android Device";
      else if (ua.includes("Windows")) deviceString = "PC Windows";
      
      const newLog: ActivityLog = {
          action: 'Inicio de Sesión Exitoso',
          timestamp: now.toISOString(),
          device: deviceString,
          type: 'login'
      };

      if (db) {
          try {
              const userRef = doc(db, "users", fbUser.uid);
              await updateDoc(userRef, {
                  lastLogin: now.toISOString(),
                  deviceInfo: deviceString,
                  accessLogs: arrayUnion(newLog) 
              });
          } catch (e) {
              // Ignore
          }
      }
  };

  // --- REGISTRO ---
  const register = async (email: string, pass: string, name: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      const userEmail = fbUser.email?.toLowerCase() || "";

      sendEmailVerification(fbUser).catch(e => console.warn("Email verification error", e));

      const now = new Date();
      const deviceString = navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Web Browser';
      
      // Auto-admin si es el correo maestro
      const isMasterAdmin = MASTER_EMAILS.includes(userEmail);

      const newUserProfile: User = {
        id: fbUser.uid,
        name: name,
        email: userEmail,
        avatarUrl: `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${name}`,
        role: isMasterAdmin ? "Dueño" : "Streamer Oficial",
        isAdmin: isMasterAdmin, 
        isOnboardingComplete: false,
        dataVersion: DATA_VERSION,
        lastLogin: now.toISOString(),
        deviceInfo: deviceString,
        accessLogs: [{ action: 'Cuenta Creada', timestamp: now.toISOString(), device: deviceString, type: 'login' }]
      };

      // Set user immediately for UI responsiveness
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
    
    // SECURITY: Si es el dueño, permitir todo. Si no, bloquear ascenso a admin.
    const isMasterAdmin = MASTER_EMAILS.includes(user.email);
    
    if (data.isAdmin === true && !user.isAdmin && !isMasterAdmin) {
        // Bloqueo solo si NO eres el dueño
        delete data.isAdmin;
        delete data.role;
    }

    if (db) {
        const now = new Date();
        const deviceString = navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Web Browser';
        
        if (data.name || data.avatarUrl) {
             const log: ActivityLog = {
                 action: 'Perfil Actualizado',
                 timestamp: now.toISOString(),
                 device: deviceString,
                 type: 'profile_update'
             };
             try {
                const userRef = doc(db, "users", user.id);
                await updateDoc(userRef, { accessLogs: arrayUnion(log) });
             } catch(e) {}
        }
    }
    
    // Optimistic Update
    setUser(prev => prev ? { ...prev, ...data } : null);

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
