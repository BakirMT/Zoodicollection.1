import * as functions from 'firebase-functions';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { sendMulticastNotification } from './fcmHelper';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

/**
 * TRIGGER 1: Order Created
 * Automatically sends:
 * 1. Customer order confirmation
 * 2. Admin new order alert
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const orderData = snap.data();
    if (!orderData) return;

    const customerId = orderData.customerId;
    const totalAmount = Math.round(orderData.amounts?.total || 0).toLocaleString('en-IN');
    const paymentMethod = (orderData.payment?.method || 'cod').toUpperCase();

    // 1. Send Customer Order Placed Notification
    if (customerId) {
      const customerTokensSnap = await db
        .collection('device_tokens')
        .where('userId', '==', customerId)
        .get();

      const customerTokens = customerTokensSnap.docs.map((d) => d.data().token).filter(Boolean);

      if (customerTokens.length > 0) {
        await sendMulticastNotification({
          title: 'Order Placed Successfully! 🎉',
          body: `Your order #${orderId} for ₹${totalAmount} has been received.`,
          tokens: customerTokens,
          data: {
            deepLink: `order:${orderId}`,
            orderId,
            type: 'order_status',
          },
          idempotencyKey: `order_placed_${orderId}`,
        });
      }
    }

    // 2. Send Admin New Order Notification
    const adminTokensSnap = await db
      .collection('device_tokens')
      .where('role', '==', 'admin')
      .get();

    const adminTokens = adminTokensSnap.docs.map((d) => d.data().token).filter(Boolean);

    if (adminTokens.length > 0) {
      await sendMulticastNotification({
        title: 'New Order Received! 🛍️',
        body: `Order #${orderId} (${orderData.customerName || 'Customer'}) • ₹${totalAmount} • ${paymentMethod}`,
        tokens: adminTokens,
        data: {
          deepLink: 'admin:orders',
          orderId,
          type: 'order_placed',
        },
        idempotencyKey: `admin_order_alert_${orderId}`,
      });
    }

    // 3. Persist notification records in Firestore /notifications
    const now = new Date().toISOString();
    await db.collection('notifications').add({
      recipientRole: 'customer',
      recipientUserId: customerId,
      type: 'order_status',
      title: 'Order Placed Successfully! 🎉',
      message: `Your order #${orderId} for ₹${totalAmount} has been placed.`,
      orderId,
      deepLink: `order:${orderId}`,
      createdAt: now,
      isRead: false,
      deliveryStatus: 'delivered',
    });

    await db.collection('notifications').add({
      recipientRole: 'admin',
      type: 'order_placed',
      title: 'New Order Received! 🛍️',
      message: `Order #${orderId} (${orderData.customerName || 'Customer'}) • ₹${totalAmount} • ${paymentMethod}`,
      orderId,
      deepLink: 'admin:orders',
      createdAt: now,
      isRead: false,
      deliveryStatus: 'delivered',
    });
  });

/**
 * TRIGGER 2: Order Status Updated
 * Sends status progression updates to customer (packed, shipped, out for delivery, delivered, cancelled)
 */
export const onOrderStatusUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const orderId = context.params.orderId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!afterData || beforeData.status === afterData.status) {
      return; // No status change
    }

    const newStatus = afterData.status;
    const customerId = afterData.customerId;
    if (!customerId) return;

    const titles: Record<string, string> = {
      confirmed: 'Order Confirmed! ✅',
      packed: 'Order Packed & Ready 📦',
      shipped: 'Order Dispatched 🚚',
      out_for_delivery: 'Out for Delivery 🛵',
      delivered: 'Order Delivered! 🎊',
      cancelled: 'Order Cancelled ⚠️',
      refunded: 'Refund Processed 💰',
    };

    const courier = afterData.courierTracking?.courier || 'Express Courier';
    const awb = afterData.courierTracking?.trackingNumber || '';

    const messages: Record<string, string> = {
      confirmed: `Your order #${orderId} has been confirmed by our fulfillment hub.`,
      packed: `Your order #${orderId} is securely packed and waiting for courier pickup.`,
      shipped: awb
        ? `Your order #${orderId} has been shipped via ${courier} (AWB: ${awb}).`
        : `Your order #${orderId} has been dispatched.`,
      out_for_delivery: `Your order #${orderId} is out for delivery today.`,
      delivered: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
      cancelled: `Your order #${orderId} has been cancelled. Any eligible refund is initiated.`,
      refunded: `Refund for order #${orderId} has been credited to your payment method.`,
    };

    const title = titles[newStatus] || `Order Update: #${orderId}`;
    const body = messages[newStatus] || `Your order status changed to ${newStatus}.`;

    const customerTokensSnap = await db
      .collection('device_tokens')
      .where('userId', '==', customerId)
      .get();

    const tokens = customerTokensSnap.docs.map((d) => d.data().token).filter(Boolean);

    if (tokens.length > 0) {
      await sendMulticastNotification({
        title,
        body,
        tokens,
        data: {
          deepLink: `order:${orderId}`,
          orderId,
          status: newStatus,
          type: newStatus === 'cancelled' || newStatus === 'refunded' ? 'refund' : 'order_status',
        },
        idempotencyKey: `order_status_${orderId}_${newStatus}`,
      });
    }

    // Persist in /notifications collection
    await db.collection('notifications').add({
      recipientRole: 'customer',
      recipientUserId: customerId,
      type: newStatus === 'cancelled' || newStatus === 'refunded' ? 'refund' : 'order_status',
      title,
      message: body,
      orderId,
      deepLink: `order:${orderId}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      deliveryStatus: 'delivered',
    });
  });

/**
 * TRIGGER 3: Product Stock Updated
 * Sends low stock (<5) & out of stock (0) alerts to admin, and back in stock to customers
 */
export const onProductStockUpdated = functions.firestore
  .document('products/{productId}')
  .onUpdate(async (change, context) => {
    const productId = context.params.productId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!afterData) return;

    const beforeVariants = beforeData.variants || [];
    const afterVariants = afterData.variants || [];

    for (const v of afterVariants) {
      const prevV = beforeVariants.find((bv: any) => bv.id === v.id);
      const prevStock = prevV ? prevV.stock : 10;
      const currentStock = v.stock;
      const variantName = `${afterData.name} (${v.colorName || 'Variant'})`;

      if (currentStock === 0 && prevStock > 0) {
        // Out of stock alert to admin
        const adminTokensSnap = await db.collection('device_tokens').where('role', '==', 'admin').get();
        const adminTokens = adminTokensSnap.docs.map((d) => d.data().token).filter(Boolean);
        if (adminTokens.length > 0) {
          await sendMulticastNotification({
            title: 'Out of Stock Alert! 🚨',
            body: `${variantName} is now completely out of stock (0 units).`,
            tokens: adminTokens,
            data: { deepLink: 'admin:inventory', type: 'out_of_stock' },
            idempotencyKey: `stock_zero_${productId}_${v.id}_${Date.now()}`,
          });
        }
      } else if (currentStock <= 5 && prevStock > 5) {
        // Low stock warning to admin
        const adminTokensSnap = await db.collection('device_tokens').where('role', '==', 'admin').get();
        const adminTokens = adminTokensSnap.docs.map((d) => d.data().token).filter(Boolean);
        if (adminTokens.length > 0) {
          await sendMulticastNotification({
            title: 'Low Stock Warning ⚠️',
            body: `${variantName} is running low (${currentStock} units remaining).`,
            tokens: adminTokens,
            data: { deepLink: 'admin:inventory', type: 'low_stock' },
            idempotencyKey: `stock_low_${productId}_${v.id}_${Date.now()}`,
          });
        }
      } else if (prevStock === 0 && currentStock > 0) {
        // Replenished -> Send topic or customer back in stock alert
        await getMessaging().send({
          topic: 'all_customers',
          notification: {
            title: 'Back in Stock! ✨',
            body: `${variantName} is back in stock! Grab yours before it sells out.`,
          },
          data: {
            deepLink: `product:${productId}`,
            type: 'back_in_stock',
          },
        }).catch((err) => console.warn('Topic broadcast error:', err));
      }
    }
  });

/**
 * CALLABLE FUNCTION: Send Promotional Broadcast Campaign
 * Allows admin to dispatch marketing and drops notifications to opted-in audiences
 */
export const sendBroadcastCampaign = functions.https.onCall(async (data, context) => {
  const isAdmin = context.auth?.token?.role === 'admin' || context.auth?.token?.admin === true;
  if (!isAdmin && process.env.NODE_ENV === 'production') {
    throw new functions.https.HttpsError('permission-denied', 'Only authorized administrators may dispatch broadcast campaigns.');
  }

  const { title, message, audience, deepLink, bannerImage } = data;
  if (!title || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Title and message are required.');
  }

  let tokensQuery = db.collection('device_tokens');
  if (audience === 'buyers') {
    tokensQuery = tokensQuery.where('hasPurchased', '==', true) as any;
  }

  const tokensSnap = await tokensQuery.get();
  const tokens = tokensSnap.docs.map((d) => d.data().token).filter(Boolean);

  const result = await sendMulticastNotification({
    title,
    body: message,
    tokens,
    imageUrl: bannerImage,
    data: {
      deepLink: deepLink || '/',
      type: 'promotional',
    },
    idempotencyKey: `campaign_${Date.now()}`,
  });

  const campaignId = `cmp_${Date.now()}`;
  await db.collection('notification_campaigns').doc(campaignId).set({
    title,
    message,
    audience: audience || 'all',
    deepLink,
    bannerImage,
    sentAt: new Date().toISOString(),
    sentByAdminId: context.auth?.uid || 'admin',
    targetCount: tokens.length,
    deliveredCount: result.successCount,
    failedCount: result.failureCount,
    status: 'sent',
  });

  return {
    success: true,
    campaignId,
    deliveredCount: result.successCount,
    targetCount: tokens.length,
  };
});
