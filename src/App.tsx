import React, { useEffect, useRef } from 'react';
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
import { NotFoundScreen } from './views/customer/NotFoundScreen';
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
    setCustomerTab,
    activeScreen,
    setActiveScreen,
    selectedProductId,
    setSelectedProductId,
    selectedOrderId,
    setSelectedOrderId,
    selectedCategorySlug,
    setSelectedCategorySlug,
    isOnline,
    setIsOnline,
    setAdminModule,
    deviceFrameMode,
    setDeviceFrameMode,
    isCouponsModalOpen,
    isNotificationCenterOpen,
    isNotifPreferencesOpen,
  } = useApp();

  // Flag to avoid pushState loops when syncing state from browser URL (popstate / initial load)
  const isNavigatingFromUrl = useRef(false);

  // Synchronize state from browser URL on initial load and popstate/hashchange
  useEffect(() => {
    const checkRoute = () => {
      isNavigatingFromUrl.current = true;
      const rawPath = window.location.pathname;
      const path = rawPath.toLowerCase().replace(/\/+$/, '') || '/';
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search;
      const searchLower = search.toLowerCase();
      const searchParams = new URLSearchParams(search);

      // Explicit admin route detection
      const isAdminRoute =
        path === '/superadmin' ||
        path.startsWith('/superadmin') ||
        path.startsWith('/admin') ||
        hash === '#/superadmin' ||
        hash.startsWith('#/superadmin') ||
        hash.startsWith('#/admin') ||
        searchLower.includes('superadmin') ||
        searchLower.includes('admin=1') ||
        searchLower.includes('view=admin');

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
          searchLower.includes('roles') ||
          searchLower.includes('module=admin_users')
        ) {
          setAdminModule('admin_users');
        } else {
          const modParam = searchParams.get('module');
          if (modParam) {
            setAdminModule(modParam as any);
          }
        }
      } else {
        // Customer Storefront Routing
        if (path === '/' || path === '/home' || path === '/shop') {
          setSelectedCategorySlug(null);
          setCustomerTab('home');
          setActiveScreen('tab');
        } else if (path === '/cart' || path === '/bag') {
          setCustomerTab('cart');
          setActiveScreen('tab');
        } else if (path === '/checkout') {
          setActiveScreen('checkout');
        } else if (path === '/wishlist' || path === '/favorites') {
          setCustomerTab('wishlist');
          setActiveScreen('tab');
        } else if (path === '/account' || path === '/profile' || path === '/user') {
          setCustomerTab('account');
          setActiveScreen('tab');
        } else if (path === '/categories' || path === '/explore') {
          const catParam = searchParams.get('category') || searchParams.get('cat') || searchParams.get('slug');
          if (catParam) {
            setSelectedCategorySlug(catParam);
          }
          setCustomerTab('categories');
          setActiveScreen('tab');
        } else if (path.match(/^\/categor(?:y|ies)\/([^/]+)/)) {
          const match = path.match(/^\/categor(?:y|ies)\/([^/]+)/);
          const slug = match ? match[1] : null;
          if (slug) setSelectedCategorySlug(slug);
          setCustomerTab('categories');
          setActiveScreen('tab');
        } else if (path.match(/^\/product(?:s)?\/([^/]+)/)) {
          const match = rawPath.match(/^\/product(?:s)?\/([^/]+)/i);
          const prodId = match ? match[1] : null;
          if (prodId) {
            setSelectedProductId(prodId);
            setActiveScreen('product_detail');
          }
        } else if (path === '/product' || path === '/products') {
          const id = searchParams.get('id');
          if (id) {
            setSelectedProductId(id);
            setActiveScreen('product_detail');
          } else {
            setCustomerTab('home');
            setActiveScreen('tab');
          }
        } else if (path.match(/^\/order(?:s)?\/([^/]+)/)) {
          const match = rawPath.match(/^\/order(?:s)?\/([^/]+)/i);
          const orderId = match ? match[1] : null;
          if (orderId) {
            setSelectedOrderId(orderId);
            setActiveScreen('order_tracking');
          }
        } else if (path === '/orders' || path === '/order-tracking' || path === '/order-history') {
          const id = searchParams.get('id');
          if (id) setSelectedOrderId(id);
          setActiveScreen('order_tracking');
        } else if (path === '/login' || path === '/signin' || path === '/customer-login' || path === '/auth') {
          setActiveScreen('login');
        } else if (path === '/search') {
          setActiveScreen('search');
        } else {
          // Unrecognized route -> 404 Not Found
          setActiveScreen('not_found');
        }
      }

      setTimeout(() => {
        isNavigatingFromUrl.current = false;
      }, 50);
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
  }, [navigateTo, setCustomerTab, setActiveScreen, setSelectedProductId, setSelectedOrderId, setSelectedCategorySlug, setAdminModule, currentRoute]);

  // Synchronize browser address bar when user navigates using in-app buttons & tabs
  useEffect(() => {
    if (isNavigatingFromUrl.current) return;
    if (typeof window === 'undefined') return;

    if (currentRoute === '/superadmin') {
      if (!window.location.pathname.startsWith('/superadmin') && !window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/superadmin');
      }
      return;
    }

    let targetPath = '/';
    if (activeScreen === 'login') {
      targetPath = '/login';
    } else if (activeScreen === 'product_detail' && selectedProductId) {
      targetPath = `/product/${selectedProductId}`;
    } else if (activeScreen === 'checkout') {
      targetPath = '/checkout';
    } else if (activeScreen === 'order_tracking') {
      targetPath = selectedOrderId ? `/order/${selectedOrderId}` : '/orders';
    } else if (activeScreen === 'search') {
      targetPath = '/search';
    } else if (activeScreen === 'not_found') {
      // Keep current invalid path in URL for 404 display
      return;
    } else if (activeScreen === 'tab') {
      if (customerTab === 'home') {
        targetPath = selectedCategorySlug ? `/category/${selectedCategorySlug}` : '/';
      } else if (customerTab === 'categories') {
        targetPath = selectedCategorySlug ? `/category/${selectedCategorySlug}` : '/categories';
      } else if (customerTab === 'cart') {
        targetPath = '/cart';
      } else if (customerTab === 'wishlist') {
        targetPath = '/wishlist';
      } else if (customerTab === 'account') {
        targetPath = '/account';
      }
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentRoute, activeScreen, customerTab, selectedProductId, selectedOrderId, selectedCategorySlug]);

  // If on admin route:
  if (currentRoute === '/superadmin') {
    if (!currentAdmin || currentAdmin.email.toLowerCase().trim() !== 'zoodicollection@gmail.com') {
      return <AdminLoginScreen />;
    }
    return <AdminDashboard />;
  }

  // Customer Shopping Experience - Clean, Responsive Full-Store Container
  return (
    <div className="min-h-screen bg-white md:bg-[#F0F4F8] flex flex-col items-center justify-start w-full overflow-x-hidden">
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

      {/* Main Application Container */}
      <div
        className={`w-full bg-white min-h-screen transition-all duration-300 flex flex-col relative overflow-x-hidden ${
          deviceFrameMode === 'responsive'
            ? 'max-w-6xl md:rounded-2xl md:border md:border-[#E6EAF0] md:shadow-md'
            : 'max-w-md md:rounded-3xl md:border-[8px] md:border-slate-800 md:shadow-2xl'
        }`}
      >
        {/* Search Modal Overlay */}
        {activeScreen === 'search' && <SearchModal />}

        {/* Coupons & Deals Modal Overlay */}
        {isCouponsModalOpen && <CouponsAndDealsModal />}

        {/* Customer Push Notification Center & Preferences Modals */}
        {isNotificationCenterOpen && <NotificationCenterModal />}
        {isNotifPreferencesOpen && <CustomerNotificationPreferencesModal />}

        {/* Screen Routing */}
        {activeScreen === 'login' && <CustomerLoginScreen />}
        {activeScreen === 'product_detail' && <ProductDetailScreen />}
        {activeScreen === 'checkout' && <CheckoutScreen />}
        {activeScreen === 'order_tracking' && <OrderTrackingScreen />}
        {activeScreen === 'not_found' && <NotFoundScreen />}

        {activeScreen === 'tab' && (
          <div className="flex flex-col min-h-screen">
            <CustomerHeader />

            <main
              className={`flex-1 pb-24 ${
                customerTab === 'wishlist' || customerTab === 'cart' || customerTab === 'account'
                  ? 'pt-[60px]'
                  : 'pt-[96px]'
              }`}
            >
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
