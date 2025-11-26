// Nombre del caché - Actualizado a v2 para forzar recarga
const CACHE_NAME = 'stream-agency-v2';

// Archivos vitales para que la app arranque offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Instalación del Service Worker
self.addEventListener('install', (event) => {
  // Forzar al nuevo service worker a tomar control inmediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
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
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de los clientes abiertos inmediatamente
      return self.clients.claim();
    })
  );
});

// 3. Estrategia de Red primero, luego Caché (Network First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});