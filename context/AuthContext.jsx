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
import { auth, db, storage } from '../firebaseConfig.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        console.error("AuthContext: Auth module not initialized (network/config error)");
        setLoading(false);
        return;
    }

    const safetyTimer = setTimeout(() => {
        if (loading) {
            console.warn("Firebase slow response - Forcing UI load");
            setLoading(false);
        }
    }, 3000);

    try {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          clearTimeout(safetyTimer);

          if (firebaseUser) {
            const baseUser = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Usuario",
                email: firebaseUser.email || "",
                avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${firebaseUser.displayName || 'User'}`,
                role: "Streamer"
            };

            try {
                if (db) {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUser({ ...baseUser, ...userDoc.data() });
                    } else {
                        setUser(baseUser);
                    }
                } else {
                    setUser(baseUser);
                }
            } catch (error) {
                console.warn("Firestore offline/error: Using cached/basic profile.", error);
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
    } catch (e) {
        console.error("Auth State Observer Error:", e);
        setLoading(false);
    }
  }, []); 

  const login = async (email, pass) => {
      if (!auth) throw new Error("Firebase no configurado o bloqueado por red.");
      
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = credential.user;

      const instantUser = {
          id: fbUser.uid,
          name: fbUser.displayName || "Usuario",
          email: fbUser.email || "",
          avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?background=7c3aed&color=fff&name=${fbUser.displayName || 'User'}`,
          role: "Streamer"
      };
      
      setUser(instantUser);
      setLoading(false);
  };

  const register = async (email, pass, name) => {
      if (!auth) throw new Error("Firebase no configurado o bloqueado por red.");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      sendEmailVerification(fbUser).catch(e => console.warn("Email verification error", e));

      const newUserProfile = {
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
        if (auth && auth.currentUser) {
            await updateAuthProfile(auth.currentUser, { displayName: name });
        }
      } catch (e) {
        console.error("Error creating user profile in DB", e);
      }
  };

  const logout = async () => {
      if (!auth) return;
      await signOut(auth);
      setUser(null);
  };

  const uploadPhoto = async (file, base64Fallback) => {
      if (!user) throw new Error("No authenticated user");
      
      if (storage) {
          try {
              const storageRef = ref(storage, `avatars/${user.id}_profile.jpg`);
              await uploadBytes(storageRef, file);
              const downloadURL = await getDownloadURL(storageRef);
              return `${downloadURL}?t=${new Date().getTime()}`; 
          } catch (error) {
              console.warn("Storage upload failed (permissions/network). Switching to Base64 fallback.", error);
          }
      }

      if (base64Fallback) {
          return base64Fallback;
      }

      throw new Error("No se pudo subir la imagen ni usar el respaldo.");
  };

  const updateProfile = async (data) => {
    if (!user) return;
    
    setUser(prev => prev ? { ...prev, ...data } : null);

    try {
        if (db) {
            const userDocRef = doc(db, "users", user.id);
            await setDoc(userDocRef, data, { merge: true });
        }
        
        if (auth && auth.currentUser) {
            const authUpdates = {};
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