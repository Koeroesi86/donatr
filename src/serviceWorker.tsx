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
  caches.open(cacheName)
    .then((cache) => cache.addAll(staticFiles));

  sw.skipWaiting();
});

sw.addEventListener('activate', (e) => sw.clients.claim());

const getAssetCacheTimeout = (href: string): number => {
  const url = new URL(href);

  if (url.origin === 'http://localhost:3000') {
    return 0;
  }

  if (url.pathname.match(/^\/api\//)) {
    return 5 * 1000;
  }

  if (url.pathname.match(/^\/static\//)) {
    return 30 * 60 * 1000;
  }

  return 30 * 1000;
};

const shouldCache = (href: string): boolean => {
  const url = new URL(href);

  if (!['http:', 'https:'].includes(url.protocol)) {
    return false;
  }

  if (url.pathname.match(/^\/api\/resolve-access/)) {
    return false;
  }

  return true;
}

sw.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cacheMatch = await cache.match(e.request);
    try {
      if (!sw.navigator.onLine) {
        return cacheMatch;
      }

      if (
        cacheMatch
        && cacheMatch.headers.has('Date')
        && new Date(cacheMatch.headers.get('Date')).valueOf() < (Date.now() - getAssetCacheTimeout(cacheMatch.url))
      ) {
        return cacheMatch;
      }

      const response = await fetch(e.request);
      if (response.status < 400 && response.status > 100 && shouldCache(e.request.url)) {
        const clonedResponse = response.clone();
        cache.put(e.request, clonedResponse).catch(console.error);
      }
      return response;
    } catch (err) {
      if (cacheMatch) return cacheMatch;
      throw err;
    }
  })());
}, { passive: true });