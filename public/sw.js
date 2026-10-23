// Looyaal Service Worker — Push notifications + Caching + Click tracking

var CACHE_NAME = 'looyaal-v1'
var CRITICAL_ASSETS = [
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/apple-touch-icon.svg',
]

// Install: cache critical assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CRITICAL_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME }).map(function (k) { return caches.delete(k) })
      )
    })
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return

  // Never intercept cross-origin requests (Supabase, external APIs)
  if (!event.request.url.startsWith(self.location.origin)) return

  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request))
    return
  }

  if (event.request.url.includes('/icons/') || event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request).then(function (response) {
          return caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
    )
    return
  }

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request)
    })
  )
})

// Push notification handling
self.addEventListener('push', function (event) {
  if (!event.data) return

  var data = event.data.json()

  var options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.svg',
    data: {
      url: data.url || '/',
      notificationId: data.notificationId || null,
      customerId: data.customerId || null,
    },
    actions: data.actions || [],
    vibrate: [200, 100, 200],
    tag: data.tag || 'looyaal-notification',
    renotify: true,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Looyaal', options)
  )
})

// Notification click — TRACK the click + open the app
self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  var notifData = event.notification.data || {}
  var url = notifData.url || '/'
  var notificationId = notifData.notificationId
  var customerId = notifData.customerId

  // TRACK: Call click tracking API (LEARN step of the pipeline)
  if (notificationId && customerId) {
    event.waitUntil(
      fetch('/api/push/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notificationId,
          customerId: customerId,
          clickedAt: new Date().toISOString(),
        }),
      }).catch(function () {
        // Silent fail — don't block app opening if tracking fails
      })
    )
  }

  // Open the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.includes(url) && 'focus' in clientList[i]) {
          return clientList[i].focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
