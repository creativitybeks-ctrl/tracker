self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('discipline-v1').then(cache => cache.addAll(['/','/manifest.webmanifest'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});
