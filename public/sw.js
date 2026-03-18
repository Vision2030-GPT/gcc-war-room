// /public/sw.js — GCC War Room Service Worker
// Handles push notifications and offline caching

const CACHE_NAME = "gcc-war-room-v1";
const OFFLINE_URLS = ["/"];

// Install — cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Push notification received
self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "GCC War Room", body: "New update available", icon: "🛡️" };

  const options = {
    body: data.body || "Check the latest situation update",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.tag || "gcc-update",
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Open War Room" },
      { action: "dismiss", title: "Dismiss" },
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.urgent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "GCC War Room", options)
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes("gcc-war-room") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return clients.openWindow(event.notification.data?.url || "/");
    })
  );
});

// Offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    );
  }
});
