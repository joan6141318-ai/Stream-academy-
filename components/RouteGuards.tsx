
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

/**
 * LOADING GATE
 * Bloqueo global: No renderiza NADA hasta que Auth y Content estén listos.
 * Esto evita el "flash" de contenido bloqueado o login.
 */
export const LoadingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading: authLoading } = useAuth();
  const { loading: contentLoading } = useContent();

  if (authLoading || contentLoading) {
    return (
      <div className="fixed inset-0 z-[200] bg-white dark:bg-black flex flex-col items-center justify-center transition-colors duration-300">
        <div className="relative w-24 h-24 mb-8 animate-fade-in">
            <div className="absolute inset-0 border-4 border-gray-100 dark:border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-2xl">🚀</span>
            </div>
        </div>
        <div className="flex flex-col items-center space-y-2 animate-pulse">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-black dark:text-white">
                Iniciando
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Sincronizando Perfil...
            </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * AUTH GATE
 * Verifica si el usuario está logueado.
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
 * Si el usuario tiene isBlocked=true, lo manda a /access-denied.
 */
export const BlockedGate: React.FC = () => {
  const { user } = useAuth();

  // Aseguramos booleano estricto
  if (user?.isBlocked === true) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

/**
 * MAINTENANCE GATE
 * Verifica el modo de mantenimiento y permisos de Admin.
 */
export const MaintenanceGate: React.FC = () => {
  const { user } = useAuth();
  const { homeConfig } = useContent();
  
  const mode = homeConfig?.maintenanceMode || 'off';
  const isAdmin = !!user?.isAdmin;

  // Si hay mantenimiento y NO es admin, bloquear.
  if (mode !== 'off' && !isAdmin) {
      return <Navigate to="/maintenance" replace />;
  }

  return <Outlet />;
};

/**
 * ADMIN GATE
 * Solo permite acceso a administradores.
 */
export const AdminGate: React.FC = () => {
    const { user } = useAuth();
    
    if (!user?.isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};
