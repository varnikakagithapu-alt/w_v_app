const CACHE_NAME = 'signbridge-v35';
const APP_SHELL = [
  './?v=35',
  './index.html?v=35',
  './assets/styles/main.css?v=35',
  './assets/scripts/sign-library.js?v=35',
  './assets/scripts/sign-lookup.js?v=35',
  './assets/scripts/sign-render.js?v=35',
  './assets/scripts/app.js?v=35',
  './assets/scripts/learning.js?v=35',
  './assets/scripts/practice.js?v=35',
  './assets/scripts/calibration-store.js?v=35',
  './manifest.json?v=35'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()))
            );
          }
          return response;
        })
        .catch(error => caches.open(CACHE_NAME)
          .then(cache => cache.match(event.request, { ignoreSearch: true }))
          .then(cached => {
            if (cached) return cached;
            throw error;
          }))
    );
    return;
  }
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request))
    )
  );
});
