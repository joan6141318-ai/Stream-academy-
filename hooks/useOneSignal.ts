
import { useEffect, useState } from 'react';

// Extend window object to include OneSignal
declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

export const useOneSignal = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      
      window.OneSignalDeferred.push(function(OneSignal: any) {
        try {
            OneSignal.init({
              appId: "3bbf8972-d8cb-4eed-a46b-6059a4f71cd1",
              safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
              notifyButton: {
                enable: false, // Ocultamos la campana flotante para usar nuestro propio botón en Ajustes
              },
              allowLocalhostAsSecureOrigin: true, 
            });

            // Verificar estado actual
            OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
               setIsSubscribed(event.current.optedIn);
            });
            
            // Estado inicial
            setIsSubscribed(OneSignal.User.PushSubscription.optedIn);

            console.log("OneSignal Initialized");
        } catch (error) {
            console.error("OneSignal init error:", error);
        }
      });
    }
  }, []);

  // Función para conectar al botón de Ajustes
  const togglePush = async () => {
      if (typeof window === 'undefined') return;
      
      window.OneSignalDeferred.push(async function(OneSignal: any) {
          const hasPermission = OneSignal.Notifications.permission;
          
          if (!hasPermission) {
              // Si nunca ha dado permiso, lo pedimos (Nativo del celular)
              await OneSignal.Notifications.requestPermission();
          }
          
          if (OneSignal.User.PushSubscription.optedIn) {
              // Si ya está suscrito, lo desactivamos
              OneSignal.User.PushSubscription.optOut();
              setIsSubscribed(false);
          } else {
              // Si no está suscrito, lo activamos
              OneSignal.User.PushSubscription.optIn();
              setIsSubscribed(true);
          }
      });
  };

  return { isSubscribed, togglePush };
};
