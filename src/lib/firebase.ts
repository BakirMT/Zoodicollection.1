import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';
import configJson from '../../firebase-applet-config.json';

// Firebase Web App Client Configuration
// Reads from Vite client environment variables or the provisioned applet configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configJson.appId,
  firestoreDatabaseId: configJson.firestoreDatabaseId || '(default)',
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

// Firestore Database instance (connected to provisioned database)
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
    : getFirestore(firebaseApp);

// Firebase Authentication instance
export const auth: Auth = getAuth(firebaseApp);

// Firebase Cloud Storage instance
export const storage: FirebaseStorage = getStorage(firebaseApp);

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

/**
 * Validates connectivity to the provisioned Firestore database
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const { doc, getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'system_health', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or Firestore config needs attention:', error);
    }
    return false;
  }
}
