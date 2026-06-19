// TCG Deck Builder — Service Worker
// Strategies:
//   /_next/static/*  → cache-first  (filenames are content-hashed, immutable)
//   navigate (HTML)  → network-first, fallback to cached shell
//   card image CDNs  → cache-first  (separate image cache, populated on first view)
//   other same-origin assets → stale-while-revalidate
// Price API requests are never intercepted (cross-origin, not images).

const CACHE = "tcg-builder-v1";
const IMAGE_CACHE = "tcg-images-v1";

// Hostnames of card image CDNs — derived from card-images.ts
const IMAGE_HOSTS = new Set([
  "images.ygoprodeck.com",
  "images.pokemontcg.io",
  "en.onepiece-cardgame.com",
  "world.digimoncard.com",
  "www.gundam-gcg.com",
  "cdn.swu-db.com",
  "cdn.rgpub.io",
  "cards.lorcast.io",
  "limitlesstcg.nyc3.cdn.digitaloceanspaces.com",
]);

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
        Promise.all(
          keys
            .filter((k) => k !== CACHE && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Card images from known CDN hostnames — cache-first, stored in image cache.
  // Opaque responses (no CORS) are cached as-is; browsers can render them in <img>.
  if (request.method === "GET" && IMAGE_HOSTS.has(url.hostname)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request)
          .then((res) => {
            if (res.ok || res.type === "opaque") {
              caches.open(IMAGE_CACHE).then((c) => c.put(request, res.clone()));
            }
            return res;
          })
          .catch(() => Response.error());
      })
    );
    return;
  }

  // Only handle GET requests to the same origin below this point
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
