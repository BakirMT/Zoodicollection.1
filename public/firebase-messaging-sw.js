// ZOODI Collection — Firebase Cloud Messaging & Web Push Background Service Worker
/* eslint-disable no-undef */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase compat SDK for background push delivery
const firebaseConfig = {
  apiKey: 'AIzaSyDemoZoodiCollectionKey2026',
  authDomain: 'zoodi-shopping-app.firebaseapp.com',
  projectId: 'zoodi-shopping-app',
  storageBucket: 'zoodi-shopping-app.appspot.com',
  messagingSenderId: '860840935754',
  appId: '1:860840935754:web:e45b18f0a0d98f7e2c91',
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || 'ZOODI Collection';
    const body = payload.notification?.body || payload.data?.body || 'New store notification';
    const deepLink = payload.data?.deepLink || (payload.data?.orderId ? `order:${payload.data.orderId}` : '/');

    const options = {
      body,
      icon: payload.notification?.icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: payload.data?.tag || `zoodi_push_${Date.now()}`,
      vibrate: [150, 75, 150],
      data: {
        deepLink,
        url: payload.data?.url || '/',
        ...payload.data,
      },
      actions: [
        { action: 'open', title: 'Open Store' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    return self.registration.showNotification(title, options);
  });
} catch (err) {
  console.warn('Firebase Messaging compat worker initialization notice:', err);
}

// Fallback Push Event Listener for standard Web Push protocol
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { body: event.data.text() };
  }

  const title = payload.notification?.title || payload.title || 'ZOODI Collection';
  const body = payload.notification?.body || payload.body || payload.message || 'New update';
  const deepLink = payload.data?.deepLink || (payload.data?.orderId ? `order:${payload.data.orderId}` : '/');

  const options = {
    body,
    icon: payload.notification?.icon || '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.tag || `zoodi_${Date.now()}`,
    data: {
      deepLink,
      url: payload.url || '/',
      ...payload.data,
    },
    actions: [
      { action: 'open', title: 'View Details' },
      { action: 'dismiss', title: 'Close' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Deep Link and Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';
  const deepLink = event.notification.data?.deepLink;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'ZOODI_NOTIFICATION_CLICK',
            url: targetUrl,
            deepLink,
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
