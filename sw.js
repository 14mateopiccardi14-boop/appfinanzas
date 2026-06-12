const CACHE_NAME = 'finanzas-cache-v4';
const STATIC = ['./manifest.json', './icon.png', './icon-maskable-192.png', './icon-maskable-512.png'];

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
  } else if (event.request.method === 'GET') {
    // Assets (incluye Chart.js del CDN y fuentes de Google): caché primero,
    // y lo que baja de la red se guarda para que funcione offline
    event.respondWith(
      caches.match(event.request).then(res => {
        if (res) return res;
        return fetch(event.request).then(netRes => {
          if (netRes && (netRes.ok || netRes.type === 'opaque')) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          }
          return netRes;
        });
      })
    );
  }
});
