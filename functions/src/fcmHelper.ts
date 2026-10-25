import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging, MulticastMessage, BatchResponse } from 'firebase-admin/messaging';

export interface SendPushOptions {
  title: string;
  body: string;
  tokens: string[];
  data?: Record<string, string>;
  imageUrl?: string;
  idempotencyKey?: string;
}

export interface SendPushResult {
  successCount: number;
  failureCount: number;
  invalidTokensRemoved: number;
}

/**
 * Sends FCM Multicast message with batching (max 500 per batch) and automatic cleanup of dead tokens
 */
export async function sendMulticastNotification(options: SendPushOptions): Promise<SendPushResult> {
  const db = getFirestore();
  const messaging = getMessaging();

  // 1. Idempotency Check
  if (options.idempotencyKey) {
    const keyRef = db.collection('idempotency_keys').doc(options.idempotencyKey);
    const doc = await keyRef.get();
    if (doc.exists) {
      console.log(`[FCM] Notification skipped due to duplicate idempotency key: ${options.idempotencyKey}`);
      return { successCount: 0, failureCount: 0, invalidTokensRemoved: 0 };
    }
    await keyRef.set({
      createdAt: FieldValue.serverTimestamp(),
      title: options.title,
    });
  }

  if (!options.tokens || options.tokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokensRemoved: 0 };
  }

  // Deduplicate tokens
  const uniqueTokens = Array.from(new Set(options.tokens));
  let totalSuccess = 0;
  let totalFailure = 0;
  let totalRemoved = 0;

  // 2. Chunk into batches of 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < uniqueTokens.length; i += BATCH_SIZE) {
    const batch = uniqueTokens.slice(i, i + BATCH_SIZE);

    const message: MulticastMessage = {
      tokens: batch,
      notification: {
        title: options.title,
        body: options.body,
        imageUrl: options.imageUrl,
      },
      data: {
        title: options.title,
        body: options.body,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...(options.data || {}),
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'zoodi_orders',
          sound: 'default',
          icon: 'ic_launcher',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: options.title,
              body: options.body,
            },
            badge: 1,
            sound: 'default',
          },
        },
      },
      webpush: {
        notification: {
          title: options.title,
          body: options.body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
        },
        fcmOptions: {
          link: options.data?.deepLink ? `/?deepLink=${encodeURIComponent(options.data.deepLink)}` : '/',
        },
      },
    };

    try {
      const response: BatchResponse = await messaging.sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // 3. Clean up invalid/unregistered tokens
      if (response.failureCount > 0) {
        const deadTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errorCode = resp.error.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              deadTokens.push(batch[idx]);
            }
          }
        });

        if (deadTokens.length > 0) {
          totalRemoved += deadTokens.length;
          console.log(`[FCM] Removing ${deadTokens.length} dead/unregistered tokens from Firestore`);
          const batchOp = db.batch();
          for (const token of deadTokens) {
            const tokenQuery = await db.collection('device_tokens').where('token', '==', token).get();
            tokenQuery.forEach((docSnapshot) => batchOp.delete(docSnapshot.ref));
          }
          await batchOp.commit();
        }
      }
    } catch (error) {
      console.error('[FCM] Error dispatching multicast batch:', error);
      totalFailure += batch.length;
    }
  }

  return {
    successCount: totalSuccess,
    failureCount: totalFailure,
    invalidTokensRemoved: totalRemoved,
  };
}
