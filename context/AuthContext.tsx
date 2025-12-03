
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, arrayUnion, onSnapshot, Unsubscribe } from "firebase/firestore";
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
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, isAdmin?: boolean) => Promise<void>;
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

  // 1. Escuchar cambios de sesión y Sincronización Tiempo Real con Firestore
  useEffect(() => {
    let unsubscribeFirestore: Unsubscribe | null = null;

    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Si cambia el usuario de auth, limpiamos el listener anterior de Firestore
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        
        // Configurar listener en tiempo real para el documento del usuario
        unsubscribeFirestore = onSnapshot(userRef, async (docSnap) => {
            const email = firebaseUser.email?.toLowerCase() || "";
            
            // Datos base predeterminados (Fallback)
            const baseUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Usuario",
                email: email,
                avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
                role: "Streamer",
                isAdmin: false,
                isBlocked: false, // Por defecto no bloqueado
                isOnboardingComplete: false,
                dataVersion: DATA_VERSION
            };

            if (docSnap.exists()) {
                const dbData = docSnap.data();
                
                // Mezcla robusta: La DB tiene prioridad sobre el baseUser
                setUser({ 
                    ...baseUser, 
                    ...dbData,
                    // Asegurar consistencia de datos críticos
                    isBlocked: !!dbData.isBlocked, 
                    isAdmin: !!dbData.isAdmin
                } as User);
            } else {
                // Si el documento no existe (Nuevo Usuario), intentamos crearlo
                // Si falla por permisos (Rules), usamos el baseUser en memoria
                try {
                    await setDoc(userRef, baseUser);
                    setUser(baseUser);
                } catch (e) {
                    console.warn("Error creando perfil en DB (Posible error de permisos), usando perfil memoria:", e);
                    setUser(baseUser);
                }
            }
            
            setLoading(false);
        }, (error) => {
            console.error("Error en sincronización de usuario:", error);
            // Si falla la DB (ej. offline), mantenemos al usuario logueado con datos básicos de Auth
            const fallbackUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Usuario",
                email: firebaseUser.email || "",
                avatarUrl: firebaseUser.photoURL || "",
                role: "Streamer",
                isAdmin: false,
                isBlocked: false
            };
            setUser(prev => prev || fallbackUser);
            setLoading(false);
        });

      } else {
        // No hay usuario autenticado
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []); 

  // --- LOGIN ---
  const login = async (email: string, pass: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = credential.user;
      
      // Registro de actividad
      const now = new Date();
      const deviceString = navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Web Browser';
      
      const newLog: ActivityLog = {
          action: 'Inicio de Sesión',
          timestamp: now.toISOString(),
          device: deviceString,
          type: 'login'
      };

      if (db) {
          try {
              const userRef = doc(db, "users", fbUser.uid);
              // Usamos setDoc con merge para garantizar escritura
              await setDoc(userRef, {
                  lastLogin: now.toISOString(),
                  deviceInfo: deviceString,
                  accessLogs: arrayUnion(newLog) 
              }, { merge: true });
          } catch (e) {
              console.warn("No se pudo registrar log de acceso:", e);
          }
      }
  };

  // --- REGISTRO ---
  const register = async (email: string, pass: string, name: string, isAdmin: boolean = false) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      
      // Actualizar perfil de Auth inmediatamente
      await updateAuthProfile(fbUser, { displayName: name });
  };

  const logout = async () => {
      if (!auth) return;
      await signOut(auth);
      // El estado se limpiará vía onAuthStateChanged
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
              console.warn("Fallo Storage, usando fallback Base64.", error);
          }
      }

      if (base64Fallback) {
          return base64Fallback;
      }

      throw new Error("No se pudo subir la imagen.");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
        if (db) {
            const userDocRef = doc(db, "users", user.id);
            await setDoc(userDocRef, data, { merge: true });
            
            // Log de actividad si es cambio relevante
            if (data.name || data.avatarUrl) {
                const now = new Date();
                const log: ActivityLog = {
                     action: 'Perfil Actualizado',
                     timestamp: now.toISOString(),
                     device: 'App',
                     type: 'profile_update'
                 };
                 await setDoc(userDocRef, { accessLogs: arrayUnion(log) }, { merge: true });
            }
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
        console.warn("Error sincronizando perfil:", e);
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
