
import { useEffect, useState } from 'react';

// Extend window object to include OneSignal
declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

export const useOneSignal = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

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
               setSubscriptionId(event.current.id);
               console.log("OneSignal State Changed:", event.current);
            });
            
            // Estado inicial
            const optedIn = OneSignal.User.PushSubscription.optedIn;
            const id = OneSignal.User.PushSubscription.id;
            
            setIsSubscribed(optedIn);
            setSubscriptionId(id);
            
            console.log("OneSignal Initialized. Subscribed:", optedIn);
            console.log("OneSignal ID:", id);

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
          // 1. Check if permission exists
          let hasPermission = OneSignal.Notifications.permission;
          
          if (!hasPermission) {
              console.log("Requesting native permission...");
              // 2. Request permission if needed
              const granted = await OneSignal.Notifications.requestPermission();
              hasPermission = granted;
          }
          
          // 3. If granted, toggle subscription
          if (hasPermission) {
              if (OneSignal.User.PushSubscription.optedIn) {
                  console.log("Opting OUT");
                  OneSignal.User.PushSubscription.optOut();
                  setIsSubscribed(false);
              } else {
                  console.log("Opting IN");
                  OneSignal.User.PushSubscription.optIn();
                  setIsSubscribed(true);
              }
          } else {
              alert("Debes permitir las notificaciones en la configuración de tu navegador para activar esta función.");
          }
      });
  };

  return { isSubscribed, togglePush, subscriptionId };
};
