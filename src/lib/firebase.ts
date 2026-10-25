import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';

// Firebase Web App Client Configuration
// Reads from Vite client environment variables or fallback project identifiers
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoZoodiCollectionKey2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'zoodi-shopping-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'zoodi-shopping-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'zoodi-shopping-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '860840935754',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:860840935754:web:e45b18f0a0d98f7e2c91',
};

// Web Push Public VAPID Key for Browser Token Exchange
export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDZKrxZ_09vPlf95xGwbq_2F1uW3eM93lA8T_07zY16w';

let appInstance: FirebaseApp;
if (!getApps().length) {
  appInstance = initializeApp(firebaseConfig);
} else {
  appInstance = getApp();
}

export const firebaseApp = appInstance;

let messagingInstance: Messaging | null = null;

/**
 * Initializes and retrieves the Firebase Messaging instance safely
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return null;
  }

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(firebaseApp);
    } catch (err) {
      console.warn('Firebase Messaging init error:', err);
      return null;
    }
  }

  return messagingInstance;
}

/**
 * Requests an authentic FCM device registration token with VAPID key
 */
export async function getFCMToken(swRegistration?: ServiceWorkerRegistration): Promise<string | null> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    let registration = swRegistration;
    if (!registration && 'serviceWorker' in navigator) {
      registration = (await navigator.serviceWorker.getRegistration('/')) || undefined;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      localStorage.setItem('zoodi_fcm_device_token', token);
      localStorage.setItem('zoodi_fcm_platform', 'web');
      localStorage.setItem('zoodi_fcm_synced_at', new Date().toISOString());
      return token;
    }

    return null;
  } catch (error) {
    console.warn('FCM token acquisition warning:', error);
    return null;
  }
}

/**
 * Listens for FCM notifications received while the app is in the foreground
 */
export async function setupForegroundNotificationListener(
  callback: (payload: { title: string; body: string; data?: Record<string, any> }) => void
): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || 'ZOODI Collection';
    const body = payload.notification?.body || payload.data?.body || 'New store notification';
    callback({ title, body, data: payload.data });
  });
}
