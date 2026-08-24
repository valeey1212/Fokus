// Service Worker für Fokus – cacht die App-Shell, damit die App offline startet.
const CACHE_NAME = 'fokus-shell-v1'
const SCOPE_URL = new URL(self.registration.scope)
const KERN_DATEIEN = [
  SCOPE_URL.pathname,
  `${SCOPE_URL.pathname}manifest.webmanifest`,
  `${SCOPE_URL.pathname}icon-192.png`,
  `${SCOPE_URL.pathname}icon-512.png`,
]

self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(KERN_DATEIEN)).catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (ereignis) => {
  const anfrage = ereignis.request
  if (anfrage.method !== 'GET' || !anfrage.url.startsWith(self.location.origin)) return

  if (anfrage.mode === 'navigate') {
    ereignis.respondWith(
      fetch(anfrage)
        .then((antwort) => {
          const kopie = antwort.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(anfrage, kopie))
          return antwort
        })
        .catch(() => caches.match(anfrage).then((treffer) => treffer || caches.match(SCOPE_URL.pathname))),
    )
    return
  }

  ereignis.respondWith(
    caches.match(anfrage).then((treffer) => {
      if (treffer) return treffer
      return fetch(anfrage).then((antwort) => {
        if (antwort.ok) {
          const kopie = antwort.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(anfrage, kopie))
        }
        return antwort
      })
    }),
  )
})
