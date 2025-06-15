const CACHE_NAME = "tic-tac-toe-cache-v1";
const urlsToCache = [
  "/tic.html",
  "/play.html",
  "/game.html",
  "/achievement.html",
  "/toe.js",
  "/tac.css",
  "/assets/logo.png"
];

// Install Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch requests from Cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
