// TCG Deck Builder — Service Worker
// Strategies:
//   /_next/static/*  → cache-first  (filenames are content-hashed, immutable)
//   navigate (HTML)  → network-first, fallback to cached shell
//   other same-origin assets → stale-while-revalidate
// Cross-origin requests (card images, price APIs) are never intercepted.

const CACHE = "tcg-builder-v1";

const PRECACHE = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests to the same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // /_next/static/ chunks are immutable (content-hashed) — cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  // Navigation (HTML) — network-first so content stays fresh, offline fallback to "/"
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("/")))
    );
    return;
  }

  // Everything else (icons, fonts, public assets) — stale-while-revalidate
  event.respondWith(
    caches.match(request).then((hit) => {
      const fresh = fetch(request).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
        return res;
      });
      return hit || fresh;
    })
  );
});
