
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
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe">
      <div className="pointer-events-auto bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-full shadow-2xl shadow-black/10 h-14 w-full max-w-[280px] flex items-center justify-between px-3 transition-all duration-300">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path) || (item.label === 'Admin' && location.pathname.startsWith('/admin'));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 active:scale-90 ${
                isActive 
                  ? 'bg-brand-black text-white dark:bg-white dark:text-black shadow-lg transform scale-105' 
                  : 'text-gray-400 hover:text-brand-purple dark:hover:text-white'
              }`}
            >
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className="transition-all duration-200"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
