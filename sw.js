
// IMPORTANTE: Importar scripts de OneSignal al inicio para fusionar capacidades
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js');

// Nombre del caché - Actualizado a v30 (Forzar Actualización)
const CACHE_NAME = 'stream-agency-v30-merged';

// Archivos vitales para que la app arranque offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Instalación del Service Worker
self.addEventListener('install', (event) => {
  // Forzar la espera para activar inmediatamente (bueno para actualizaciones críticas)
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activación y limpieza de cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpiando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control inmediato de todas las pestañas abiertas
      return self.clients.claim();
    })
  );
});

// 3. Estrategia de Red primero (Network First)
// Ideal para apps dinámicas: intenta bajar lo más nuevo, si falla, usa caché.
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET (como POST a APIs)
  if (event.request.method !== 'GET') return;

  // Ignorar peticiones a OneSignal o externas que no queramos cachear agresivamente
  if (event.request.url.includes('onesignal.com')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, la clonamos al caché
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red (Offline), buscamos en caché
        return caches.match(event.request).then((response) => {
          if (response) return response;
          
          // Si es una navegación (HTML) y no está en caché, devolver index.html (SPA Fallback)
          if (event.request.mode === 'navigate') {
             return caches.match('/index.html');
          }
        });
      })
  );
});
