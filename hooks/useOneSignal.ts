
import { useEffect, useState, useRef } from 'react';
import { ONESIGNAL_APP_ID } from '../constants';

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
  
  // CANDADO DE INICIALIZACIÓN
  const initDone = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initDone.current) {
      
      // Leer estado inicial del navegador (Verdadera fuente de verdad)
      if ('Notification' in window) {
          const status = Notification.permission;
          setPermissionStatus(status);
          // Si está bloqueado nativamente, forzar estado visual a false
          if (status === 'denied') {
              setIsSubscribed(false);
          }
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      
      window.OneSignalDeferred.push(function(OneSignal: any) {
        try {
            if (initDone.current) return; // Doble check por seguridad interna de la librería
            
            OneSignal.init({
              appId: ONESIGNAL_APP_ID,
              safari_web_id: "web.onesignal.auto.5f4f9ed9-fb2e-4d6a-935d-81aa46fccce0",
              notifyButton: {
                enable: false, 
              },
              allowLocalhostAsSecureOrigin: true, 
            });

            // Marcar como inicializado
            initDone.current = true;

            // Verificar estado de suscripción en OneSignal
            OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
               const currentPerm = Notification.permission;
               if (currentPerm === 'denied') {
                   setIsSubscribed(false);
               } else {
                   setIsSubscribed(event.current.optedIn);
               }
               setSubscriptionId(event.current.id);
            });
            
            // Listener para cambios de permisos (si el usuario los cambia en el navegador)
            OneSignal.Notifications.addEventListener("permissionChange", (permission: boolean) => {
                const status = permission ? 'granted' : 'denied';
                // @ts-ignore
                setPermissionStatus(status);
                if (!permission) setIsSubscribed(false);
            });
            
            // Estado inicial OneSignal
            const optedIn = OneSignal.User.PushSubscription.optedIn;
            const id = OneSignal.User.PushSubscription.id;
            
            if (Notification.permission === 'denied') {
                setIsSubscribed(false);
            } else {
                setIsSubscribed(optedIn);
            }
            setSubscriptionId(id);

        } catch (error) {
            console.error("OneSignal init error:", error);
        }
      });
    }
  }, []);

  const togglePush = async () => {
      if (typeof window === 'undefined') return;
      
      const currentPermission = Notification.permission;

      if (currentPermission === 'denied') {
          alert("🔒 PERMISO BLOQUEADO\n\nEl navegador ha bloqueado las notificaciones para este sitio.\n\nSOLUCIÓN:\n1. Toca el icono de candado 🔒 o ajustes en la barra de dirección.\n2. Busca 'Permisos' > 'Notificaciones'.\n3. Pulsa 'Restablecer' o cámbialo a 'Permitir'.\n4. Recarga la página.");
          return;
      }

      window.OneSignalDeferred.push(async function(OneSignal: any) {
          if (currentPermission === 'default') {
              console.log("Solicitando permiso nativo...");
              try {
                  const accepted = await OneSignal.Notifications.requestPermission();
                  if (accepted) {
                      await OneSignal.User.PushSubscription.optIn();
                      setIsSubscribed(true);
                      setPermissionStatus('granted');
                  } else {
                      setPermissionStatus('denied');
                      setIsSubscribed(false);
                      alert("Has denegado el permiso. Para activarlo después, deberás hacerlo desde la configuración del navegador.");
                  }
              } catch (e) {
                  console.error("Error pidiendo permiso", e);
              }
              return;
          }
          
          // Si ya tiene permiso ('granted'), actuamos sobre el interruptor de OneSignal
          if (currentPermission === 'granted') {
              if (isSubscribed) {
                  console.log("Desactivando suscripción...");
                  await OneSignal.User.PushSubscription.optOut();
                  setIsSubscribed(false);
              } else {
                  console.log("Activando suscripción...");
                  await OneSignal.User.PushSubscription.optIn();
                  setIsSubscribed(true);
              }
          }
      });
  };

  return { isSubscribed, togglePush, subscriptionId, permissionStatus };
};
