const CACHE_NAME = 'signbridge-v24';
const APP_SHELL = [
  './?v=24',
  './index.html?v=24',
  './assets/styles/main.css?v=24',
  './assets/scripts/sign-library.js?v=24',
  './assets/scripts/sign-lookup.js?v=24',
  './assets/scripts/sign-render.js?v=24',
  './assets/scripts/app.js?v=24',
  './assets/scripts/practice.js?v=24',
  './assets/scripts/calibration-store.js?v=24',
  './manifest.json?v=24'
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
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request))
    )
  );
});
