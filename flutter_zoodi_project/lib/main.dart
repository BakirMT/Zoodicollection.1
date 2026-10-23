import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/zoodi_theme.dart';
import 'features/home/presentation/screens/home_screen.dart';
import 'features/products/presentation/screens/product_detail_screen.dart';
import 'features/admin/presentation/screens/admin_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Initialize Firebase
  // await Firebase.initializeApp();
  runApp(const ZoodiApp());
}

final GoRouter _router = GoRouter(
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

class ZoodiApp extends StatelessWidget {
  const ZoodiApp({super.key});

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
