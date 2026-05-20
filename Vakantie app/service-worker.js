// Vakantie App - Service Worker
const CACHE_NAME = 'vakantie-app-v1';

// Bestanden die gecached worden voor offline gebruik
const ASSETS_TO_CACHE = [
  '/Vakantie-App/',
  '/Vakantie-App/index.html',
  '/Vakantie-App/manifest.json'
];

// Installatie: cache de basis-bestanden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activatie: verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: eerst uit cache, anders via netwerk
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Sla nieuwe resources op in de cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback bij geen internet
        return caches.match('/Vakantie-App/index.html');
      });
    })
  );
});
