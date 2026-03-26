// Smart Ledger — Service Worker (offline-first)
const CACHE_NAME = 'smart-ledger-v1';
const ASSETS = [
  '.',
  './index.html',
  './css/app.css',
  './js/db.js',
  './js/auth.js',
  './js/router.js',
  './js/views/login.js',
  './js/views/setup.js',
  './js/views/dashboard.js',
  './js/views/customer.js',
  './js/views/detail.js',
  './js/views/transaction.js',
  './js/app.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(ASSETS.map(url => cache.add(url).catch(() => {})));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  if (evt.request.method !== 'GET') return;
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      const fetchFresh = fetch(evt.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(evt.request, clone));
          }
          return res;
        });
      return cached || fetchFresh;
    }).catch(() => caches.match('./index.html'))
  );
});
