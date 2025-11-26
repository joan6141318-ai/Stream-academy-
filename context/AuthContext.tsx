import React, { createContext, useContext, useState } from 'react';
// Importamos las instancias de firebaseConfig (asegúrate de haber configurado las claves)
import { auth, db, storage } from '../firebaseConfig';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
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
  const [loading, setLoading] = useState(false);

  // --- LOGIN ---
  const login = async (emailOrId: string, pass: string = "password") => {
      // Simulación Local Simple
      const newUser: User = {
        id: "AGENCY-8821",
        name: "Alex Rivera",
        email: emailOrId.includes('@') ? emailOrId : "alex@agency.com",
        avatarUrl: "https://picsum.photos/200/200?random=user",
        role: "Streamer Oficial"
      };
      
      setUser(newUser);
  };

  // --- REGISTRO ---
  const register = async (email: string, pass: string, name: string) => {
      console.log("Registro simulado:", email);
      login(email);
  };

  // --- LOGOUT ---
  const logout = async () => {
      setUser(null);
  };

  // --- SUBIR FOTO (STORAGE) ---
  const uploadPhoto = async (base64Image: string): Promise<string> => {
      // Simulación: devolvemos la misma base64
      return base64Image;
  };

  // --- ACTUALIZAR PERFIL ---
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
      // Simulación Local
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
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