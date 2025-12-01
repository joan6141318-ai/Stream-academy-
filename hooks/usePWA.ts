
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevenir que el navegador muestre el mini-infobar por defecto (que a veces ni sale)
      e.preventDefault();
      // Guardar el evento para dispararlo cuando queramos (al dar clic al botón)
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt nativo del sistema
    deferredPrompt.prompt();

    // Esperar a que el usuario decida
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, installApp };
};
