import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

/// Top-level background message handler required by Firebase Messaging
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('ZOODI Background Push Received: ${message.messageId} - ${message.notification?.title}');
}

/// ZOODI Cross-Platform Push Notification Service
/// Handles Firebase Cloud Messaging (FCM), APNs for iOS, Android Notification Channels,
/// token sync to Firestore, and deep-link routing.
class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifs = FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _orderChannel = AndroidNotificationChannel(
    'zoodi_orders',
    'ZOODI Order Updates',
    description: 'Real-time updates regarding order status, shipment tracking and delivery.',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  static const AndroidNotificationChannel _promoChannel = AndroidNotificationChannel(
    'zoodi_promotions',
    'ZOODI Drops & Promotions',
    description: 'Exclusive flash sales, festive drops and promotional coupons.',
    importance: Importance.high,
    playSound: true,
  );

  static const AndroidNotificationChannel _adminChannel = AndroidNotificationChannel(
    'zoodi_admin_alerts',
    'ZOODI Store Admin Alerts',
    description: 'Critical business alerts, inventory low-stock warnings and payment confirmations.',
    importance: Importance.max,
    playSound: true,
  );

  /// Callback stream controller for UI navigation on tap
  final StreamController<String> _deepLinkController = StreamController<String>.broadcast();
  Stream<String> get deepLinkStream => _deepLinkController.stream;

  String? _fcmToken;
  String? get currentToken => _fcmToken;

  /// Initialize all push notification listeners and channels
  Future<void> initialize({required String? userId, bool isAdmin = false}) async {
    // 1. Request OS Permissions
    final NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    debugPrint('FCM Authorization Status: ${settings.authorizationStatus}');

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('User declined push notification permissions.');
      return;
    }

    // 2. Setup Android Local Notification Channels
    await _setupLocalNotifications();

    // 3. Set background message handler
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // 4. Foreground notification presentation options on iOS
    await _fcm.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // 5. Get and persist device token
    await _retrieveAndSyncToken(userId: userId, isAdmin: isAdmin);

    // 6. Token refresh listener
    _fcm.onTokenRefresh.listen((newToken) {
      _fcmToken = newToken;
      _saveTokenToFirestore(newToken, userId: userId, isAdmin: isAdmin);
    });

    // 7. Foreground message handler
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Foreground Push: ${message.notification?.title} - ${message.notification?.body}');
      _showLocalNotification(message);
    });

    // 8. Tapped notification while app is in background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleMessageTap(message);
    });

    // 9. Tapped notification when app was completely terminated
    final RemoteMessage? initialMessage = await _fcm.getInitialMessage();
    if (initialMessage != null) {
      _handleMessageTap(initialMessage);
    }

    // 10. Topic Subscriptions
    await _setupTopicSubscriptions(isAdmin: isAdmin);
  }

  /// Setup local notifications for Android & iOS
  Future<void> _setupLocalNotifications() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifs.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        if (response.payload != null && response.payload!.isNotEmpty) {
          _deepLinkController.add(response.payload!);
        }
      },
    );

    // Create custom channels on Android 8.0+
    final AndroidFlutterLocalNotificationsPlugin? androidPlatform =
        _localNotifs.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlatform != null) {
      await androidPlatform.createNotificationChannel(_orderChannel);
      await androidPlatform.createNotificationChannel(_promoChannel);
      await androidPlatform.createNotificationChannel(_adminChannel);
    }
  }

  /// Retrieve FCM device token and register in Firestore
  Future<void> _retrieveAndSyncToken({required String? userId, required bool isAdmin}) async {
    try {
      _fcmToken = await _fcm.getToken();
      debugPrint('ZOODI FCM Device Token: $_fcmToken');
      if (_fcmToken != null) {
        await _saveTokenToFirestore(_fcmToken!, userId: userId, isAdmin: isAdmin);
      }
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
    }
  }

  /// Store device token in Firestore `device_tokens` collection
  Future<void> _saveTokenToFirestore(String token, {required String? userId, required bool isAdmin}) async {
    try {
      final String docId = 'token_${token.hashCode}';
      await FirebaseFirestore.instance.collection('device_tokens').doc(docId).set({
        'token': token,
        'userId': userId ?? 'guest',
        'isAdmin': isAdmin,
        'platform': defaultTargetPlatform.name,
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (e) {
      debugPrint('Failed to save device token to Firestore: $e');
    }
  }

  /// Subscribe to relevant broadcast topics
  Future<void> _setupTopicSubscriptions({required bool isAdmin}) async {
    try {
      await _fcm.subscribeToTopic('all_customers');
      await _fcm.subscribeToTopic('promotions');
      if (isAdmin) {
        await _fcm.subscribeToTopic('admin_alerts');
      } else {
        await _fcm.unsubscribeFromTopic('admin_alerts');
      }
    } catch (e) {
      debugPrint('Failed to manage FCM topics: $e');
    }
  }

  /// Display heads-up banner when notification arrives in foreground
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final RemoteNotification? notification = message.notification;
    final Map<String, dynamic> data = message.data;
    final String type = data['type'] ?? 'order_status';

    AndroidNotificationDetails androidDetails;
    if (type == 'order_status' || type == 'order_placed' || type == 'payment_success') {
      androidDetails = AndroidNotificationDetails(
        _orderChannel.id,
        _orderChannel.name,
        channelDescription: _orderChannel.description,
        importance: Importance.max,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      );
    } else if (type == 'promotional' || type == 'back_in_stock') {
      androidDetails = AndroidNotificationDetails(
        _promoChannel.id,
        _promoChannel.name,
        channelDescription: _promoChannel.description,
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      );
    } else {
      androidDetails = AndroidNotificationDetails(
        _adminChannel.id,
        _adminChannel.name,
        channelDescription: _adminChannel.description,
        importance: Importance.max,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      );
    }

    final NotificationDetails platformDetails = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );

    final String? deepLink = data['deepLink'];

    await _localNotifs.show(
      message.hashCode,
      notification?.title ?? 'ZOODI Collection',
      notification?.body ?? 'New notification received',
      platformDetails,
      payload: deepLink,
    );
  }

  /// Handle tap on push notification
  void _handleMessageTap(RemoteMessage message) {
    final String? deepLink = message.data['deepLink'];
    if (deepLink != null && deepLink.isNotEmpty) {
      debugPrint('Navigating to deep link: $deepLink');
      _deepLinkController.add(deepLink);
    }
  }

  /// Dispose resources
  void dispose() {
    _deepLinkController.close();
  }
}
