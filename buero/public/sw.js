// Cacht die App-Hülle, damit das Büro auch ohne Netz startet.
// Die Modellaufrufe brauchen natürlich weiterhin eine Verbindung.
const CACHE = 'buero-v1'

self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png'])),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches.keys().then((namen) => Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (ereignis) => {
  const anfrage = ereignis.request
  if (anfrage.method !== 'GET') return
  const url = new URL(anfrage.url)
  if (url.origin !== self.location.origin) return

  ereignis.respondWith(
    caches.match(anfrage).then((treffer) => {
      const netz = fetch(anfrage)
        .then((antwort) => {
          const kopie = antwort.clone()
          caches.open(CACHE).then((cache) => cache.put(anfrage, kopie)).catch(() => {})
          return antwort
        })
        .catch(() => treffer ?? caches.match('./index.html'))
      return treffer ?? netz
    }),
  )
})
