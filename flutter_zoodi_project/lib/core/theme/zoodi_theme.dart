import 'package:flutter/material.dart';

class ZoodiColors {
  // Official ZOODI Palette
  static const Color primaryTeal = Color(0xFF08A9A2);
  static const Color goldenYellow = Color(0xFFFFB000);
  static const Color coralOrange = Color(0xFFF56645);
  static const Color brightPink = Color(0xFFF20D58);
  static const Color deepNavy = Color(0xFF192E4D);
  static const Color background = Color(0xFFFFFFFF);
  static const Color secondaryBackground = Color(0xFFF6F8FA);
  static const Color primaryText = Color(0xFF192E4D);
  static const Color secondaryText = Color(0xFF697586);
  static const Color borders = Color(0xFFE6EAF0);
}

class ZoodiTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: ZoodiColors.background,
      primaryColor: ZoodiColors.primaryTeal,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: ZoodiColors.primaryTeal,
        onPrimary: Colors.white,
        secondary: ZoodiColors.brightPink,
        onSecondary: Colors.white,
        tertiary: ZoodiColors.coralOrange,
        onTertiary: Colors.white,
        error: Colors.redAccent,
        onError: Colors.white,
        surface: ZoodiColors.background,
        onSurface: ZoodiColors.primaryText,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        iconTheme: IconThemeData(color: ZoodiColors.deepNavy),
        titleTextStyle: TextStyle(
          color: ZoodiColors.deepNavy,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: ZoodiColors.primaryTeal,
        unselectedItemColor: ZoodiColors.secondaryText,
        type: BottomNavigationBarType.fixed,
        elevation: 10,
        selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
      ),
    );
  }
}
