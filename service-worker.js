const CACHE_NAME = 'signbridge-v16';
const APP_SHELL = [
  './',
  './index.html',
  './assets/styles/main.css',
  './assets/scripts/sign-library.js',
  './assets/scripts/sign-lookup.js',
  './assets/scripts/sign-render.js',
  './assets/scripts/app.js',
  './assets/scripts/practice.js',
  './assets/scripts/calibration-store.js',
  './manifest.json'
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
      cache.match(event.request).then(cached => cached || fetch(event.request))
    )
  );
});
