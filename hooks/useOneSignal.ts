
import { useEffect } from 'react';

// Extend window object to include OneSignal
declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

export const useOneSignal = () => {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      
      window.OneSignalDeferred.push(function(OneSignal: any) {
        try {
            OneSignal.init({
              // --- CONFIGURACIÓN REAL ---
              appId: "3bbf8972-d8cb-4eed-a46b-6059a4f71cd1",
              safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
              
              notifyButton: {
                enable: true, // Muestra la campanita roja de suscripción (útil para pruebas)
              },
              
              // Permite probar en localhost y en tu dominio real
              allowLocalhostAsSecureOrigin: true, 
            });
            
            // Opcional: Descomenta esto si quieres que el navegador pida permiso apenas entran (agresivo)
            // OneSignal.showSlidedownPrompt(); 
            
            console.log("OneSignal Initialized");
        } catch (error) {
            console.error("OneSignal init error:", error);
        }
      });
    }
  }, []);
};
