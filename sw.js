const CACHE_NAME = 'finanzas-cache-v2';
const STATIC = ['./manifest.json', './icon.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // HTML: network first → actualiza siempre, cae a caché si offline
  if (event.request.mode === 'navigate' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Assets: caché primero
    event.respondWith(
      caches.match(event.request).then(res => res || fetch(event.request))
    );
  }
});
