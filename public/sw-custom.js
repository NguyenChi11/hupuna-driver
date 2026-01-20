self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister();
      } catch {}
      try {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        await Promise.all(
          clients.map((c) => {
            try {
              return c.navigate(c.url);
            } catch {
              return null;
            }
          }),
        );
      } catch {}
    })(),
  );
});

