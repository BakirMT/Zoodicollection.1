import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/zoodi_theme.dart';
import 'core/services/push_notification_service.dart';
import 'features/home/presentation/screens/home_screen.dart';
import 'features/products/presentation/screens/product_detail_screen.dart';
import 'features/admin/presentation/screens/admin_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
    // Initialize ZOODI Push Notification Service
    await PushNotificationService().initialize(
      userId: null, // Populated dynamically upon customer authentication
      isAdmin: false,
    );
  } catch (e) {
    debugPrint('Firebase & Push Notification init note (offline/unconfigured): $e');
  }

  runApp(const ZoodiApp());
}

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter _router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: <RouteBase>[
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return const HomeScreen();
      },
      routes: <RouteBase>[
        GoRoute(
          path: 'product/:id',
          builder: (BuildContext context, GoRouterState state) {
            final productId = state.pathParameters['id'] ?? '';
            return ProductDetailScreen(productId: productId);
          },
        ),
      ],
    ),
    // Hidden, protected Admin Route
    GoRoute(
      path: '/superadmin',
      builder: (BuildContext context, GoRouterState state) {
        return const AdminDashboardScreen();
      },
    ),
  ],
);

class ZoodiApp extends StatefulWidget {
  const ZoodiApp({super.key});

  @override
  State<ZoodiApp> createState() => _ZoodiAppState();
}

class _ZoodiAppState extends State<ZoodiApp> {
  @override
  void initState() {
    super.initState();
    // Listen for FCM notification deep link taps and navigate smoothly
    PushNotificationService().deepLinkStream.listen((String deepLink) {
      if (deepLink.startsWith('product:')) {
        final id = deepLink.replaceFirst('product:', '');
        _router.go('/product/$id');
      } else if (deepLink.startsWith('admin:')) {
        _router.go('/superadmin');
      } else if (deepLink.startsWith('order:')) {
        _router.go('/');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'ZOODI Collection',
      debugShowCheckedModeBanner: false,
      theme: ZoodiTheme.lightTheme,
      routerConfig: _router,
    );
  }
}
