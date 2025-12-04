
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Layers, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const navItems = [
    { label: 'Inicio', path: '/home', icon: Home },
    { label: 'Secciones', path: '/training', icon: Layers },
    { label: 'Perfil', path: '/settings', icon: User },
  ];

  // Si es administrador, agregamos el acceso al panel
  if (user?.isAdmin) {
    navItems.push({ label: 'Admin', path: '/admin/selection', icon: Shield });
  }

  useEffect(() => {
    // Buscar el contenedor de scroll (que siempre tiene la clase overflow-y-auto en las páginas principales)
    const findScrollContainer = () => document.querySelector('.overflow-y-auto');
    let scrollContainer = findScrollContainer();
    let interval: any;

    const handleScroll = () => {
        if (!scrollContainer) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        
        // Detectar si estamos al final del scroll (con un margen de 50px)
        // Si el contenido es pequeño y no hay scroll, esto también será true (lo cual es deseado)
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
        
        setIsVisible(isBottom);
    };

    if (!scrollContainer) {
        // Reintentar si el contenedor no se encuentra inmediatamente (debido a transiciones de ruta)
        let retries = 0;
        interval = setInterval(() => {
            scrollContainer = findScrollContainer();
            if (scrollContainer || retries > 10) {
                clearInterval(interval);
                if (scrollContainer) {
                    scrollContainer.addEventListener('scroll', handleScroll);
                    handleScroll(); // Chequeo inicial
                }
            }
            retries++;
        }, 100);
    } else {
        scrollContainer.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    return () => {
        if (interval) clearInterval(interval);
        if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  return (
    <div className={`fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}>
      <div className="pointer-events-auto bg-white/90 dark:bg-[#121212]/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-full shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.9)] h-14 w-full max-w-[280px] flex items-center justify-between px-3 transition-all duration-300">
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
