const CACHE_VERSION = "quiniela-farrera-v2";
const STATIC_CACHE = CACHE_VERSION + "-static";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  const isApiRequest =
    url.hostname.includes("quiniela-api") ||
    url.pathname.includes("/participants") ||
    url.pathname.includes("/real-results") ||
    url.pathname.includes("/admin");

  const isAppShell =
    request.mode === "navigate" ||
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style";

  if (isApiRequest || isAppShell) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;

          return fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
      )
    );
  }
});
