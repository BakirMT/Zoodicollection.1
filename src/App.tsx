import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerBottomNav } from './components/CustomerBottomNav';
import { HomeScreen } from './views/customer/HomeScreen';
import { CategoriesScreen } from './views/customer/CategoriesScreen';
import { ProductDetailScreen } from './views/customer/ProductDetailScreen';
import { CartScreen } from './views/customer/CartScreen';
import { CheckoutScreen } from './views/customer/CheckoutScreen';
import { OrderTrackingScreen } from './views/customer/OrderTrackingScreen';
import { WishlistScreen } from './views/customer/WishlistScreen';
import { AccountScreen } from './views/customer/AccountScreen';
import { SearchModal } from './views/customer/SearchModal';
import { CustomerLoginScreen } from './views/customer/CustomerLoginScreen';
import { CouponsAndDealsModal } from './components/customer/CouponsAndDealsModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { CustomerNotificationPreferencesModal } from './components/CustomerNotificationPreferencesModal';
import { AdminLoginScreen } from './views/admin/AdminLoginScreen';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { WifiOff, RefreshCw } from 'lucide-react';

const AppShell: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    currentAdmin,
    customerTab,
    activeScreen,
    isOnline,
    setIsOnline,
    setAdminModule,
    deviceFrameMode,
    setDeviceFrameMode,
  } = useApp();

  // Listen to browser URL path, query params, and hash changes for deep linking
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Explicit admin route detection
      const isAdminRoute =
        path === '/superadmin' ||
        path.startsWith('/superadmin') ||
        path.startsWith('/admin') ||
        hash === '#/superadmin' ||
        hash.startsWith('#/superadmin') ||
        hash.startsWith('#/admin') ||
        search.includes('superadmin') ||
        search.includes('admin=1') ||
        search.includes('view=admin');

      if (isAdminRoute) {
        if (currentRoute !== '/superadmin') {
          navigateTo('/superadmin');
        }

        // Check if a specific module is in the URL
        if (
          path.includes('roles') ||
          path.includes('rbac') ||
          hash.includes('roles') ||
          hash.includes('rbac') ||
          search.includes('roles') ||
          search.includes('module=admin_users')
        ) {
          setAdminModule('admin_users');
        } else {
          const match = window.location.search.match(/module=([a-z_]+)/i);
          if (match && match[1]) {
            setAdminModule(match[1] as any);
          }
        }
      } else {
        // Public customer storefront route
        if (currentRoute !== '/') {
          navigateTo('/');
        }
      }
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    // Keyboard shortcut for quick admin access: Alt + A or Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        navigateTo('/superadmin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateTo]);

  // If on admin route:
  if (currentRoute === '/superadmin') {
    if (!currentAdmin) {
      return <AdminLoginScreen />;
    }
    return <AdminDashboard />;
  }

  // Customer Shopping Experience - Clean, Native-feel Mobile Container
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-start">
      {/* OFFLINE WARNING BANNER (Only when simulated offline) */}
      {!isOnline && (
        <div className="w-full max-w-md mx-auto p-3 bg-rose-600 text-white shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-extrabold">No Active Internet Connection</p>
              <p className="text-[10px] text-rose-100">
                ZOODI requires an active online backend. Transactions and checkout are paused.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOnline(true)}
            className="px-2.5 py-1 rounded-lg bg-white text-rose-700 font-bold text-[11px] hover:bg-rose-50 flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* DESKTOP VIEWPORT CONTROLLER BAR (Visible on md+ screens) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-6xl px-4 py-2 mt-2 select-none text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ZOODI Live Kerala Storefront</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">Mannarkkad, Palakkad · Kochi Hub</span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setDeviceFrameMode('phone')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              deviceFrameMode === 'phone'
                ? 'bg-[#192E4D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📱 Mobile App</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceFrameMode('responsive')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              deviceFrameMode === 'responsive'
                ? 'bg-[#192E4D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>💻 Full-Width Store</span>
          </button>
        </div>
      </div>

      {/* Main Application Container */}
      <div
        className={`w-full bg-white min-h-screen transition-all duration-300 flex flex-col relative ${
          deviceFrameMode === 'responsive'
            ? 'max-w-6xl md:my-4 md:rounded-2xl md:border md:border-[#E6EAF0] md:shadow-xl'
            : 'max-w-md md:my-4 md:rounded-3xl md:border-[10px] md:border-slate-800 md:shadow-2xl'
        }`}
      >
        {/* Search Modal Overlay */}
        {activeScreen === 'search' && <SearchModal />}

        {/* Coupons & Deals Modal Overlay */}
        <CouponsAndDealsModal />

        {/* Customer Push Notification Center & Preferences Modals */}
        <NotificationCenterModal />
        <CustomerNotificationPreferencesModal />

        {/* Screen Routing */}
        {activeScreen === 'login' && <CustomerLoginScreen />}
        {activeScreen === 'product_detail' && <ProductDetailScreen />}
        {activeScreen === 'checkout' && <CheckoutScreen />}
        {activeScreen === 'order_tracking' && <OrderTrackingScreen />}

        {activeScreen === 'tab' && (
          <div className="flex flex-col min-h-screen">
            <CustomerHeader />

            <main className="flex-1">
              {customerTab === 'home' && <HomeScreen />}
              {customerTab === 'categories' && <CategoriesScreen />}
              {customerTab === 'wishlist' && <WishlistScreen />}
              {customerTab === 'cart' && <CartScreen />}
              {customerTab === 'account' && <AccountScreen />}
            </main>

            <CustomerBottomNav />
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
