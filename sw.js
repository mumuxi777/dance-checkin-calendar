// Minimal, deliberately "boring" service worker.
//
// Chrome/Android requires an active service worker with a fetch handler
// before it will offer the "install as app" prompt, so the site needs one
// registered at all times. But an earlier version of this file cached
// pages, and that caused real bugs: some browsers held onto stale cached
// content indefinitely and never picked up fixes, even ones specifically
// meant to prevent that (see project notes). So this version does the
// bare minimum to stay installable and nothing else -- every request is
// passed straight through to the network, uncached, every time.
const OLD_CACHE_NAMES_TO_CLEAN_UP = ['dance-checkin-v1', 'dance-checkin-v2', 'dance-checkin-v3'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => OLD_CACHE_NAMES_TO_CLEAN_UP.includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
