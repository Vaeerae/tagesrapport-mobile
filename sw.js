// Service Worker: hält die App-Dateien im Gerät vor, damit die Web-App auch ohne Empfang startet.
// Daten (Rapporte, Fotos) liegen nicht hier, sondern in der IndexedDB der App und in OneDrive.
const CACHE = 'tagesrapport-0.9.0';
const DATEIEN = ['./', './index.html', './app.js', './app.css', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './microsoft.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Startseite: zuerst Netz (neue Version), sonst Zwischenspeicher
  if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(e.request).then((r) => { const k = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', k)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((c) => c || fetch(e.request).then((r) => { if (r.ok) { const k = r.clone(); caches.open(CACHE).then((c2) => c2.put(e.request, k)); } return r; })));
});
