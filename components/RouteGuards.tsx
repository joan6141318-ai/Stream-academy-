import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

/**
 * LOADING GATE
 * Detiene TODA la aplicación hasta que Auth y Content estén listos.
 * Evita race conditions y parpadeos de redirección.
 */
export const LoadingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading: authLoading } = useAuth();
  const { loading: contentLoading } = useContent();

  if (authLoading || contentLoading) {
    return (
      <div className="fixed inset-0 z-[200] bg-white dark:bg-black flex flex-col items-center justify-center transition-colors duration-300">
        <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex flex-col items-center space-y-2 animate-pulse">
            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">
                Cargando
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Sincronizando Sistema...
            </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * AUTH GATE
 * Verifica estrictamente si existe un usuario.
 */
export const AuthGate: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * BLOCKED GATE
 * Verifica si el usuario está bloqueado en la base de datos (Normalizado a booleano).
 * Si está bloqueado, lo manda a /access-denied.
 */
export const BlockedGate: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Normalización estricta: !! convierte undefined/null a false
  const isBlocked = !!user?.isBlocked;

  if (isBlocked) {
    // Evitar bucle infinito si ya estamos ahí
    if (location.pathname === '/access-denied') {
        return <Outlet />;
    }
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

/**
 * MAINTENANCE GATE
 * Maneja la lógica de mantenimiento.
 * Permite el paso si:
 * 1. El modo es 'off'.
 * 2. El usuario es Admin (!!user.isAdmin).
 */
export const MaintenanceGate: React.FC = () => {
  const { user } = useAuth();
  const { homeConfig } = useContent();
  
  const mode = homeConfig?.maintenanceMode || 'off';
  const isAdmin = !!user?.isAdmin;

  // Si hay mantenimiento activo (lockdown o maintenance) Y NO es admin
  if (mode !== 'off' && !isAdmin) {
      return <Navigate to="/maintenance" replace />;
  }

  return <Outlet />;
};

/**
 * ADMIN GATE
 * Solo permite acceso si user.isAdmin es true.
 */
export const AdminGate: React.FC = () => {
    const { user } = useAuth();
    
    if (!user?.isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};
