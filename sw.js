// Network-first service worker: always serve the latest files when online and
// fall back to the cache offline. Bump VERSION when the precache list changes.
const VERSION = 'v8';
const CACHE = `set-${VERSION}`;

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/main.js',
  'js/router.js',
  'js/home-view.js',
  'js/beach.js',
  'js/settings-panel.js',
  'js/game-view.js',
  'js/modes.js',
  'js/set-game.js',
  'js/set.js',
  'js/cards.js',
  'js/shapes.js',
  'js/icons.js',
  'js/settings.js',
  'js/format.js',
  'js/stats.js',
  'js/storage.js',
  'fonts/notable-latin.woff2',
  'fonts/pacifico-latin.woff2',
  'icons/icon.svg',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => (await caches.match(request, { ignoreSearch: true })) ?? caches.match('./')),
  );
});
