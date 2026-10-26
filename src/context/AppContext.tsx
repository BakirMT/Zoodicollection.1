import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  ProductVariant,
  MainCategory,
  SubCategory,
  SubSubCategory,
  HomepageSection,
  Coupon,
  Order,
  CartItem,
  Address,
  Review,
  SupportTicket,
  AdminUser,
  AuditLog,
  CustomerProfile,
  AdminRole,
  OrderStatus,
  AppNotification,
  AdminNotificationSettings,
  CustomerNotificationPreferences,
  NotificationBroadcastCampaign,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_MAIN_CATEGORIES,
  INITIAL_SUB_CATEGORIES,
  INITIAL_SUB_SUB_CATEGORIES,
  INITIAL_HOMEPAGE_SECTIONS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_NOTIFICATION_SETTINGS,
  INITIAL_NOTIFICATION_CAMPAIGNS,
} from '../data/seedData';
import { NotificationService } from '../services/notificationService';
import {
  calculateOrderPricing,
  isValidStatusTransition,
  checkVariantStock,
  hasAdminPermission,
} from '../lib/commerceLogic';
import {
  dbSaveCoupons,
  dbLoadCoupons,
  dbSaveHomepageSections,
  dbLoadHomepageSections,
  dbSaveHomepageDraft,
  dbLoadHomepageDraft,
} from '../lib/database';

export type CustomerTab = 'home' | 'categories' | 'wishlist' | 'cart' | 'account';

export type AdminModuleTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'homepage_builder'
  | 'orders'
  | 'inventory'
  | 'coupons_marketing'
  | 'customers'
  | 'reviews'
  | 'support'
  | 'settings'
  | 'admin_users'
  | 'audit_logs'
  | 'notifications'
  | 'flutter_export';

interface AppContextType {
  // Navigation & Shell
  currentRoute: string; // '/' or '/superadmin'
  navigateTo: (route: string) => void;
  customerTab: CustomerTab;
  setCustomerTab: (tab: CustomerTab) => void;
  activeScreen: string; // 'tab' | 'product_detail' | 'checkout' | 'order_tracking' | 'order_history' | 'support' | 'search' | 'policy'
  setActiveScreen: (screen: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Device & Network Simulators
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  deviceFrameMode: 'phone' | 'responsive';
  setDeviceFrameMode: (mode: 'phone' | 'responsive') => void;

  // Catalog & Content
  products: Product[];
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
  subSubCategories: SubSubCategory[];
  homepageSections: HomepageSection[];
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  couponError: string | null;
  isCouponsModalOpen: boolean;
  setIsCouponsModalOpen: (open: boolean) => void;

  // Customer State
  isCustomerLoggedIn: boolean;
  customerProfile: CustomerProfile;
  cart: CartItem[];
  wishlistIds: string[];
  orders: Order[];
  reviews: Review[];
  supportTickets: SupportTicket[];

  // Customer Actions
  customerLogin: (method: 'google' | 'apple' | 'email', email?: string, name?: string) => void;
  customerLogout: () => void;
  addToCart: (product: Product, variant: ProductVariant, size?: string, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  toggleWishlist: (productId: string) => void;

  // Google Pay (GPay) Settlement Integration
  connectedGpayVpa: string;
  setConnectedGpayVpa: (vpa: string) => void;
  gpayMerchantName: string;
  setGpayMerchantName: (name: string) => void;
  gpayUserEmail: string;
  gpayPhone: string;

  placeOrder: (
    address: Address,
    paymentMethod: 'gpay' | 'upi' | 'card' | 'netbanking' | 'cod',
    paymentMeta?: {
      upiId?: string;
      cardLast4?: string;
      bankName?: string;
      utrNumber?: string;
    }
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  addReview: (productId: string, rating: number, title: string, comment: string) => void;
  createSupportTicket: (subject: string, message: string, orderId?: string) => void;
  replyToSupportTicket: (ticketId: string, message: string, isCustomer: boolean) => void;

  // Admin State & Actions
  currentAdmin: AdminUser | null;
  adminModule: AdminModuleTab;
  setAdminModule: (mod: AdminModuleTab) => void;
  adminLogin: (email: string, pass: string) => { success: boolean; error?: string };
  adminLogout: () => void;
  auditLogs: AuditLog[];
  adminUsers: AdminUser[];

  // Admin Catalog & Content operations
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  saveCategory: (type: 'main' | 'sub' | 'subsub', item: any) => void;
  deleteCategory: (type: 'main' | 'sub' | 'subsub', id: string) => { success: boolean; message?: string };
  reorderMainCategories: (newOrdered: MainCategory[]) => void;
  toggleCategoryHomepageVisibility: (id: string) => void;
  toggleCategoryActiveStatus: (type: 'main' | 'sub' | 'subsub', id: string) => void;
  updateHomepageSections: (sections: HomepageSection[]) => Promise<boolean>;
  homepageDraft: HomepageSection[] | null;
  saveHomepageDraft: (sections: HomepageSection[]) => Promise<boolean>;
  publishHomepageDraft: () => Promise<boolean>;
  discardHomepageDraft: () => Promise<boolean>;
  resetHomepageToDefault: () => Promise<boolean>;
  deleteHomepageSection: (sectionId: string) => Promise<boolean>;
  duplicateHomepageSection: (sectionId: string) => Promise<boolean>;
  saveSingleHomepageSection: (section: HomepageSection) => Promise<boolean>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, courierData?: { courier: string; trackingNumber: string; estimatedDelivery: string }, note?: string) => { success: boolean; message?: string };
  updateVariantStock: (productId: string, variantId: string, newStock: number, sizeStock?: Record<string, number>) => void;
  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  moderateReview: (reviewId: string, status: 'approved' | 'rejected') => void;
  addAdminUser: (name: string, email: string, role: AdminRole) => void;
  saveAdminUser: (user: Partial<AdminUser> & { name: string; email: string; role: AdminRole }) => { success: boolean; message?: string };
  deleteAdminUser: (adminId: string) => { success: boolean; message?: string };
  switchAdminUser: (adminId: string) => { success: boolean; message?: string };
  toggleAdminUserStatus: (adminId: string) => void;

  // Notifications & FCM Engine
  notifications: AppNotification[];
  unreadCustomerCount: number;
  unreadAdminCount: number;
  adminNotifSettings: AdminNotificationSettings;
  customerNotifPrefs: CustomerNotificationPreferences;
  notificationCampaigns: NotificationBroadcastCampaign[];
  pushPermission: NotificationPermission;
  fcmDeviceToken: string | null;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  isNotifPreferencesOpen: boolean;
  setIsNotifPreferencesOpen: (open: boolean) => void;
  sendNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'deliveryStatus'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (role: 'customer' | 'admin') => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: (role: 'customer' | 'admin') => void;
  requestPushPermission: () => Promise<boolean>;
  updateAdminNotifSettings: (settings: Partial<AdminNotificationSettings>) => void;
  updateCustomerNotifPrefs: (prefs: Partial<CustomerNotificationPreferences>) => void;
  dispatchNotificationCampaign: (data: {
    title: string;
    message: string;
    audience: 'all' | 'buyers' | 'wishlist';
    deepLink?: string;
    bannerImage?: string;
  }) => Promise<{ success: boolean; count: number }>;
  handleNotificationClick: (notif: AppNotification) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [activeScreen, setActiveScreen] = useState<string>('tab');
  const [selectedProductId, setSelectedProductId] = useState<string | null>('prod_jacket_01');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ZD-84920');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Device & Connectivity Simulators
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deviceFrameMode, setDeviceFrameMode] = useState<'phone' | 'responsive'>('responsive');

  // Stored state with local persistence and INR version migration
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const ver = localStorage.getItem('zoodi_inr_v2');
      if (!ver) {
        localStorage.setItem('zoodi_inr_v2', 'true');
        localStorage.setItem('zoodi_products', JSON.stringify(INITIAL_PRODUCTS));
        localStorage.setItem('zoodi_coupons', JSON.stringify(INITIAL_COUPONS));
        localStorage.setItem('zoodi_orders', JSON.stringify(INITIAL_ORDERS));
        localStorage.removeItem('zoodi_cart');
        return INITIAL_PRODUCTS;
      }
      const saved = localStorage.getItem('zoodi_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [mainCategories, setMainCategories] = useState<MainCategory[]>(() => {
    const saved = localStorage.getItem('zoodi_main_categories');
    return saved ? JSON.parse(saved) : INITIAL_MAIN_CATEGORIES;
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => {
    const saved = localStorage.getItem('zoodi_sub_categories');
    return saved ? JSON.parse(saved) : INITIAL_SUB_CATEGORIES;
  });

  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>(() => {
    const saved = localStorage.getItem('zoodi_sub_sub_categories');
    return saved ? JSON.parse(saved) : INITIAL_SUB_SUB_CATEGORIES;
  });

  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>(() => {
    const saved = localStorage.getItem('zoodi_homepage_sections');
    return saved ? JSON.parse(saved) : INITIAL_HOMEPAGE_SECTIONS;
  });

  const [homepageDraft, setHomepageDraft] = useState<HomepageSection[] | null>(() => {
    try {
      const saved = localStorage.getItem('zoodi_homepage_draft');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('zoodi_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState<boolean>(false);

  // Google Pay (GPay) Connected Merchant Settlement Account
  const [connectedGpayVpa, setConnectedGpayVpaState] = useState<string>(() => {
    return localStorage.getItem('zoodi_gpay_vpa') || 'ayishanp1986@oksbi';
  });
  const [gpayMerchantName, setGpayMerchantNameState] = useState<string>(() => {
    return localStorage.getItem('zoodi_gpay_merchant_name') || 'Ayisha N.P.';
  });
  const gpayUserEmail = 'bakirmannarkkad170@gmail.com';
  const gpayPhone = '+91 9072976516';

  const setConnectedGpayVpa = (vpa: string) => {
    setConnectedGpayVpaState(vpa);
    try {
      localStorage.setItem('zoodi_gpay_vpa', vpa);
    } catch {
      // ignore
    }
  };

  const setGpayMerchantName = (name: string) => {
    setGpayMerchantNameState(name);
    try {
      localStorage.setItem('zoodi_gpay_merchant_name', name);
    } catch {
      // ignore
    }
  };

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('zoodi_customer_logged_in');
    return saved !== null ? saved === 'true' : true;
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({
    id: 'cust_001',
    name: 'Muhammed Nihal',
    email: 'nihal.kerala@example.com',
    phone: '+91 94471 23456',
    addresses: [
      {
        id: 'addr_1',
        name: 'Muhammed Nihal',
        phone: '+91 94471 23456',
        street: 'ZOODI Villa, Court Road, Near KSRTC Bus Stand',
        city: 'Mannarkkad',
        state: 'Kerala',
        postalCode: '678582',
        country: 'India',
        isDefault: true,
      },
      {
        id: 'addr_2',
        name: 'Muhammed Nihal (Work)',
        phone: '+91 94471 23456',
        street: '12-B, Panampilly Nagar Main Avenue',
        city: 'Kochi',
        state: 'Kerala',
        postalCode: '682036',
        country: 'India',
        isDefault: false,
      },
    ],
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('zoodi_cart');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'cart_init_1',
            productId: 'prod_jacket_01',
            productName: 'ZOODI Signature All-Weather Bomber Jacket',
            brand: 'ZOODI Collection',
            variantId: 'var_jk_red',
            colorName: 'Crimson Red',
            colorCode: '#D91E36',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
            size: 'M',
            price: 2499.0,
            quantity: 1,
            maxStock: 8,
          },
        ];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod_sneaker_02', 'prod_dress_03']);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('zoodi_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('zoodi_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('zoodi_support_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  // Admin state
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [adminModule, setAdminModule] = useState<AdminModuleTab>('dashboard');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('zoodi_admin_users');
    if (!saved) return INITIAL_ADMIN_USERS;
    try {
      const parsed: AdminUser[] = JSON.parse(saved);
      const existingEmails = new Set(parsed.map((u) => u.email.toLowerCase()));
      const missing = INITIAL_ADMIN_USERS.filter((u) => !existingEmails.has(u.email.toLowerCase()));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return INITIAL_ADMIN_USERS;
    }
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('zoodi_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Notifications State & Persistence
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('zoodi_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [adminNotifSettings, setAdminNotifSettings] = useState<AdminNotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('zoodi_admin_notification_settings');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_NOTIFICATION_SETTINGS;
    } catch {
      return INITIAL_ADMIN_NOTIFICATION_SETTINGS;
    }
  });

  const [customerNotifPrefs, setCustomerNotifPrefs] = useState<CustomerNotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('zoodi_customer_notif_prefs');
      return saved
        ? JSON.parse(saved)
        : {
            orderUpdates: true,
            promotionsAndOffers: true,
            backInStockAlerts: true,
            accountSecurity: true,
            browserPushEnabled: true,
          };
    } catch {
      return {
        orderUpdates: true,
        promotionsAndOffers: true,
        backInStockAlerts: true,
        accountSecurity: true,
        browserPushEnabled: true,
      };
    }
  });

  const [notificationCampaigns, setNotificationCampaigns] = useState<NotificationBroadcastCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('zoodi_notification_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_CAMPAIGNS;
    } catch {
      return INITIAL_NOTIFICATION_CAMPAIGNS;
    }
  });

  const [fcmDeviceToken, setFcmDeviceToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('zoodi_fcm_device_token');
    } catch {
      return null;
    }
  });

  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    return NotificationService.getPermission();
  });

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isNotifPreferencesOpen, setIsNotifPreferencesOpen] = useState(false);

  // Sync to localStorage & IndexedDB
  useEffect(() => {
    dbLoadCoupons().then((dbCoupons) => {
      if (dbCoupons && dbCoupons.length > 0) {
        setCoupons(dbCoupons);
      }
    });
    dbLoadHomepageSections().then((dbSecs) => {
      if (dbSecs && dbSecs.length > 0) {
        setHomepageSections(dbSecs);
      }
    });
    dbLoadHomepageDraft().then((dbDraft) => {
      if (dbDraft && dbDraft.length > 0) {
        setHomepageDraft(dbDraft);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('zoodi_coupons', JSON.stringify(coupons));
    dbSaveCoupons(coupons);
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('zoodi_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('zoodi_homepage_sections', JSON.stringify(homepageSections));
  }, [homepageSections]);

  useEffect(() => {
    localStorage.setItem('zoodi_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('zoodi_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('zoodi_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('zoodi_main_categories', JSON.stringify(mainCategories));
  }, [mainCategories]);

  useEffect(() => {
    localStorage.setItem('zoodi_sub_categories', JSON.stringify(subCategories));
  }, [subCategories]);

  useEffect(() => {
    localStorage.setItem('zoodi_sub_sub_categories', JSON.stringify(subSubCategories));
  }, [subSubCategories]);

  useEffect(() => {
    localStorage.setItem('zoodi_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('zoodi_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('zoodi_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('zoodi_admin_notification_settings', JSON.stringify(adminNotifSettings));
  }, [adminNotifSettings]);

  useEffect(() => {
    localStorage.setItem('zoodi_customer_notif_prefs', JSON.stringify(customerNotifPrefs));
  }, [customerNotifPrefs]);

  useEffect(() => {
    localStorage.setItem('zoodi_notification_campaigns', JSON.stringify(notificationCampaigns));
  }, [notificationCampaigns]);

  // Robust navigation helper with browser history and route synchronization
  const navigateTo = useCallback((route: string) => {
    const isTargetAdmin =
      route === '/superadmin' ||
      route.startsWith('/superadmin') ||
      route.startsWith('/admin') ||
      route === 'admin';

    if (isTargetAdmin) {
      setCurrentRoute('/superadmin');
      try {
        if (typeof window !== 'undefined') {
          const targetUrl = route.startsWith('/') ? route : `/${route}`;
          if (window.location.pathname !== '/superadmin' && !window.location.hash.includes('superadmin')) {
            window.history.pushState({ route: '/superadmin' }, '', targetUrl);
          }
        }
      } catch {
        // ignore history state exceptions in sandboxed environments
      }
    } else {
      setCurrentRoute('/');
      const clean = route.startsWith('/') ? route : `/${route}`;

      if (clean === '/' || clean === '/home') {
        setCustomerTab('home');
        setActiveScreen('tab');
        setSelectedCategorySlug(null);
      } else if (clean === '/cart' || clean === '/bag') {
        setCustomerTab('cart');
        setActiveScreen('tab');
      } else if (clean === '/checkout') {
        setActiveScreen('checkout');
      } else if (clean === '/wishlist') {
        setCustomerTab('wishlist');
        setActiveScreen('tab');
      } else if (clean === '/account' || clean === '/profile') {
        setCustomerTab('account');
        setActiveScreen('tab');
      } else if (clean === '/categories' || clean === '/explore') {
        setCustomerTab('categories');
        setActiveScreen('tab');
      } else if (clean.startsWith('/category/')) {
        const slug = clean.replace('/category/', '');
        setSelectedCategorySlug(slug);
        setCustomerTab('categories');
        setActiveScreen('tab');
      } else if (clean.startsWith('/product/')) {
        const prodId = clean.replace('/product/', '');
        setSelectedProductId(prodId);
        setActiveScreen('product_detail');
      } else if (clean.startsWith('/order/')) {
        const orderId = clean.replace('/order/', '');
        setSelectedOrderId(orderId);
        setActiveScreen('order_tracking');
      } else if (clean === '/login' || clean === '/signin') {
        setActiveScreen('login');
      } else if (clean === '/search') {
        setActiveScreen('search');
      } else {
        setCustomerTab('home');
        setActiveScreen('tab');
      }

      try {
        if (typeof window !== 'undefined') {
          if (window.location.pathname !== clean) {
            window.history.pushState({ route: clean }, '', clean);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Add audit log helper
  const recordAudit = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      adminName: currentAdmin?.name || 'Authorized Admin',
      adminEmail: currentAdmin?.email || 'admin@zoodi.com',
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Notifications Engine Implementation
  const handleDeepLinkRoute = useCallback((link: string) => {
    if (!link) return;
    if (link.startsWith('order:')) {
      const orderId = link.replace('order:', '');
      setSelectedOrderId(orderId);
      setActiveScreen('order_tracking');
      setIsNotificationCenterOpen(false);
    } else if (link.startsWith('product:')) {
      const prodId = link.replace('product:', '');
      setSelectedProductId(prodId);
      setActiveScreen('product_detail');
      setIsNotificationCenterOpen(false);
    } else if (link.startsWith('category:')) {
      const catId = link.replace('category:', '');
      setSelectedCategorySlug(catId);
      setCustomerTab('categories');
      setActiveScreen('tab');
      setIsNotificationCenterOpen(false);
    } else if (link.startsWith('admin:')) {
      const mod = link.replace('admin:', '') as AdminModuleTab;
      setAdminModule(mod);
      navigateTo('/superadmin');
      setIsNotificationCenterOpen(false);
    } else if (link.startsWith('tab:')) {
      const tab = link.replace('tab:', '') as CustomerTab;
      setCustomerTab(tab);
      setActiveScreen('tab');
      setIsNotificationCenterOpen(false);
    }
  }, [navigateTo]);

  useEffect(() => {
    NotificationService.initServiceWorker().then(() => {
      NotificationService.registerFCMToken(customerProfile.id, 'customer').then((tok) => {
        if (tok) setFcmDeviceToken(tok);
      });
      NotificationService.listenToForeground((msg) => {
        sendNotification({
          recipientRole: 'customer',
          type: 'promotional',
          title: msg.title,
          message: msg.body,
          deepLink: msg.deepLink,
        });
      });
    });

    const handleDeepLinkEvent = (e: any) => {
      const link = e.detail?.deepLink;
      if (link) {
        handleDeepLinkRoute(link);
      }
    };

    window.addEventListener('ZOODI_NOTIFICATION_DEEPLINK', handleDeepLinkEvent);
    return () => {
      window.removeEventListener('ZOODI_NOTIFICATION_DEEPLINK', handleDeepLinkEvent);
    };
  }, [handleDeepLinkRoute, customerProfile.id, isCustomerLoggedIn]);

  const sendNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'deliveryStatus'>) => {
      if (notif.recipientRole === 'customer') {
        if (notif.type === 'promotional' && !customerNotifPrefs.promotionsAndOffers) return;
        if (notif.type === 'order_status' && !customerNotifPrefs.orderUpdates) return;
        if (notif.type === 'back_in_stock' && !customerNotifPrefs.backInStockAlerts) return;
        if (notif.type === 'account_security' && !customerNotifPrefs.accountSecurity) return;
      } else if (notif.recipientRole === 'admin') {
        if (notif.type === 'order_placed' && !adminNotifSettings.enableOrderAlerts) return;
        if (notif.type === 'payment_success' && !adminNotifSettings.enablePaymentAlerts) return;
        if ((notif.type === 'low_stock' || notif.type === 'out_of_stock') && !adminNotifSettings.enableStockAlerts) return;
        if (notif.type === 'catalogue_update' && !adminNotifSettings.enableCatalogueAlerts) return;
      }

      const newNotif: AppNotification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        deliveryStatus: 'delivered',
      };

      setNotifications((prev) => [newNotif, ...prev]);

      const soundEnabled = notif.recipientRole === 'admin' ? adminNotifSettings.soundEnabled : true;
      const pushEnabled =
        notif.recipientRole === 'admin'
          ? adminNotifSettings.browserPushEnabled
          : customerNotifPrefs.browserPushEnabled;

      if (soundEnabled) {
        NotificationService.playChime(notif.type === 'order_placed' ? 'success' : 'standard');
      }

      if (pushEnabled) {
        NotificationService.dispatchSystemPushNotification(notif.title, {
          body: notif.message,
          deepLink: notif.deepLink,
          sound: false,
        });
      }
    },
    [customerNotifPrefs, adminNotifSettings]
  );

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = (role: 'customer' | 'admin') => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (role === 'customer' && n.recipientRole !== 'admin') {
          return { ...n, isRead: true };
        }
        if (role === 'admin' && (n.recipientRole === 'admin' || n.recipientRole === 'all')) {
          return { ...n, isRead: true };
        }
        return n;
      })
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = (role: 'customer' | 'admin') => {
    setNotifications((prev) =>
      prev.filter((n) => {
        if (role === 'customer') return n.recipientRole === 'admin';
        return n.recipientRole === 'customer';
      })
    );
  };

  const requestPushPermission = async (): Promise<boolean> => {
    const res = await NotificationService.requestPermission();
    setPushPermission(res);
    if (res === 'granted') {
      const tok = await NotificationService.registerFCMToken();
      if (tok) setFcmDeviceToken(tok);
      return true;
    }
    return false;
  };

  const updateAdminNotifSettings = (settings: Partial<AdminNotificationSettings>) => {
    setAdminNotifSettings((prev) => ({ ...prev, ...settings }));
    recordAudit('ADMIN_NOTIFICATION_SETTINGS', 'Updated admin alert and sound trigger settings');
  };

  const updateCustomerNotifPrefs = (prefs: Partial<CustomerNotificationPreferences>) => {
    setCustomerNotifPrefs((prev) => ({ ...prev, ...prefs }));
  };

  const dispatchNotificationCampaign = async (data: {
    title: string;
    message: string;
    audience: 'all' | 'buyers' | 'wishlist';
    deepLink?: string;
    bannerImage?: string;
  }): Promise<{ success: boolean; count: number }> => {
    const audienceCount = data.audience === 'all' ? 1420 : data.audience === 'buyers' ? 680 : 340;
    const campaignId = `cmp_${Date.now()}`;
    const newCampaign: NotificationBroadcastCampaign = {
      id: campaignId,
      title: data.title,
      message: data.message,
      audience: data.audience,
      deepLink: data.deepLink,
      bannerImage: data.bannerImage,
      sentAt: new Date().toISOString(),
      sentByAdminName: currentAdmin?.name || 'Super Admin',
      targetCount: audienceCount,
      deliveredCount: Math.round(audienceCount * 0.98),
      openCount: 0,
      status: 'sent',
    };

    setNotificationCampaigns((prev) => [newCampaign, ...prev]);

    sendNotification({
      recipientRole: 'customer',
      type: 'promotional',
      title: data.title,
      message: data.message,
      deepLink: data.deepLink,
      campaignId,
      senderAdminName: currentAdmin?.name || 'Super Admin',
    });

    recordAudit(
      'NOTIFICATION_CAMPAIGN_BROADCAST',
      `Dispatched push broadcast "${data.title}" to ${data.audience} (${audienceCount} customers)`
    );
    return { success: true, count: audienceCount };
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.deepLink) {
      handleDeepLinkRoute(notif.deepLink);
    }
  };

  const unreadCustomerCount = notifications.filter(
    (n) => n.recipientRole !== 'admin' && !n.isRead
  ).length;

  const unreadAdminCount = notifications.filter(
    (n) => (n.recipientRole === 'admin' || n.recipientRole === 'all') && !n.isRead
  ).length;

  // Customer: Add to cart
  const addToCart = (
    product: Product,
    variant: ProductVariant,
    size?: string,
    quantity: number = 1
  ): { success: boolean; message?: string } => {
    const stockCheck = checkVariantStock(variant.stock, variant.sizeStock, size, quantity);
    if (!stockCheck.isAvailable) {
      return { success: false, message: stockCheck.message };
    }

    const effectivePrice =
      product.salePrice && product.salePrice > 0 && product.salePrice < product.price
        ? product.salePrice
        : variant.salePrice && variant.salePrice < variant.price
        ? variant.salePrice
        : product.price ?? variant.price;
    const cartItemId = `${product.id}_${variant.id}_${size || 'default'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > stockCheck.remaining) {
          return prev;
        }
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          variantId: variant.id,
          colorName: variant.colorName,
          colorCode: variant.colorCode,
          image: variant.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
          size,
          price: effectivePrice,
          quantity,
          maxStock: stockCheck.remaining,
        };
        return [...prev, newItem];
      }
    });

    return { success: true };
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const qty = Math.min(newQty, item.maxStock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const applyCouponCode = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);
    if (!found) {
      setCouponError('Invalid coupon code or expired');
      return false;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const pricing = calculateOrderPricing({
      subtotal,
      couponDiscountPercentage: found.discountPercentage,
      couponDiscountFixed: found.discountFixed,
      couponMinOrder: found.minOrder,
      couponMaxDiscount: found.maxDiscount,
    });

    if (pricing.couponError) {
      setCouponError(pricing.couponError);
      return false;
    }

    setActiveCoupon(found);
    setCouponError(null);
    return true;
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponError(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const placeOrder = async (
    address: Address,
    paymentMethod: 'gpay' | 'upi' | 'card' | 'netbanking' | 'cod',
    paymentMeta?: {
      upiId?: string;
      cardLast4?: string;
      bankName?: string;
      utrNumber?: string;
    }
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (!isOnline) {
      return { success: false, error: 'No internet connection. Order placement requires an active online backend.' };
    }
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const pricing = calculateOrderPricing({
      subtotal,
      couponDiscountPercentage: activeCoupon?.discountPercentage,
      couponDiscountFixed: activeCoupon?.discountFixed,
      couponMinOrder: activeCoupon?.minOrder,
      couponMaxDiscount: activeCoupon?.maxDiscount,
    });

    const orderId = `ZD-${Math.floor(10000 + Math.random() * 90000)}`;
    const utr = paymentMeta?.utrNumber || (paymentMethod === 'cod' ? undefined : `42${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    const txn = paymentMethod === 'cod' ? undefined : `GPAY-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const paidViaText =
      paymentMethod === 'gpay'
        ? `Google Pay UPI (${connectedGpayVpa})`
        : paymentMethod === 'upi'
        ? `UPI (${paymentMeta?.upiId || 'Direct'} -> GPay ${connectedGpayVpa})`
        : paymentMethod === 'card'
        ? `Card ending ${paymentMeta?.cardLast4 || '4242'} (Google Pay Gateway)`
        : paymentMethod === 'netbanking'
        ? `Netbanking (${paymentMeta?.bankName || 'SBI'} -> Google Pay Gateway)`
        : `Cash on Delivery (GPay QR on Delivery: ${connectedGpayVpa})`;

    const newOrder: Order = {
      id: orderId,
      customerId: customerProfile.id,
      customerName: address.name,
      customerEmail: customerProfile.email,
      customerPhone: address.phone,
      items: [...cart],
      amounts: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shipping: pricing.shipping,
        tax: pricing.tax,
        total: pricing.total,
      },
      shippingAddress: address,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        transactionId: txn,
        gpayReceiver: connectedGpayVpa,
        gpayAccount: gpayUserEmail,
        upiId: paymentMeta?.upiId || connectedGpayVpa,
        paidVia: paidViaText,
        utrNumber: utr,
      },
      status: 'confirmed',
      timeline: [
        {
          status: 'placed',
          timestamp: new Date().toISOString(),
          note: 'Order successfully placed via ZOODI mobile app',
        },
        {
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          note: paymentMethod === 'cod'
            ? `Cash on Delivery confirmed. Delivery agent will present Google Pay QR (${connectedGpayVpa}) upon doorstep arrival.`
            : `Payment of ₹${Math.round(pricing.total).toLocaleString('en-IN')} successfully processed & received into Google Pay account: ${connectedGpayVpa} (${gpayMerchantName}) [Ref UTR: ${utr}]`,
        },
      ],
      couponCode: activeCoupon?.code,
      createdAt: new Date().toISOString(),
    };

    // Atomically adjust stock for each item in product catalog
    setProducts((prev) =>
      prev.map((prod) => {
        const orderItem = cart.find((c) => c.productId === prod.id);
        if (!orderItem) return prod;

        const updatedVariants = prod.variants.map((v) => {
          if (v.id === orderItem.variantId) {
            const newStock = Math.max(0, v.stock - orderItem.quantity);
            const newSizeStock = { ...(v.sizeStock || {}) };
            if (orderItem.size && newSizeStock[orderItem.size] !== undefined) {
              newSizeStock[orderItem.size] = Math.max(0, newSizeStock[orderItem.size] - orderItem.quantity);
            }
            return {
              ...v,
              stock: newStock,
              sizeStock: newSizeStock,
            };
          }
          return v;
        });

        return { ...prod, variants: updatedVariants };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setActiveCoupon(null);
    setSelectedOrderId(orderId);

    // Customer Notification: Order Placed
    sendNotification({
      recipientRole: 'customer',
      type: 'order_status',
      title: 'Order Placed Successfully! 🎉',
      message: `Your order #${orderId} for ₹${Math.round(pricing.total).toLocaleString('en-IN')} has been placed.`,
      deepLink: `order:${orderId}`,
      orderId,
    });

    // Customer Notification: Payment Confirmation
    if (paymentMethod !== 'cod') {
      sendNotification({
        recipientRole: 'customer',
        type: 'payment_success',
        title: 'Payment Confirmed 💳',
        message: `Payment of ₹${Math.round(pricing.total).toLocaleString('en-IN')} confirmed via ${paidViaText}.`,
        deepLink: `order:${orderId}`,
        orderId,
      });
    }

    // Admin Notification: New Order Alert
    sendNotification({
      recipientRole: 'admin',
      type: 'order_placed',
      title: 'New Order Received! 🛍️',
      message: `Order #${orderId} (${address.name}) • ₹${Math.round(pricing.total).toLocaleString('en-IN')} • ${paymentMethod.toUpperCase()}`,
      deepLink: 'admin:orders',
      orderId,
    });

    return { success: true, orderId };
  };

  const addReview = (productId: string, rating: number, title: string, comment: string) => {
    const prod = products.find((p) => p.id === productId);
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      productName: prod?.name || 'ZOODI Product',
      customerId: customerProfile.id,
      customerName: customerProfile.name,
      rating,
      title,
      comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
      status: 'approved',
    };
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate product rating
    if (prod) {
      const prodReviews = [...reviews.filter((r) => r.productId === productId), newReview];
      const avg = prodReviews.reduce((s, r) => s + r.rating, 0) / prodReviews.length;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, rating: Math.round(avg * 10) / 10, reviewCount: prodReviews.length } : p
        )
      );
    }
  };

  const createSupportTicket = (subject: string, message: string, orderId?: string) => {
    const newTicket: SupportTicket = {
      id: `tkt_${Math.floor(100 + Math.random() * 900)}`,
      customerId: customerProfile.id,
      customerName: customerProfile.name,
      customerEmail: customerProfile.email,
      subject,
      orderId,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: [
        {
          sender: 'customer',
          text: message,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);

    // Admin alert for new support inquiry
    sendNotification({
      recipientRole: 'admin',
      type: 'support_ticket',
      title: 'New Support Ticket 💬',
      message: `${customerProfile.name}: ${subject}`,
      deepLink: 'admin:support',
    });
  };

  const replyToSupportTicket = (ticketId: string, message: string, isCustomer: boolean) => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: isCustomer ? 'open' : 'in_progress',
            messages: [
              ...t.messages,
              {
                sender: isCustomer ? 'customer' : 'admin',
                text: message,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return t;
      })
    );

    if (!isCustomer) {
      sendNotification({
        recipientRole: 'customer',
        type: 'support_ticket',
        title: 'Support Response 💬',
        message: `ZOODI Support replied: ${message.slice(0, 75)}...`,
        deepLink: 'tab:profile',
      });
    } else {
      sendNotification({
        recipientRole: 'admin',
        type: 'support_ticket',
        title: 'Support Ticket Reply 💬',
        message: `Customer replied on ticket #${ticketId}`,
        deepLink: 'admin:support',
      });
    }
  };

  // Customer authentication & session management
  const customerLogin = (method: 'google' | 'apple' | 'email', email?: string, name?: string) => {
    setIsCustomerLoggedIn(true);
    try {
      localStorage.setItem('zoodi_customer_logged_in', 'true');
    } catch {
      // ignore storage errors
    }
    if (email || name) {
      setCustomerProfile((prev) => ({
        ...prev,
        email: email || prev.email,
        name: name || prev.name,
      }));
    }
    NotificationService.registerFCMToken(customerProfile.id, 'customer');
    if (adminNotifSettings.enableCustomerAlerts) {
      sendNotification({
        recipientRole: 'admin',
        type: 'account_security',
        title: 'Customer Activity 👤',
        message: `${name || email || 'A customer'} signed into the app (${method.toUpperCase()}).`,
        deepLink: 'admin:customers',
      });
    }
  };

  const customerLogout = () => {
    setIsCustomerLoggedIn(false);
    try {
      localStorage.setItem('zoodi_customer_logged_in', 'false');
    } catch {
      // ignore storage errors
    }
    setActiveScreen('login');
  };

  // Admin authentication
  const adminLogin = (email: string, pass: string): { success: boolean; error?: string } => {
    // Verified admin accounts
    const emailNorm = email.trim().toLowerCase();
    const found = adminUsers.find((u) => u.email.toLowerCase() === emailNorm);
    if (!found) {
      return { success: false, error: 'Access Denied: Unrecognized administrator email' };
    }
    if (pass !== 'admin123' && pass !== 'zoodi2026') {
      return { success: false, error: 'Invalid administrator credentials' };
    }

    setCurrentAdmin(found);
    NotificationService.registerFCMToken(found.id, 'admin');
    recordAudit('ADMIN_LOGIN', `Admin ${found.name} (${found.role}) logged into management portal`);
    return { success: true };
  };

  const adminLogout = () => {
    if (currentAdmin) {
      recordAudit('ADMIN_LOGOUT', `Admin ${currentAdmin.name} logged out`);
    }
    setCurrentAdmin(null);
  };

  // Admin catalog actions
  const saveProduct = (product: Product) => {
    // Sanitize product variants so prices and default variant are completely consistent
    const rawVariants = product.variants && product.variants.length > 0 ? product.variants : [];
    const defaultVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      colorName: 'Standard',
      colorCode: '#192E4D',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      ],
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      price: product.price,
      salePrice: product.salePrice && product.salePrice < product.price ? product.salePrice : undefined,
      stock: 25,
      sizeStock: { S: 5, M: 10, L: 8, XL: 2 },
    };

    const variants = (rawVariants.length > 0 ? rawVariants : [defaultVariant]).map((v) => ({
      ...v,
      price: product.price,
      salePrice: product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? product.salePrice : undefined,
    }));

    const sanitizedProduct: Product = {
      ...product,
      variants,
    };

    const isEdit = products.some((p) => p.id === sanitizedProduct.id);
    if (isEdit) {
      setProducts((prev) => prev.map((p) => (p.id === sanitizedProduct.id ? sanitizedProduct : p)));
      recordAudit(
        'PRODUCT_UPDATE',
        `Updated product: ${sanitizedProduct.name} (${sanitizedProduct.id}) - Base Price ₹${sanitizedProduct.price}`
      );
    } else {
      setProducts((prev) => [sanitizedProduct, ...prev]);
      recordAudit(
        'PRODUCT_CREATE',
        `Created product: ${sanitizedProduct.name} (${sanitizedProduct.id}) - Base Price ₹${sanitizedProduct.price}`
      );
      if (adminNotifSettings.enableCatalogueAlerts) {
        sendNotification({
          recipientRole: 'admin',
          type: 'catalogue_update',
          title: 'Product Published 🏷️',
          message: `Product "${sanitizedProduct.name}" added to store catalogue.`,
          deepLink: 'admin:products',
        });
      }
    }
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    recordAudit('PRODUCT_DELETE', `Archived product: ${prod?.name || productId}`);
  };

  const saveCategory = (type: 'main' | 'sub' | 'subsub', item: any) => {
    const now = new Date().toISOString();
    const categoryItem = {
      ...item,
      id: item.id && item.id.trim() !== '' ? item.id.trim() : (type === 'main' ? `cat_${Date.now()}` : type === 'sub' ? `sub_${Date.now()}` : `subsub_${Date.now()}`),
      order: typeof item.order === 'number' ? item.order : 1,
      isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
      showOnHomepage: item.showOnHomepage !== undefined ? Boolean(item.showOnHomepage) : true,
      displayMode: item.displayMode || (item.image ? 'image' : 'text'),
      backgroundColor: item.backgroundColor || '#F0FDF4',
      textColor: item.textColor || '#0F766E',
      imageFit: item.imageFit || 'cover',
      imagePosition: item.imagePosition || 'center',
      updatedAt: now,
      createdAt: item.createdAt || now,
    };
    if (type === 'main') {
      setMainCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === categoryItem.id);
        return idx >= 0 ? prev.map((c) => (c.id === categoryItem.id ? categoryItem : c)) : [...prev, categoryItem];
      });
    } else if (type === 'sub') {
      setSubCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === categoryItem.id);
        return idx >= 0 ? prev.map((c) => (c.id === categoryItem.id ? categoryItem : c)) : [...prev, categoryItem];
      });
    } else {
      setSubSubCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === categoryItem.id);
        return idx >= 0 ? prev.map((c) => (c.id === categoryItem.id ? categoryItem : c)) : [...prev, categoryItem];
      });
    }
    recordAudit('CATEGORY_UPDATE', `Saved ${type} category: ${categoryItem.name} (${categoryItem.id})`);
  };

  const reorderMainCategories = (newOrdered: MainCategory[]) => {
    const updated = newOrdered.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    setMainCategories(updated);
    recordAudit('CATEGORY_REORDER', `Reordered ${updated.length} homepage main categories`);
  };

  const toggleCategoryHomepageVisibility = (id: string) => {
    setMainCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, showOnHomepage: c.showOnHomepage === false ? true : false } : c))
    );
    recordAudit('CATEGORY_TOGGLE_HOMEPAGE', `Toggled homepage visibility for category ${id}`);
  };

  const toggleCategoryActiveStatus = (type: 'main' | 'sub' | 'subsub', id: string) => {
    if (type === 'main') {
      setMainCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    } else if (type === 'sub') {
      setSubCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    } else {
      setSubSubCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    }
    recordAudit('CATEGORY_TOGGLE_ACTIVE', `Toggled active status for ${type} category ${id}`);
  };

  const deleteCategory = (type: 'main' | 'sub' | 'subsub', id: string): { success: boolean; message?: string } => {
    // Check dependencies
    if (type === 'main') {
      const hasSubs = subCategories.some((s) => s.mainCategoryId === id);
      const hasProds = products.some((p) => p.mainCategoryId === id);
      if (hasSubs || hasProds) {
        return {
          success: false,
          message: 'Cannot delete: Category has active subcategories or products assigned.',
        };
      }
      setMainCategories((prev) => prev.filter((c) => c.id !== id));
    } else if (type === 'sub') {
      const hasSubSubs = subSubCategories.some((s) => s.subCategoryId === id);
      const hasProds = products.some((p) => p.subCategoryId === id);
      if (hasSubSubs || hasProds) {
        return {
          success: false,
          message: 'Cannot delete: Subcategory contains sub-subcategories or products.',
        };
      }
      setSubCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const hasProds = products.some((p) => p.subSubCategoryId === id);
      if (hasProds) {
        return {
          success: false,
          message: 'Cannot delete: Sub-subcategory contains assigned products.',
        };
      }
      setSubSubCategories((prev) => prev.filter((c) => c.id !== id));
    }
    recordAudit('CATEGORY_DELETE', `Deleted ${type} category: ${id}`);
    return { success: true };
  };

  const updateHomepageSections = async (sections: HomepageSection[]): Promise<boolean> => {
    const sanitized = sections.map((s, idx) => ({
      ...s,
      order: idx + 1,
      updatedAt: new Date().toISOString(),
    }));
    setHomepageSections(sanitized);
    const ok = await dbSaveHomepageSections(sanitized);
    recordAudit('HOMEPAGE_BUILDER_UPDATE', `Updated and persisted ${sanitized.length} homepage sections`);
    return ok;
  };

  const saveHomepageDraft = async (sections: HomepageSection[]): Promise<boolean> => {
    const sanitized = sections.map((s, idx) => ({
      ...s,
      order: idx + 1,
      draftChanges: true,
      updatedAt: new Date().toISOString(),
    }));
    setHomepageDraft(sanitized);
    const ok = await dbSaveHomepageDraft(sanitized);
    recordAudit('HOMEPAGE_DRAFT_SAVE', `Saved draft with ${sanitized.length} homepage sections`);
    return ok;
  };

  const publishHomepageDraft = async (): Promise<boolean> => {
    const target = homepageDraft || homepageSections;
    const sanitized = target.map((s, idx) => ({
      ...s,
      order: idx + 1,
      draftChanges: false,
      updatedAt: new Date().toISOString(),
    }));
    setHomepageSections(sanitized);
    setHomepageDraft(null);
    const ok = await dbSaveHomepageSections(sanitized);
    await dbSaveHomepageDraft([]);
    try {
      localStorage.removeItem('zoodi_homepage_draft');
    } catch {
      // ignore
    }
    recordAudit('HOMEPAGE_PUBLISH', `Published live homepage with ${sanitized.length} sections`);
    return ok;
  };

  const discardHomepageDraft = async (): Promise<boolean> => {
    setHomepageDraft(null);
    await dbSaveHomepageDraft([]);
    try {
      localStorage.removeItem('zoodi_homepage_draft');
    } catch {
      // ignore
    }
    recordAudit('HOMEPAGE_DRAFT_DISCARD', 'Discarded unpublished homepage draft changes');
    return true;
  };

  const resetHomepageToDefault = async (): Promise<boolean> => {
    setHomepageSections(INITIAL_HOMEPAGE_SECTIONS);
    setHomepageDraft(null);
    const ok = await dbSaveHomepageSections(INITIAL_HOMEPAGE_SECTIONS);
    await dbSaveHomepageDraft([]);
    try {
      localStorage.removeItem('zoodi_homepage_draft');
    } catch {
      // ignore
    }
    recordAudit('HOMEPAGE_RESET', 'Reset homepage sections to factory default');
    return ok;
  };

  const deleteHomepageSection = async (sectionId: string): Promise<boolean> => {
    const currentList = homepageDraft || homepageSections;
    const filtered = currentList.filter((s) => s.id !== sectionId);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1, updatedAt: new Date().toISOString() }));
    if (homepageDraft) {
      return saveHomepageDraft(reordered);
    } else {
      return updateHomepageSections(reordered);
    }
  };

  const duplicateHomepageSection = async (sectionId: string): Promise<boolean> => {
    const currentList = homepageDraft || homepageSections;
    const idx = currentList.findIndex((s) => s.id === sectionId);
    if (idx === -1) return false;
    const original = currentList[idx];
    const clone: HomepageSection = {
      ...original,
      id: `sec_${original.type}_${Date.now()}`,
      title: `${original.title} (Copy)`,
      order: original.order + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...currentList];
    updated.splice(idx + 1, 0, clone);
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    if (homepageDraft) {
      return saveHomepageDraft(reordered);
    } else {
      return updateHomepageSections(reordered);
    }
  };

  const saveSingleHomepageSection = async (section: HomepageSection): Promise<boolean> => {
    const currentList = homepageDraft || homepageSections;
    const existingIdx = currentList.findIndex((s) => s.id === section.id);
    let updated: HomepageSection[];
    if (existingIdx >= 0) {
      updated = currentList.map((s) =>
        s.id === section.id ? { ...section, updatedAt: new Date().toISOString() } : s
      );
    } else {
      const newSec: HomepageSection = {
        ...section,
        order: currentList.length + 1,
        createdAt: section.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [...currentList, newSec];
    }
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    if (homepageDraft) {
      return saveHomepageDraft(reordered);
    } else {
      return updateHomepageSections(reordered);
    }
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    courierData?: { courier: string; trackingNumber: string; estimatedDelivery: string },
    note?: string
  ): { success: boolean; message?: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    if (!isValidStatusTransition(order.status, newStatus)) {
      return {
        success: false,
        message: `Illegal status transition from "${order.status}" to "${newStatus}"`,
      };
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newTimelineItem = {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${newStatus.replace('_', ' ')}`,
            updatedBy: currentAdmin?.name || 'Administrator',
          };
          return {
            ...o,
            status: newStatus,
            timeline: [...o.timeline, newTimelineItem],
            courierTracking: courierData || o.courierTracking,
          };
        }
        return o;
      })
    );

    const statusTitles: Record<OrderStatus, string> = {
      placed: 'Order Placed',
      confirmed: 'Order Confirmed! ✅',
      processing: 'Order Processing ⚙️',
      packed: 'Order Packed & Ready 📦',
      shipped: 'Order Shipped 🚚',
      out_for_delivery: 'Out for Delivery 🛵',
      delivered: 'Order Delivered! 🎊',
      cancelled: 'Order Cancelled ⚠️',
      refunded: 'Refund Processed 💰',
    };

    const statusMessages: Record<OrderStatus, string> = {
      placed: `Your order #${orderId} is placed and under review.`,
      confirmed: `Your order #${orderId} has been confirmed by our store team.`,
      processing: `Your order #${orderId} is currently being processed by fulfillment.`,
      packed: `Your order #${orderId} is packed with care and awaiting pickup.`,
      shipped: courierData
        ? `Your order #${orderId} has been dispatched via ${courierData.courier} (AWB: ${courierData.trackingNumber}).`
        : `Your order #${orderId} has been dispatched.`,
      out_for_delivery: `Your order #${orderId} is out for delivery today. Keep your phone handy!`,
      delivered: `Your order #${orderId} has been successfully delivered. Enjoy your purchase!`,
      cancelled: `Your order #${orderId} has been cancelled. Any eligible refund will be credited.`,
      refunded: `Refund for order #${orderId} has been processed back to your payment account.`,
    };

    // Customer status push notification
    sendNotification({
      recipientRole: 'customer',
      type: newStatus === 'cancelled' ? 'refund' : 'order_status',
      title: statusTitles[newStatus] || `Order Status: ${newStatus}`,
      message: statusMessages[newStatus] || `Your order #${orderId} status changed to ${newStatus}.`,
      deepLink: `order:${orderId}`,
      orderId,
    });

    // Admin cancellation alert
    if (newStatus === 'cancelled') {
      sendNotification({
        recipientRole: 'admin',
        type: 'refund',
        title: 'Order Cancelled ⚠️',
        message: `Order #${orderId} cancelled by ${currentAdmin?.name || 'Administrator'}.`,
        deepLink: 'admin:orders',
        orderId,
      });
    }

    recordAudit('ORDER_STATUS_UPDATE', `Order ${orderId} moved to ${newStatus}`);
    return { success: true };
  };

  const updateVariantStock = (
    productId: string,
    variantId: string,
    newStock: number,
    sizeStock?: Record<string, number>
  ) => {
    const prod = products.find((p) => p.id === productId);
    const existingVariant = prod?.variants.find((v) => v.id === variantId);
    const prodLabel = prod ? `${prod.name} (${existingVariant?.colorName || 'Variant'})` : 'Product';

    if (newStock === 0) {
      sendNotification({
        recipientRole: 'admin',
        type: 'out_of_stock',
        title: 'Out of Stock Alert! 🚨',
        message: `${prodLabel} is now completely out of stock (0 units).`,
        deepLink: 'admin:inventory',
      });
    } else if (newStock <= 5) {
      sendNotification({
        recipientRole: 'admin',
        type: 'low_stock',
        title: 'Low Stock Warning ⚠️',
        message: `${prodLabel} is running low (${newStock} units remaining).`,
        deepLink: 'admin:inventory',
      });
    } else if (existingVariant && existingVariant.stock === 0 && newStock > 0) {
      // Replenished from 0 -> customer back in stock alert
      sendNotification({
        recipientRole: 'customer',
        type: 'back_in_stock',
        title: 'Back in Stock! ✨',
        message: `${prodLabel} is back in stock! Grab yours before it sells out again.`,
        deepLink: `product:${productId}`,
      });
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedVariants = p.variants.map((v) => {
            if (v.id === variantId) {
              return {
                ...v,
                stock: newStock,
                sizeStock: sizeStock || v.sizeStock,
              };
            }
            return v;
          });
          return { ...p, variants: updatedVariants };
        }
        return p;
      })
    );
    recordAudit('INVENTORY_ADJUSTMENT', `Adjusted stock for product ${productId}, variant ${variantId} -> ${newStock}`);
  };

  const saveCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      const exists = prev.some((c) => c.code === coupon.code);
      return exists ? prev.map((c) => (c.code === coupon.code ? coupon : c)) : [coupon, ...prev];
    });
    recordAudit('COUPON_SAVED', `Configured coupon code: ${coupon.code}`);
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    recordAudit('COUPON_DELETED', `Deleted coupon: ${code}`);
  };

  const moderateReview = (reviewId: string, status: 'approved' | 'rejected') => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
    recordAudit('REVIEW_MODERATION', `Review ${reviewId} marked as ${status}`);
  };

  const saveAdminUser = (
    user: Partial<AdminUser> & { name: string; email: string; role: AdminRole }
  ): { success: boolean; message?: string } => {
    const cleanEmail = user.email.trim().toLowerCase();
    if (!user.name.trim()) return { success: false, message: 'Administrator name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Valid corporate email is required.' };
    }

    if (user.id) {
      // Update existing admin
      const existing = adminUsers.find((u) => u.id === user.id);
      if (!existing) return { success: false, message: 'Admin user not found.' };

      // Prevent demoting the last active super_admin
      if (existing.role === 'super_admin' && user.role !== 'super_admin') {
        const superAdmins = adminUsers.filter((u) => u.role === 'super_admin');
        if (superAdmins.length <= 1) {
          return {
            success: false,
            message: 'Security policy: At least one Super Admin account must remain active.',
          };
        }
      }

      setAdminUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...user, email: cleanEmail } : u))
      );
      if (currentAdmin?.id === user.id) {
        setCurrentAdmin((prev) => (prev ? { ...prev, ...user, email: cleanEmail } : null));
      }
      recordAudit('ADMIN_USER_UPDATED', `Updated admin profile for ${user.name} (${user.role})`);
      return { success: true };
    } else {
      // Provision new admin
      const duplicate = adminUsers.some((u) => u.email.toLowerCase() === cleanEmail);
      if (duplicate) {
        return { success: false, message: `An administrator account with email ${cleanEmail} already exists.` };
      }

      const newAdmin: AdminUser = {
        id: `adm_${Date.now()}`,
        name: user.name.trim(),
        email: cleanEmail,
        role: user.role,
        department: user.department || 'Operations',
        phone: user.phone || '',
        avatar:
          user.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        lastActive: 'Never',
        status: user.status || 'active',
      };
      setAdminUsers((prev) => [newAdmin, ...prev]);
      recordAudit('ADMIN_USER_CREATED', `Provisioned new admin account: ${user.name} (${user.role})`);
      return { success: true };
    }
  };

  const deleteAdminUser = (adminId: string): { success: boolean; message?: string } => {
    const target = adminUsers.find((u) => u.id === adminId);
    if (!target) return { success: false, message: 'Admin user not found.' };

    if (currentAdmin && currentAdmin.id === adminId) {
      return { success: false, message: 'Security restriction: You cannot delete your currently active session account.' };
    }

    if (target.role === 'super_admin') {
      const superAdmins = adminUsers.filter((u) => u.role === 'super_admin');
      if (superAdmins.length <= 1) {
        return { success: false, message: 'Security restriction: Cannot delete the only remaining Super Admin account.' };
      }
    }

    setAdminUsers((prev) => prev.filter((u) => u.id !== adminId));
    recordAudit('ADMIN_USER_DELETED', `Revoked and deleted admin account: ${target.name} (${target.email})`);
    return { success: true };
  };

  const switchAdminUser = (adminId: string): { success: boolean; message?: string } => {
    const target = adminUsers.find((u) => u.id === adminId);
    if (!target) return { success: false, message: 'Admin user not found.' };
    if (target.status === 'suspended') {
      return { success: false, message: 'Cannot switch to a suspended administrator account.' };
    }

    setCurrentAdmin(target);
    recordAudit('ADMIN_ROLE_SIMULATION', `Session switched to simulate ${target.name} (${target.role})`);
    return { success: true };
  };

  const toggleAdminUserStatus = (adminId: string): void => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === adminId) {
          const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
          recordAudit('ADMIN_STATUS_CHANGED', `Admin ${u.name} status changed to ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const addAdminUser = (name: string, email: string, role: AdminRole) => {
    saveAdminUser({ name, email, role });
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
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
        searchQuery,
        setSearchQuery,
        isOnline,
        setIsOnline,
        deviceFrameMode,
        setDeviceFrameMode,
        products,
        mainCategories,
        subCategories,
        subSubCategories,
        homepageSections,
        coupons,
        activeCoupon,
        couponError,
        isCouponsModalOpen,
        setIsCouponsModalOpen,
        connectedGpayVpa,
        setConnectedGpayVpa,
        gpayMerchantName,
        setGpayMerchantName,
        gpayUserEmail,
        gpayPhone,
        isCustomerLoggedIn,
        customerLogin,
        customerLogout,
        customerProfile,
        cart,
        wishlistIds,
        orders,
        reviews,
        supportTickets,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        applyCouponCode,
        removeCoupon,
        toggleWishlist,
        placeOrder,
        addReview,
        createSupportTicket,
        replyToSupportTicket,
        currentAdmin,
        adminModule,
        setAdminModule,
        adminLogin,
        adminLogout,
        auditLogs,
        adminUsers,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        reorderMainCategories,
        toggleCategoryHomepageVisibility,
        toggleCategoryActiveStatus,
        updateHomepageSections,
        homepageDraft,
        saveHomepageDraft,
        publishHomepageDraft,
        discardHomepageDraft,
        resetHomepageToDefault,
        deleteHomepageSection,
        duplicateHomepageSection,
        saveSingleHomepageSection,
        updateOrderStatus,
        updateVariantStock,
        saveCoupon,
        deleteCoupon,
        moderateReview,
        addAdminUser,
        saveAdminUser,
        deleteAdminUser,
        switchAdminUser,
        toggleAdminUserStatus,
        notifications,
        unreadCustomerCount,
        unreadAdminCount,
        adminNotifSettings,
        customerNotifPrefs,
        notificationCampaigns,
        pushPermission,
        fcmDeviceToken,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        isNotifPreferencesOpen,
        setIsNotifPreferencesOpen,
        sendNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        requestPushPermission,
        updateAdminNotifSettings,
        updateCustomerNotifPrefs,
        dispatchNotificationCampaign,
        handleNotificationClick,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
