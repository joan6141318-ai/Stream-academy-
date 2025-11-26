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

// Helper to convert Base64 to Blob for robust upload
const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg') => {
  const byteString = window.atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
};

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
        const baseUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Usuario",
            email: firebaseUser.email || "",
            avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
            role: "Streamer"
        };

        // Only fetch if we don't have a user or if it's a fresh load
        try {
            if (db) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser({ ...baseUser, ...userDoc.data() } as User);
                } else {
                    // If doc doesn't exist yet, use baseUser
                    setUser(baseUser);
                }
            } else {
                setUser(baseUser);
            }
        } catch (error: any) {
            // Handle Offline Error Gracefully
            if (error.message && error.message.includes("offline")) {
                console.warn("Firestore offline: Using cached/basic profile.");
            } else {
                console.error("Firestore error:", error);
            }
            // Always fallback to baseUser so app works
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

      // FORCE STATE UPDATE IMMEDIATELY (Optimistic)
      const instantUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || "Usuario",
          email: fbUser.email || "",
          avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${fbUser.displayName || 'User'}`,
          role: "Streamer"
      };
      
      setUser(instantUser);
      setLoading(false);
  };

  // --- REGISTRO ---
  const register = async (email: string, pass: string, name: string) => {
      if (!auth) throw new Error("Firebase no configurado");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      sendEmailVerification(fbUser).catch(e => console.warn("Email verification error", e));

      const newUserProfile: User = {
        id: fbUser.uid,
        name: name,
        email: email,
        avatarUrl: `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${name}`,
        role: "Streamer Oficial",
        isAdmin: false
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

  const uploadPhoto = async (base64Image: string): Promise<string> => {
      if (!storage || !user) throw new Error("Storage no disponible");
      
      try {
          const storageRef = ref(storage, `avatars/${user.id}_profile.jpg`);
          
          // Convert Base64 to Blob for robust upload (Fixes retry-limit-exceeded)
          const blob = base64ToBlob(base64Image);
          
          // Upload Bytes
          await uploadBytes(storageRef, blob);
          
          const downloadURL = await getDownloadURL(storageRef);
          // Append timestamp to force browser cache refresh
          const finalUrl = `${downloadURL}?t=${new Date().getTime()}`;
          return finalUrl;
      } catch (error) {
          console.error("Upload failed:", error);
          throw error;
      }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // 1. Optimistic Update: Update UI immediately
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
        // If offline, silently fail sync but keep local state
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