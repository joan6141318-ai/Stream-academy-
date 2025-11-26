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

  // 1. Escuchar cambios de sesión (SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Perfil Base (Datos reales de Auth)
        const baseUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuario",
            email: firebaseUser.email || "",
            avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
            role: "Streamer" // Rol por defecto
        };

        try {
            // Intentar enriquecer con Firestore
            if (db) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    // Si existen datos extendidos, fusionarlos
                    const dbData = userDoc.data();
                    setUser({ ...baseUser, ...dbData } as User);
                } else {
                    // Si no existe doc (ej. primer login raro), usar base
                    setUser(baseUser);
                }
            } else {
                setUser(baseUser);
            }
        } catch (error) {
            console.error("Error fetching Firestore profile:", error);
            // FALLBACK CRÍTICO: Si falla la DB, permitir acceso con datos base
            // Esto no es una simulación, son los datos reales de la sesión activa.
            setUser(baseUser);
        }
      } else {
        setUser(null);
      }
      // Solo dejamos de cargar cuando hemos resuelto el usuario final
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- LOGIN ---
  const login = async (email: string, pass: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      // Solo ejecutamos la acción. El listener (useEffect) manejará el estado.
      await signInWithEmailAndPassword(auth, email, pass);
  };

  // --- REGISTRO ---
  const register = async (email: string, pass: string, name: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // Enviar verificación (opcional, no bloqueante)
      sendEmailVerification(fbUser).catch(e => console.warn("Email verification error", e));

      const newUserProfile: User = {
        id: fbUser.uid,
        name: name,
        email: email,
        avatarUrl: `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${name}`,
        role: "Streamer Oficial",
        isAdmin: false
      };

      // Intentar guardar en DB
      try {
        if (db) {
            await setDoc(doc(db, "users", fbUser.uid), newUserProfile);
        }
      } catch (e) {
        console.error("Error creating user profile in DB", e);
      }
      
      // Actualizar perfil básico de Auth
      await updateAuthProfile(fbUser, { displayName: name });
      
      // El listener se encargará de actualizar el estado 'user'
  };

  // --- LOGOUT ---
  const logout = async () => {
      if (!auth) return;
      await signOut(auth);
      // El listener se encargará de poner user en null
  };

  // --- SUBIR FOTO ---
  const uploadPhoto = async (base64Image: string): Promise<string> => {
      if (!storage || !user) throw new Error("Storage no disponible");
      
      const storageRef = ref(storage, `avatars/${user.id}_profile.jpg`);
      await uploadString(storageRef, base64Image, 'data_url');
      
      const downloadURL = await getDownloadURL(storageRef);
      return `${downloadURL}?t=${new Date().getTime()}`; // Cache buster
  };

  // --- ACTUALIZAR PERFIL ---
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // Actualización Optimista para UI (UX Only)
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