import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

// Hook para gestionar el color de la barra de estado dinámicamente
const useDynamicTheme = () => {
  useEffect(() => {
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const color = isDark ? '#000000' : '#ffffff'; // Negro puro para OLED, Blanco para Light
      
      let metaThemeColor = document.querySelector("meta[name=theme-color]");
      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.setAttribute("name", "theme-color");
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute("content", color);
    };

    // 1. Ejecutar al inicio
    updateThemeColor();

    // 2. Observar cambios en la clase 'dark' del elemento <html>
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateThemeColor();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);
};

export const MainLayout: React.FC = () => {
  // Activar gestión de tema dinámico
  useDynamicTheme();

  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      {/* Content Area */}
      <div className="flex-1 h-full overflow-hidden relative">
        <Outlet />
      </div>
      
      {/* Navigation */}
      <BottomNav />
    </div>
  );
};