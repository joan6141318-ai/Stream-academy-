import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Layers, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { label: 'Inicio', path: '/home', icon: Home },
    { label: 'Secciones', path: '/training', icon: Layers },
    { label: 'Perfil', path: '/settings', icon: User },
  ];

  // Si es administrador, agregamos el acceso al panel
  if (user?.isAdmin) {
    navItems.push({ label: 'Admin', path: '/admin/selection', icon: Shield });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-white/10 pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] transition-colors duration-300">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          // Check especial para rutas anidadas de admin
          const isActive = location.pathname.startsWith(item.path) || (item.label === 'Admin' && location.pathname.startsWith('/admin'));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 active:scale-95 transition-transform ${
                isActive ? 'text-brand-purple dark:text-brand-purple' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
              }`}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className="transition-all duration-200"
              />
              <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'opacity-100' : 'opacity-0 scale-90 hidden'}`}>
                {item.label}
              </span>
              {!isActive && <span className="text-[10px] font-medium opacity-0">{item.label}</span>} 
            </button>
          );
        })}
      </div>
    </div>
  );
};