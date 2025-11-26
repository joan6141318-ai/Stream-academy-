import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '../firebaseConfig';

export interface User {
  id: string; // Firebase UID
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadPhoto: (base64Image: string) => Promise<string>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Escuchar cambios de sesión (Persistencia Real)
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ESTRATEGIA DE VELOCIDAD: Cargar datos básicos primero
        // No esperamos a la DB para mostrar que hay usuario
        const basicUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuario",
            email: firebaseUser.email || "",
            avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
            role: "Cargando..." // Se actualizará en segundo plano
        };
        
        // Solo actualizamos si no tenemos usuario o si es diferente para evitar re-renders
        setUser(prev => {
            if (prev && prev.id === basicUser.id) return prev; 
            return basicUser;
        });

        // Cargar datos completos en segundo plano (Firestore)
        try {
            if (db) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                getDoc(userDocRef).then((userDoc) => {
                    if (userDoc.exists()) {
                        const dbData = userDoc.data();
                        // Actualizar silenciosamente con los datos reales (rol, admin, foto custom)
                        setUser(prev => {
                            if (!prev || prev.id !== firebaseUser.uid) return prev;
                            return { ...prev, ...dbData } as User;
                        });
                    }
                });
            }
        } catch (error) {
            console.error("Background profile fetch failed:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- LOGIN REAL (OPTIMIZADO - VELOCIDAD MÁXIMA) ---
  const login = async (email: string, pass: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      // 1. Autenticar en Firebase (Esto es lo único que esperamos)
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // 2. INYECCIÓN INSTANTÁNEA (Optimistic Update)
      // Construimos el perfil con lo que ya tenemos en memoria del Auth
      // NO ESPERAMOS A LA BASE DE DATOS AQUÍ para que la UI responda al instante
      const instantUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || "Usuario",
          email: fbUser.email || "",
          avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${fbUser.displayName || 'User'}`,
          role: "Cargando..."
      };

      // Actualizar estado GLOBAL inmediatamente
      // Esto desbloquea el ProtectedRoute al instante antes de que termine la promesa
      setUser(instantUser);
  };

  // --- REGISTRO REAL ---
  const register = async (email: string, pass: string, name: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      // 1. Crear en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // Enviar correo de verificación (Fire and forget - no esperamos)
      sendEmailVerification(fbUser).catch(e => console.warn("Email verification error", e));

      // 2. Crear Perfil en Firestore
      const newUserProfile: User = {
        id: fbUser.uid,
        name: name,
        email: email,
        avatarUrl: `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${name}`,
        role: "Streamer Oficial",
        isAdmin: false
      };

      // Guardar en DB (Esperamos esto para asegurar consistencia inicial)
      try {
        if (db) {
            await setDoc(doc(db, "users", fbUser.uid), newUserProfile);
        }
      } catch (e) {
        console.error("Error creating user profile in DB", e);
      }
      
      // 3. Actualizar Auth Profile
      await updateAuthProfile(fbUser, { displayName: name });

      // Establecer usuario inmediatamente
      setUser(newUserProfile);
  };

  // --- LOGOUT REAL ---
  const logout = async () => {
      if (!auth) return;
      await signOut(auth);
      setUser(null);
  };

  // --- SUBIR FOTO REAL (STORAGE) ---
  const uploadPhoto = async (base64Image: string): Promise<string> => {
      if (!storage || !user) throw new Error("Storage no disponible");
      
      const storageRef = ref(storage, `avatars/${user.id}_profile.jpg`);
      
      // Subir string base64
      await uploadString(storageRef, base64Image, 'data_url');
      
      // Obtener URL pública
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
  };

  // --- ACTUALIZAR PERFIL REAL ---
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // Actualización Optimista (Inmediata en UI)
    setUser(prev => prev ? { ...prev, ...data } : null);

    try {
        // Actualizar en Firestore en segundo plano
        if (db) {
            const userDocRef = doc(db, "users", user.id);
            await updateDoc(userDocRef, data);
        }
        // Actualizar en Auth si cambiamos el nombre
        if (auth.currentUser && data.name) {
            await updateAuthProfile(auth.currentUser, { displayName: data.name });
        }
    } catch (e) {
        console.warn("Error syncing profile update", e);
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