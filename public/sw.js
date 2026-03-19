// Minimal service worker for PWA install prompt.
// No offline caching — just makes the app installable.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
