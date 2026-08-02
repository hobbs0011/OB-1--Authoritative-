// sw.js — Natural English Training PWA Service Worker
// Cache-first for assets, network-first for API, offline fallback for chat

const CACHE_NAME = "net-obi-v1";
const OFFLINE_PAGE = "/offline.html";
const PRECACHE = [
  "/",
  "/index.html",
  OFFLINE_PAGE,
];

// ── Install: precache shell ───────────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: purge old caches ────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ────────────────────────────────────────
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // API routes: network-first, no cache fallback (stale data = wrong data)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .catch(() => new Response(JSON.stringify({ error: "offline", message: "You are offline. Connect to chat with Obi." }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }))
    );
    return;
  }

  // Navigation: network-first with offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  // Everything else: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(res => {
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      });
      return cached || networkFetch;
    })
  );
});

// ── Push notifications (streak accountability) ────────────
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  const title = data.title || "Natural English Training";
  const options = {
    body: data.body || "Obi is waiting. Keep your streak alive.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "net-reminder",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});