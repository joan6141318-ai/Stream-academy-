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
        // Usuario logueado, buscar datos extra en Firestore
        try {
            if (!db) throw new Error("Firestore not initialized");
            
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
            } else {
                // Fallback si no existe doc (raro)
                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || "Usuario",
                    email: firebaseUser.email || "",
                    avatarUrl: firebaseUser.photoURL || "https://picsum.photos/200/200",
                    role: "Streamer"
                });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // FALLBACK CRITICO: Si falla Firestore (offline), usar datos básicos de Auth
            // para que el usuario pueda entrar de todos modos.
            setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Usuario",
                email: firebaseUser.email || "",
                avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
                role: "Streamer (Modo Offline)"
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- LOGIN REAL (OPTIMIZADO) ---
  const login = async (email: string, pass: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      // 1. Autenticar en Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // 2. INYECCIÓN MANUAL DE ESTADO (Fix Race Condition)
      // No esperamos al onAuthStateChanged, actualizamos ya para que el router deje pasar.
      let userProfile: User = {
          id: fbUser.uid,
          name: fbUser.displayName || "Cargando...",
          email: fbUser.email || "",
          avatarUrl: fbUser.photoURL || "https://picsum.photos/200/200",
          role: "Streamer"
      };

      // Intentar obtener datos frescos rápido
      try {
          if (db) {
            const snap = await getDoc(doc(db, "users", fbUser.uid));
            if (snap.exists()) {
                userProfile = { id: fbUser.uid, ...snap.data() } as User;
            }
          }
      } catch (e) {
          console.warn("Fast login profile fetch failed, using basics");
      }

      // Actualizar estado GLOBAL inmediatamente
      setUser(userProfile);
  };

  // --- REGISTRO REAL ---
  const register = async (email: string, pass: string, name: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      // 1. Crear en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // Enviar correo de verificación
      try {
        await sendEmailVerification(fbUser);
      } catch (e) {
        console.warn("No se pudo enviar correo de verificación", e);
      }

      // 2. Crear Perfil en Firestore
      const newUserProfile: User = {
        id: fbUser.uid,
        name: name,
        email: email,
        avatarUrl: "https://ui-avatars.com/api/?background=7c3aed&color=fff&name=" + name,
        role: "Streamer Oficial",
        isAdmin: false
      };

      try {
        if (db) {
            await setDoc(doc(db, "users", fbUser.uid), newUserProfile);
        }
      } catch (e) {
        console.error("Error creating user profile in DB", e);
      }
      
      // 3. Actualizar display name en Auth (opcional pero útil)
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
    
    try {
        // Actualizar en Firestore si es posible
        if (db) {
            const userDocRef = doc(db, "users", user.id);
            await updateDoc(userDocRef, data);
        }
    } catch (e) {
        console.warn("No se pudo actualizar Firestore (Offline?), actualizando localmente", e);
    }

    // Actualizar estado local siempre
    setUser(prev => prev ? { ...prev, ...data } : null);
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