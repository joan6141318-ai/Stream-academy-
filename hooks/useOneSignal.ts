
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
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Leer estado inicial del navegador (Verdadera fuente de verdad)
      if ('Notification' in window) {
          setPermissionStatus(Notification.permission);
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      
      window.OneSignalDeferred.push(function(OneSignal: any) {
        try {
            OneSignal.init({
              appId: "3bbf8972-d8cb-4eed-a46b-6059a4f71cd1",
              safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
              notifyButton: {
                enable: false, 
              },
              allowLocalhostAsSecureOrigin: true, 
            });

            // Verificar estado de suscripción en OneSignal
            OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
               setIsSubscribed(event.current.optedIn);
               setSubscriptionId(event.current.id);
            });
            
            // Listener para cambios de permisos (si el usuario los cambia en el navegador)
            OneSignal.Notifications.addEventListener("permissionChange", (permission: boolean) => {
                const status = permission ? 'granted' : 'denied';
                // @ts-ignore
                setPermissionStatus(status);
            });
            
            // Estado inicial OneSignal
            const optedIn = OneSignal.User.PushSubscription.optedIn;
            const id = OneSignal.User.PushSubscription.id;
            
            setIsSubscribed(optedIn);
            setSubscriptionId(id);

        } catch (error) {
            console.error("OneSignal init error:", error);
        }
      });
    }
  }, []);

  const togglePush = async () => {
      if (typeof window === 'undefined') return;
      
      window.OneSignalDeferred.push(async function(OneSignal: any) {
          // Obtener estado real del navegador
          const currentPermission = Notification.permission;

          if (currentPermission === 'denied') {
              alert("⚠️ Las notificaciones están bloqueadas en tu navegador.\n\nPara activarlas:\n1. Toca el candado 🔒 en la barra de dirección.\n2. Ve a 'Permisos' o 'Configuración del sitio'.\n3. Activa 'Notificaciones' y recarga la página.");
              return;
          }

          if (currentPermission === 'default') {
              console.log("Solicitando permiso nativo...");
              try {
                  const accepted = await OneSignal.Notifications.requestPermission();
                  if (accepted) {
                      OneSignal.User.PushSubscription.optIn();
                      setIsSubscribed(true);
                      setPermissionStatus('granted');
                  } else {
                      setPermissionStatus('denied');
                      alert("Has denegado el permiso. No podrás recibir alertas.");
                  }
              } catch (e) {
                  console.error("Error pidiendo permiso", e);
              }
              return;
          }
          
          // Si ya tiene permiso ('granted'), actuamos sobre el interruptor de OneSignal
          if (currentPermission === 'granted') {
              if (OneSignal.User.PushSubscription.optedIn) {
                  console.log("Desactivando suscripción...");
                  OneSignal.User.PushSubscription.optOut();
                  setIsSubscribed(false);
              } else {
                  console.log("Activando suscripción...");
                  OneSignal.User.PushSubscription.optIn();
                  setIsSubscribed(true);
              }
          }
      });
  };

  return { isSubscribed, togglePush, subscriptionId, permissionStatus };
};
