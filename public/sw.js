const CACHE_NAME = 'psgim-one-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          console.log('Purging cache:', cache);
          return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Let cloud sync pass through directly
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('firebase')) {
    return;
  }

  // Network-first strategy: always fetch fresh bundle, cache as fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return caches.match('/');
        });
      })
  );
});

// 🔔 Lock Screen Interactive Notification Action Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action; // 'present' | 'absent' | ''
  const notifData = event.notification.data || {};

  event.waitUntil(
    (async () => {
      // Broadcast action to all open windows/tabs if any
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (clientList.length > 0) {
        for (const client of clientList) {
          client.postMessage({
            type: 'NOTIFICATION_ATTENDANCE_ACTION',
            action: action || 'open',
            data: notifData,
          });
        }
        if (!action) {
          // Normal tap opens the app
          return clientList[0].focus();
        }
      } else {
        // If app isn't open, open window or quick link
        if (!action) {
          return self.clients.openWindow('/');
        }
      }
    })()
  );
});
