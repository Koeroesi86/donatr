const cacheName = 'help-koro-si-v1';

// eslint-disable-next-line no-restricted-globals
const sw: ServiceWorkerGlobalScope & typeof globalThis = self as any;

const staticFiles = [
  '/static/leaflet.css',
  '/static/images/layers.png',
  '/static/images/layers-2x.png',
  '/static/images/marker-icon.png',
  '/static/images/marker-icon-2x.png',
  '/static/images/marker-shadow.png',
];

sw.addEventListener('install', (e) => {
  // e.waitUntil();

  caches.open(cacheName)
    .then((cache) => cache.addAll(staticFiles));
});

sw.addEventListener('activate', (e) => sw.clients.claim());

sw.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(e.request);
      const url = new URL(e.request.url);
      if (['http:', 'https:'].includes(url.protocol) && response.status < 400 && response.status > 100) {
        const clonedResponse = response.clone();
        await cache.put(e.request, clonedResponse);
      }
      return response;
    } catch (err) {
      const response = await cache.match(e.request);
      console.log(err)
      if (response) return response;
      throw err;
    }
  })());
});