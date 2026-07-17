// This app previously used a caching service worker, but that caused
// real bugs: some browsers held onto an old worker indefinitely and never
// picked up later fixes, even ones specifically meant to prevent that.
// This version's only job is to clean up any old worker/cache it finds
// and then remove itself, so the site always loads plainly from the
// network like a normal page.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
