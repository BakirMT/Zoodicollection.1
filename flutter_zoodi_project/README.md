# ZOODI Collection — Cross-Platform Shopping App & Private Admin Panel

Production-oriented cross-platform mobile shopping application built with Flutter & Dart, backed by Firebase Authentication, Cloud Firestore, Firebase Storage, and Cloud Functions.

Official Brand Identity: **ZOODI Collection**
- Primary Teal: `#08A9A2`
- Golden Yellow: `#FFB000`
- Coral Orange: `#F56645`
- Bright Pink: `#F20D58`
- Deep Navy: `#192E4D`

---

## Architecture Overview

This project includes **TWO CONNECTED INTERFACES IN ONE CODEBASE**:
1. **Customer Shopping App**:
   - Dynamic Admin-controlled Homepage Builder
   - 3-Level Category hierarchy: Main Category → Subcategory → Sub-subcategory
   - Multi-Color Product Variants with **independent image galleries per color** (e.g. Crimson Red, Golden Mustard, Midnight Black)
   - Cart, Wishlist, Coupons (`ZOODI10`, `FESTIVE25`, `FLAT50`)
   - Complete Checkout & Multi-payment Gateway (UPI, Cards, NetBanking, COD)
   - Real-time Order Tracking timeline (`placed` → `confirmed` → `processing` → `packed` → `shipped` → `out_for_delivery` → `delivered`)
   - Customer Support Ticket chat and Verified Reviews
2. **Private Admin Management Panel**:
   - Protected route: `/superadmin` (requires admin credentials & RBAC authorization)
   - 28 Management Modules: Dashboard, Products, Variant Image Galleries, 3-Level Category Tree, Homepage Builder, Orders & Tracking Assignment, Variant Inventory, Coupons & Deals, Review Moderation, Support Tickets, RBAC & Audit Trail.

---

## Quickstart & Local Setup

### 1. Prerequisites
- Flutter SDK `^3.2.0` or later
- Dart `^3.2.0`
- Android Studio / Xcode (for iOS)
- Firebase CLI (`npm install -g firebase-tools`)

### 2. Install Dependencies
```bash
cd flutter_zoodi_project
flutter pub get
```

### 3. Firebase Provisioning
1. Create a Firebase project in the Firebase Console: `https://console.firebase.google.com`
2. Register Android app (`com.zoodi.collection`) and download `google-services.json` into `android/app/`
3. Register iOS app (`com.zoodi.collection`) and download `GoogleService-Info.plist` into `ios/Runner/`
4. Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules,storage
```

### 4. Create Initial Super Admin Securely
Run the bootstrap setup script to provision the first Super Admin account without exposing credentials:
```bash
# Using Firebase Admin SDK CLI
firebase auth:create-user --email admin@zoodi.com --password "SecurePass2026!"
# Grant super_admin document in /admin_profiles/
```

### 5. Running the App
- **Android Simulator / Device**:
```bash
flutter run -d android
```
- **iOS Simulator**:
```bash
flutter run -d ios
```
- **Release APK**:
```bash
flutter build apk --release
```
- **Release AppBundle (Google Play)**:
```bash
flutter build appbundle
```
- **Release iOS IPA (Apple App Store)**:
```bash
flutter build ipa
```
