const CACHE_NAME = 'signbridge-v21';
const APP_SHELL = [
  './?v=21',
  './index.html?v=21',
  './assets/styles/main.css?v=21',
  './assets/scripts/sign-library.js?v=21',
  './assets/scripts/sign-lookup.js?v=21',
  './assets/scripts/sign-render.js?v=21',
  './assets/scripts/app.js?v=21',
  './assets/scripts/practice.js?v=21',
  './assets/scripts/calibration-store.js?v=21',
  './manifest.json?v=21'
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
