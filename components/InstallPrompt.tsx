
import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isInstallable || !isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-brand-black dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple via-pink-500 to-brand-purple animate-pulse"></div>

        <div className="flex items-center space-x-4 z-10">
            <div className="bg-white/10 dark:bg-black/10 p-3 rounded-xl backdrop-blur-sm">
                <Download size={24} className="text-brand-purple" />
            </div>
            <div>
                <h3 className="text-sm font-black uppercase tracking-wide leading-none mb-1">
                    Instalar App
                </h3>
                <p className="text-[10px] opacity-80 font-medium">
                    Agrega StreamAgency a tu inicio para un acceso más rápido.
                </p>
            </div>
        </div>

        <div className="flex items-center space-x-2 z-10">
            <button 
                onClick={installApp}
                className="bg-brand-purple text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
                Instalar
            </button>
            <button 
                onClick={() => setIsVisible(false)}
                className="p-2 opacity-50 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};
