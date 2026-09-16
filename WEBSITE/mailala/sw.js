const CACHE_NAME = 'mailala-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.min.css',
  '/main.min.js',
  '/manifest.json',
  '/assets/images/6134195124376899495_121.jpg',
  '/assets/images/6134195124376899502_121.jpg',
  '/assets/images/6134195124376899500_121.jpg',
  '/assets/images/6134195124376899497_121.jpg',
  '/assets/images/6134195124376899499_121.jpg',
  '/assets/images/6134195124376899494_121.jpg',
  '/assets/images/6134195124376899513_121.jpg',
  '/assets/images/6134195124376899514_121.jpg',
  '/assets/images/6134195124376899515_121.jpg',
  '/assets/images/6134195124376899512_121.jpg',
  '/assets/images/6134195124376899511_121.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
