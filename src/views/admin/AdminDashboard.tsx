import React, { useState, useEffect } from 'react';
import { useApp, AdminModuleTab } from '../../context/AppContext';
import { Product, ProductVariant, HomepageSection, OrderStatus, AdminRole, Coupon } from '../../types';
import { hasAdminPermission } from '../../lib/commerceLogic';
import { ZoodiLogo } from '../../components/ZoodiLogo';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  Boxes,
  Tag,
  Users,
  Star,
  LifeBuoy,
  ShieldCheck,
  History,
  FileCode2,
  LogOut,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RefreshCw,
  X,
  Store,
  ExternalLink,
  Bell,
  Copy,
  CreditCard,
  Sliders,
} from 'lucide-react';

import { CategoryManagementView } from './CategoryManagementView';
import { CategoryTemplateManager } from '../../components/admin/CategoryTemplateManager';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { CategoryModal, CategoryLevel } from '../../components/admin/CategoryModal';
import { AdminRbacView } from './AdminRbacView';
import { AdminCustomersView } from './AdminCustomersView';
import { DynamicHomepageBuilder } from './DynamicHomepageBuilder';
import { AdminNotificationStudio } from './AdminNotificationStudio';

export const AdminDashboard: React.FC = () => {
  const {
    currentAdmin,
    adminLogout,
    navigateTo,
    adminModule,
    setAdminModule,
    unreadAdminCount,
    products,
    saveProduct,
    deleteProduct,
    mainCategories,
    subCategories,
    subSubCategories,
    saveCategory,
    deleteCategory,
    homepageSections,
    updateHomepageSections,
    orders,
    updateOrderStatus,
    updateVariantStock,
    coupons,
    saveCoupon,
    deleteCoupon,
    reviews,
    moderateReview,
    supportTickets,
    replyToSupportTicket,
    adminUsers,
    addAdminUser,
    auditLogs,
    connectedGpayVpa,
    setConnectedGpayVpa,
    gpayMerchantName,
    setGpayMerchantName,
    gpayUserEmail,
    gpayPhone,
  } = useApp();

  const role = currentAdmin?.role || 'super_admin';

  // State for Add / Edit Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  // Inventory Restock modal state
  const [restockItem, setRestockItem] = useState<{
    productId: string;
    variantId: string;
    colorName: string;
    currentStock: number;
  } | null>(null);
  const [addStockAmount, setAddStockAmount] = useState(10);

  // Tracking number form state
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<string | null>(null);
  const [courierName, setCourierName] = useState('BlueDart Express');
  const [courierCode, setCourierCode] = useState('BLUEDART-882194');

  // Support ticket reply
  const [adminReplyText, setAdminReplyText] = useState('');

  // In-app Notification / Toast state
  const [adminNotice, setAdminNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showNotice = (message?: string, type: 'success' | 'error' = 'success') => {
    setAdminNotice({
      type,
      message: message || (type === 'success' ? 'Action completed successfully' : 'Operation encountered an issue'),
    });
    setTimeout(() => setAdminNotice(null), 4500);
  };

  // State for Add / Edit Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [cCode, setCCode] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cDiscountType, setCDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [cValue, setCValue] = useState<number>(10);
  const [cMinOrder, setCMinOrder] = useState<number>(0);
  const [cMaxDiscount, setCMaxDiscount] = useState<number | undefined>(undefined);
  const [cExpiresAt, setCExpiresAt] = useState('');
  const [cIsActive, setCIsActive] = useState(true);

  // Delete Confirmation State for Coupons
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  const openAddCouponModal = () => {
    setEditingCouponCode(null);
    setCCode('');
    setCDesc('');
    setCDiscountType('fixed');
    setCValue(100);
    setCMinOrder(0);
    setCMaxDiscount(undefined);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setCExpiresAt(d.toISOString().split('T')[0]);
    setCIsActive(true);
    setShowCouponModal(true);
  };

  const openEditCouponModal = (c: Coupon) => {
    setEditingCouponCode(c.code);
    setCCode(c.code);
    setCDesc(c.description || '');
    if (c.discountPercentage !== undefined && c.discountPercentage > 0) {
      setCDiscountType('percentage');
      setCValue(c.discountPercentage);
    } else {
      setCDiscountType('fixed');
      setCValue(c.discountFixed || 0);
    }
    setCMinOrder(c.minOrder || 0);
    setCMaxDiscount(c.maxDiscount);
    setCExpiresAt(c.expiresAt ? c.expiresAt.split('T')[0] : '');
    setCIsActive(c.isActive !== undefined ? c.isActive : true);
    setShowCouponModal(true);
  };

  const handleSaveCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = cCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      showNotice('Coupon code is required', 'error');
      return;
    }
    if (cValue <= 0) {
      showNotice('Discount value must be greater than 0', 'error');
      return;
    }

    const couponObj: Coupon = {
      code: cleanCode,
      description: cDesc.trim() || `${cleanCode} offer`,
      discountPercentage: cDiscountType === 'percentage' ? Number(cValue) : undefined,
      discountFixed: cDiscountType === 'fixed' ? Number(cValue) : undefined,
      minOrder: Number(cMinOrder) || 0,
      maxDiscount: cDiscountType === 'percentage' && cMaxDiscount ? Number(cMaxDiscount) : undefined,
      expiresAt: cExpiresAt || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: cIsActive,
    };

    saveCoupon(couponObj);
    showNotice(editingCouponCode ? `Coupon ${cleanCode} updated!` : `Coupon ${cleanCode} created!`, 'success');
    setShowCouponModal(false);
  };

  const handleToggleCouponActive = (c: Coupon) => {
    const updated: Coupon = {
      ...c,
      isActive: !c.isActive,
    };
    saveCoupon(updated);
    showNotice(`Coupon ${c.code} is now ${!c.isActive ? 'Active' : 'Inactive'}`, 'success');
  };

  const handleDeleteCouponConfirm = () => {
    if (!deletingCoupon) return;
    deleteCoupon(deletingCoupon.code);
    showNotice(`Coupon ${deletingCoupon.code} deleted successfully`, 'success');
    setDeletingCoupon(null);
  };

  const handleDeleteProductConfirm = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    showNotice(`Product "${deletingProduct.name}" deleted successfully from store & database`, 'success');
    setDeletingProduct(null);
  };

  // Payment Receiver state (Admin only)
  const [adminGpayVpa, setAdminGpayVpa] = useState(connectedGpayVpa);
  const [adminGpayName, setAdminGpayName] = useState(gpayMerchantName);
  const [isEditingGpay, setIsEditingGpay] = useState(false);
  const [gpayCopied, setGpayCopied] = useState(false);

  useEffect(() => {
    setAdminGpayVpa(connectedGpayVpa);
    setAdminGpayName(gpayMerchantName);
  }, [connectedGpayVpa, gpayMerchantName]);

  const handleSavePaymentReceiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminGpayVpa.trim()) {
      showNotice('Google Pay UPI VPA is required', 'error');
      return;
    }
    setConnectedGpayVpa(adminGpayVpa.trim());
    setGpayMerchantName(adminGpayName.trim() || 'Ayisha N.P.');
    showNotice(`Store payment settlement account updated to ${adminGpayVpa.trim()} (${adminGpayName.trim()})`, 'success');
    setIsEditingGpay(false);
  };

  const handleCopyAdminVpa = () => {
    navigator.clipboard.writeText(connectedGpayVpa);
    setGpayCopied(true);
    setTimeout(() => setGpayCopied(false), 2000);
  };

  // Calculate Executive Metrics
  const totalRevenue = orders
    .filter((o) => o.payment.status === 'paid')
    .reduce((sum, o) => sum + o.amounts.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const lowStockVariantCount = products.reduce(
    (count, p) => count + p.variants.filter((v) => v.stock < 10).length,
    0
  );

  // Available Admin Modules
  const modules: Array<{ id: AdminModuleTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Products & Variants', icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: '3-Level Categories', icon: <Layers className="w-4 h-4" /> },
    { id: 'category_templates', label: 'Product Specification Templates', icon: <Sliders className="w-4 h-4" /> },
    { id: 'homepage_builder', label: 'Homepage Builder', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders & Fulfillment', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'inventory', label: 'Variant Inventory', icon: <Boxes className="w-4 h-4" /> },
    { id: 'coupons_marketing', label: 'Coupons & Deals', icon: <Tag className="w-4 h-4" /> },
    { id: 'notifications', label: 'Push Notifications & Studio', icon: <Bell className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews Moderation', icon: <Star className="w-4 h-4" /> },
    { id: 'support', label: 'Support Tickets', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'admin_users', label: 'Single Admin Security', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'audit_logs', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'flutter_export', label: 'Flutter Architecture', icon: <FileCode2 className="w-4 h-4" /> },
  ];

  // Deep Link URL Sync: synchronize current adminModule with URL query params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get('module') as any;
      if (mod && modules.some((m) => m.id === mod)) {
        if (adminModule !== mod && hasAdminPermission(role, mod)) {
          setAdminModule(mod);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('module') !== adminModule) {
        url.searchParams.set('module', adminModule);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // ignore
    }
  }, [adminModule]);

  // Homepage builder reorder helpers
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const updated = [...homepageSections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    // Reassign orders
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    updateHomepageSections(reordered);
  };

  const toggleSectionActive = (id: string) => {
    const updated = homepageSections.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    updateHomepageSections(updated);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col text-left">
      {/* Top Corporate Admin Bar */}
      <header className="bg-[#192E4D] text-white px-5 py-3 flex items-center justify-between border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-3">
          <ZoodiLogo size="sm" showTagline={false} lightMode={true} />
          <div className="hidden sm:block h-5 w-[1px] bg-slate-600" />
          <span className="hidden sm:inline-block text-xs font-bold text-teal-300">
            Control Center
          </span>
        </div>

        {/* User Role & Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#08A9A2] text-white flex items-center justify-center font-bold text-xs">
              Z
            </div>
            <div className="hidden sm:block text-xs">
              <span className="font-bold text-white block">ZOODI Super Admin</span>
              <span className="text-[10px] text-teal-300 font-mono">
                zoodicollection@gmail.com
              </span>
            </div>
          </div>

          {/* Admin Notifications Shortcut */}
          <button
            type="button"
            onClick={() => setAdminModule('notifications')}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            title={`Store Alerts (${unreadAdminCount} unread)`}
            aria-label={`Notifications, ${unreadAdminCount} unread`}
          >
            <Bell className="w-4 h-4" />
            {unreadAdminCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F20D58] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {unreadAdminCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Logout"
            onClick={() => {
              adminLogout();
              navigateTo('/');
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Layout: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Nav */}
        <nav
          aria-label="Admin Navigation"
          className="w-full md:w-64 bg-white border-r border-[#E6EAF0] p-3 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar"
        >
          {modules.map((m) => {
            const isPermitted = hasAdminPermission(role, m.id as any);
            const isSelected = adminModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={!isPermitted}
                onClick={() => setAdminModule(m.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 md:w-full text-left ${
                  isSelected
                    ? 'bg-[#08A9A2] text-white shadow-sm'
                    : isPermitted
                    ? 'text-[#192E4D] hover:bg-[#F6F8FA]'
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {adminNotice && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in ${
                adminNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {adminNotice.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{adminNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setAdminNotice(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* MODULE 1: DASHBOARD METRICS */}
          {adminModule === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-extrabold text-[#192E4D]">Executive Operations Overview</h1>
                <p className="text-xs text-[#697586] mt-0.5">
                  Live backend transaction and catalog metrics calculated from real records.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block">
                    Sales Revenue
                  </span>
                  <span className="text-2xl font-black text-[#192E4D] mt-1 block">
                    ₹{Math.round(totalRevenue).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-2">
                    Verified Paid Transactions
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block">
                    Active Orders
                  </span>
                  <span className="text-2xl font-black text-[#08A9A2] mt-1 block">
                    {totalOrdersCount}
                  </span>
                  <span className="text-[10px] text-[#08A9A2] font-bold bg-[#08A9A2]/10 px-2 py-0.5 rounded-md inline-block mt-2">
                    {pendingOrdersCount} Awaiting Fulfillment
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block">
                    Avg. Order Value (AOV)
                  </span>
                  <span className="text-2xl font-black text-[#FFB000] mt-1 block">
                    ₹{Math.round(averageOrderValue).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-2">
                    Per Order Average
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#697586] block">
                    Low Stock Warnings
                  </span>
                  <span className="text-2xl font-black text-[#F20D58] mt-1 block">
                    {lowStockVariantCount}
                  </span>
                  <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-2">
                    Variant Stock &lt; 10 Units
                  </span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-3">
                <h2 className="text-sm font-extrabold text-[#192E4D]">Quick Management Tasks</h2>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => openAddProductModal()}
                    className="px-3.5 py-2 rounded-xl bg-[#08A9A2] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Product & Variants</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminModule('homepage_builder')}
                    className="px-3.5 py-2 rounded-xl bg-[#192E4D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB000]" />
                    <span>Edit Dynamic Homepage Sections</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminModule('orders')}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#E6EAF0] hover:bg-[#F6F8FA] text-[#192E4D] text-xs font-bold flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#08A9A2]" />
                    <span>Fulfill Pending Orders</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminModule('flutter_export')}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Export Flutter & Dart Codebase</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: PRODUCTS & COLOR VARIANT MANAGER */}
          {adminModule === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-extrabold text-[#192E4D]">Catalog & Product Variants</h1>
                  <p className="text-xs text-[#697586]">
                    Configure multi-color variants with independent image galleries (e.g. Red, Yellow, Black).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddProductModal()}
                  className="px-3.5 py-2 rounded-xl bg-[#08A9A2] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Empty Products Notice */}
              {products.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#E6EAF0] text-[#697586] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-[#08A9A2] flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#192E4D]">No Products Found</h3>
                    <p className="text-xs text-[#697586] mt-0.5">
                      Your catalogue is currently empty. Click "Add Product" to create and publish items.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddProductModal()}
                    className="px-4 py-2.5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* MOBILE VIEW (Smartphones & small screens): Dedicated cards with large tap targets */}
                  <div className="block sm:hidden space-y-3">
                    {products.map((p) => {
                      const variants = p.variants || [];
                      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                      const primaryImg = variants[0]?.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80';
                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={primaryImg}
                              alt={p.name}
                              className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase font-bold text-[#08A9A2] tracking-wider block">
                                {p.brand}
                              </span>
                              <h3 className="font-extrabold text-xs text-[#192E4D] truncate">{p.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-black text-[#192E4D] text-xs">
                                  ₹{Math.round(p.price).toLocaleString('en-IN')}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    totalStock < 15 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {totalStock} in stock
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Color Variants Chips */}
                          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[11px] text-[#697586]">
                            <span className="font-bold text-[10px] uppercase text-slate-400">Colors:</span>
                            {variants.map((v) => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 shrink-0"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: v.colorCode }}
                                />
                                <span className="text-[10px] font-semibold">{v.colorName}</span>
                              </span>
                            ))}
                          </div>

                          {/* Touch-Friendly Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(p)}
                              className="h-10 px-3 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 text-[#08A9A2] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Product</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingProduct(p)}
                              className="h-10 px-3 rounded-xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Product</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP VIEW (Table): Wide view with complete details */}
                  <div className="hidden sm:block bg-white rounded-2xl border border-[#E6EAF0] overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full min-w-[650px] text-xs text-left">
                        <thead className="bg-[#F6F8FA] text-[#697586] font-bold border-b border-[#E6EAF0]">
                          <tr>
                            <th className="p-3">Product Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Base Price</th>
                            <th className="p-3">Color Variants & Independent Galleries</th>
                            <th className="p-3">Total Stock</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                          {products.map((p) => {
                            const variants = p.variants || [];
                            const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                            const primaryImg = variants[0]?.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80';
                            return (
                              <tr key={p.id} className="hover:bg-[#FBFDFE]">
                                <td className="p-3 font-bold text-[#192E4D]">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={primaryImg}
                                      alt=""
                                      className="w-10 h-10 object-cover rounded-lg border border-[#F0F4F8]"
                                    />
                                    <div>
                                      <span className="block">{p.name}</span>
                                      <span className="text-[10px] text-[#08A9A2] font-semibold">
                                        {p.brand}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-[#697586]">{p.mainCategoryId}</td>
                                <td className="p-3 font-extrabold text-[#192E4D]">
                                  ₹{Math.round(p.price).toLocaleString('en-IN')}
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-col gap-1">
                                    {variants.map((v) => (
                                      <div key={v.id} className="flex items-center gap-1.5">
                                        <span
                                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                          style={{ backgroundColor: v.colorCode }}
                                        />
                                        <span className="font-semibold text-[#192E4D]">
                                          {v.colorName}
                                        </span>
                                        <span className="text-[10px] text-[#697586]">
                                          ({(v.images || []).length} photos, {v.stock} pcs, SKU: {v.sku})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-3 font-bold">
                                  <span
                                    className={`px-2 py-0.5 rounded-md ${
                                      totalStock < 15
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'bg-emerald-50 text-emerald-700'
                                    }`}
                                  >
                                    {totalStock} units
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                    {p.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openEditProductModal(p)}
                                      className="p-1.5 text-[#08A9A2] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                      title="Edit Product & Colors"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingProduct(p)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MODULE 3: 3-LEVEL CATEGORIES TREE */}
          {adminModule === 'categories' && (
            <CategoryManagementView showNotice={showNotice} />
          )}

          {/* MODULE: CATEGORY SPECIFICATION TEMPLATES */}
          {adminModule === 'category_templates' && (
            <CategoryTemplateManager />
          )}

          {/* MODULE 4: DYNAMIC HOMEPAGE BUILDER */}
          {adminModule === 'homepage_builder' && (
            <DynamicHomepageBuilder />
          )}

          {/* MODULE 5: ORDERS & FULFILLMENT */}
          {adminModule === 'orders' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-extrabold text-[#192E4D]">Customer Orders & Logistics</h1>
                <p className="text-xs text-[#697586]">
                  Advance order fulfillment lifecycle and assign courier tracking details.
                </p>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F0F4F8]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#192E4D]">{ord.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#08A9A2]/10 text-[#08A9A2] uppercase">
                            {ord.status.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.payment.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            Payment: {ord.payment.status} ({ord.payment.method.toUpperCase()})
                          </span>
                        </div>
                        <span className="text-[11px] text-[#697586] block mt-0.5">
                          Customer: {ord.customerName} ({ord.customerEmail}) • {new Date(ord.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Advance Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) => {
                            const newSt = e.target.value as OrderStatus;
                            const res = updateOrderStatus(ord.id, newSt);
                            showNotice(res.message, res.success ? 'success' : 'error');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[#E6EAF0] text-xs font-bold text-[#192E4D] bg-white cursor-pointer focus:outline-hidden focus:border-[#08A9A2]"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    {/* Items and Amounts */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[#697586]">
                          {ord.items.map((i) => `${i.productName} (${i.colorName}, ${i.size}) x${i.quantity}`).join(', ')}
                        </span>
                      </div>
                      <span className="font-black text-[#192E4D] text-sm">
                        ₹{Math.round(ord.amounts.total).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Logistics Courier Tracking Code */}
                    <div className="p-2.5 rounded-xl bg-[#F6F8FA] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#192E4D]">Courier Tracking:</span>
                        <span className="font-mono text-[#697586]">
                          {ord.courierTracking?.courier || 'Pending'} — {ord.courierTracking?.trackingNumber || 'Unassigned'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForCourier(ord.id);
                          setCourierCode(ord.courierTracking?.trackingNumber || 'BLUEDART-882194');
                          setCourierName(ord.courierTracking?.courier || 'BlueDart Express');
                        }}
                        className="text-xs font-bold text-[#08A9A2] hover:text-[#068e88] hover:underline cursor-pointer p-1"
                      >
                        Update Tracking Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 6: VARIANT INVENTORY & STOCK RESTOCK */}
          {adminModule === 'inventory' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-extrabold text-[#192E4D]">Variant-Level Inventory Control</h1>
                <p className="text-xs text-[#697586]">
                  Every color and size variant combination has independent inventory tracking.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E6EAF0] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[650px] text-xs text-left">
                  <thead className="bg-[#F6F8FA] text-[#697586] font-bold border-b border-[#E6EAF0]">
                    <tr>
                      <th className="p-3">Product & Brand</th>
                      <th className="p-3">Color Variant</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Stock Per Size</th>
                      <th className="p-3 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4F8]">
                    {products.flatMap((prod) =>
                      prod.variants.map((v) => (
                        <tr key={v.id} className="hover:bg-[#FBFDFE]">
                          <td className="p-3 font-bold text-[#192E4D]">{prod.name}</td>
                          <td className="p-3 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: v.colorCode }}
                              />
                              <span>{v.colorName}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[#697586]">{v.sku}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold ${
                                v.stock < 10
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {v.stock} pcs
                            </span>
                          </td>
                          <td className="p-3 text-[#697586]">
                            {v.sizeStock
                              ? Object.entries(v.sizeStock)
                                  .map(([s, q]) => `${s}: ${q}`)
                                  .join(' | ')
                              : 'All Sizes'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setRestockItem({
                                  productId: prod.id,
                                  variantId: v.id,
                                  colorName: v.colorName,
                                  currentStock: v.stock,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#08A9A2] hover:bg-[#079690] text-white font-bold transition-colors"
                            >
                              + Restock
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}

          {/* MODULE 7: COUPONS & DEALS */}
          {adminModule === 'coupons_marketing' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E6EAF0]">
                <div>
                  <h1 className="text-lg font-extrabold text-[#192E4D]">Coupons & Promotional Offers</h1>
                  <p className="text-xs text-[#697586]">Create, edit, toggle, and manage discount codes for store checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddCouponModal}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-bold text-xs transition-all shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  + Create New Coupon
                </button>
              </div>

              {coupons.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E6EAF0]">
                  <Tag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-[#192E4D]">No coupons found</p>
                  <p className="text-xs text-[#697586] mb-4">Create your first coupon code to offer discounts to customers.</p>
                  <button
                    type="button"
                    onClick={openAddCouponModal}
                    className="px-4 py-2 bg-[#08A9A2] text-white font-bold text-xs rounded-xl"
                  >
                    Create Coupon
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((c) => (
                    <div
                      key={c.code}
                      className={`p-4 rounded-2xl bg-white border transition-all ${
                        c.isActive ? 'border-[#E6EAF0] shadow-2xs' : 'border-gray-200 bg-gray-50/60 opacity-80'
                      } space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-base text-[#08A9A2] tracking-wider">
                              {c.code}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                c.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-gray-200 text-gray-600 border border-gray-300'
                              }`}
                            >
                              {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <p className="text-xs text-[#697586] mt-1 line-clamp-2">{c.description}</p>
                        </div>
                        <span className="shrink-0 text-xs font-black px-2.5 py-1 rounded-xl bg-teal-50 text-[#08A9A2] border border-teal-100">
                          {c.discountPercentage !== undefined && c.discountPercentage > 0
                            ? `${c.discountPercentage}% OFF`
                            : `₹${c.discountFixed} OFF`}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-[#F0F4F8] text-xs font-semibold text-[#192E4D]">
                        <div className="flex justify-between">
                          <span className="text-[#697586]">Min Order:</span>
                          <span>₹{c.minOrder?.toLocaleString('en-IN') || 0}</span>
                        </div>
                        {c.maxDiscount !== undefined && c.maxDiscount > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-[#697586]">Max Discount Cap:</span>
                            <span>₹{c.maxDiscount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[#697586]">Expires:</span>
                          <span className="font-mono text-[11px]">
                            {c.expiresAt ? c.expiresAt.split('T')[0] : 'No expiry'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F8] gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleCouponActive(c)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            c.isActive
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={c.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                        >
                          {c.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditCouponModal(c)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCoupon(c)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODULE: CUSTOMER RELATIONSHIP DIRECTORY */}
          {adminModule === 'customers' && <AdminCustomersView />}

          {/* MODULE 8: REVIEWS MODERATION */}
          {adminModule === 'reviews' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-extrabold text-[#192E4D]">Customer Reviews Moderation</h1>
                <p className="text-xs text-[#697586]">Approve, reject, or audit user reviews for catalog products.</p>
              </div>

              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[#192E4D]">{r.productName}</span>
                        <div className="flex items-center gap-2 text-[#FFB000] mt-0.5">
                          <span className="font-black text-[#192E4D]">{r.rating} ★</span>
                          <span className="text-[#697586]">• by {r.customerName}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="font-bold text-[#192E4D]">{r.title}</p>
                    <p className="text-[#697586]">{r.comment}</p>
                    <div className="flex justify-end gap-2 pt-2 border-t border-[#F0F4F8]">
                      <button
                        type="button"
                        onClick={() => moderateReview(r.id, 'approved')}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateReview(r.id, 'rejected')}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 9: SUPPORT TICKETS */}
          {adminModule === 'support' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-extrabold text-[#192E4D]">Customer Care & Support Queue</h1>
                <p className="text-xs text-[#697586]">Resolve customer inquiries and reply directly into the app.</p>
              </div>

              <div className="space-y-3">
                {supportTickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#192E4D]">{t.subject}</span>
                      <span className="font-mono text-[10px] text-[#697586]">#{t.id}</span>
                    </div>
                    <div className="space-y-2 pt-2">
                      {t.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl ${
                            m.sender === 'admin'
                              ? 'bg-[#08A9A2]/10 text-[#192E4D]'
                              : 'bg-[#F6F8FA] text-[#192E4D]'
                          }`}
                        >
                          <span className="font-bold text-[10px] block text-[#697586]">
                            {m.sender === 'admin' ? 'Support Representative' : t.customerName}:
                          </span>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Write official response to customer..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#E6EAF0] rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!adminReplyText.trim()) return;
                          replyToSupportTicket(t.id, adminReplyText.trim(), false);
                          setAdminReplyText('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#08A9A2] text-white font-bold"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE: ADMIN ROLES & RBAC */}
          {adminModule === 'admin_users' && <AdminRbacView showNotice={showNotice} />}

          {/* MODULE 10: AUDIT TRAIL */}
          {adminModule === 'audit_logs' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-extrabold text-[#192E4D]">Immutable Administrative Audit Log</h1>
                <p className="text-xs text-[#697586]">
                  Every sensitive modification (price, inventory, status, login) is recorded with timestamp and admin identity.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E6EAF0] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[550px] text-xs text-left">
                    <thead className="bg-[#F6F8FA] text-[#697586] font-bold border-b border-[#E6EAF0]">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Administrator</th>
                        <th className="p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4F8]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#FBFDFE]">
                          <td className="p-3 font-mono text-[10px] text-[#697586]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-[#08A9A2]">{log.action}</td>
                          <td className="p-3 text-[#192E4D] font-semibold">{log.adminName}</td>
                          <td className="p-3 text-[#697586]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE: SETTINGS & SECURITY (Includes prominent Log Out button) */}
          {adminModule === 'settings' && (
            <div className="space-y-5 text-left">
              <div>
                <h1 className="text-lg font-extrabold text-[#192E4D]">Store & Admin Settings</h1>
                <p className="text-xs text-[#697586]">
                  Manage store parameters, localization, active staff session, and security controls.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Profile & Localization */}
                <div className="p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-[#F0F4F8] pb-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#08A9A2] flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#192E4D]">Store Configuration</h3>
                      <p className="text-[11px] text-[#697586]">Regional operations & currency rules</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 divide-y divide-[#F0F4F8]">
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Store Name</span>
                      <span className="font-bold text-[#192E4D]">ZOODI Collection</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Headquarters & Hub</span>
                      <span className="font-bold text-[#192E4D]">Mannarkkad, Palakkad & Kochi, Kerala</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Active Currency</span>
                      <span className="font-extrabold text-[#08A9A2]">Indian Rupee (₹ / INR)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Standard Apparel GST</span>
                      <span className="font-bold text-[#192E4D]">5% (Inclusive)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Free Delivery Threshold</span>
                      <span className="font-bold text-emerald-700">Orders above ₹999</span>
                    </div>
                  </div>
                </div>

                {/* Active Admin Session Profile */}
                <div className="p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-[#F0F4F8] pb-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#192E4D]">Active Session Profile</h3>
                      <p className="text-[11px] text-[#697586]">Currently authenticated operator</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 divide-y divide-[#F0F4F8]">
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Account Name</span>
                      <span className="font-bold text-[#192E4D]">{currentAdmin?.name || 'Administrator'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Work Email</span>
                      <span className="font-mono text-[#192E4D] font-bold">{currentAdmin?.email || 'admin@zoodi.com'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Assigned Role</span>
                      <span className="font-bold uppercase text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">
                        {role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#697586]">Department</span>
                      <span className="font-bold text-[#192E4D]">{currentAdmin?.department || 'Operations'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STORE PAYMENT RECEIVER & SETTLEMENT ACCOUNT (GOOGLE PAY / UPI) - ADMIN ONLY */}
              <div className="p-5 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F4F8] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-[#192E4D]">Payment Receiver & Settlement Account</h3>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Admin Controlled Only
                        </span>
                      </div>
                      <p className="text-[11px] text-[#697586]">Google Pay UPI account receiving all store customer checkouts</p>
                    </div>
                  </div>

                  {!isEditingGpay ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAdminGpayVpa(connectedGpayVpa);
                        setAdminGpayName(gpayMerchantName);
                        setIsEditingGpay(true);
                      }}
                      className="h-9 px-4 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Settlement Account</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingGpay(false)}
                      className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>

                {!isEditingGpay ? (
                  <div className="space-y-3">
                    {/* Visual Live Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#192E4D] to-[#25426E] text-white shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                            Live Google Pay Receiver Account
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                          Settlement Active
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                        <div>
                          <div className="text-base font-black text-white">{gpayMerchantName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-300">UPI ID (VPA):</span>
                            <code className="font-mono font-bold text-teal-300 bg-white/10 px-2.5 py-0.5 rounded text-xs">
                              {connectedGpayVpa}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopyAdminVpa}
                              className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                              title="Copy VPA"
                            >
                              {gpayCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="text-left sm:text-right text-[11px] text-slate-300 space-y-0.5">
                          <div>Phone: <span className="font-mono font-bold text-white">{gpayPhone}</span></div>
                          <div>Email: <span className="font-mono text-slate-300">{gpayUserEmail}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>Security & Privacy Guard:</strong> This settlement receiver configuration is strictly protected and editable only by administrators in this dashboard.
                        Customers on the checkout page cannot view this card or modify payment details.
                        Customer payments are securely routed directly to this verified UPI ID.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSavePaymentReceiver} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-[#192E4D] block mb-1">
                          Google Pay UPI ID (VPA) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={adminGpayVpa}
                          onChange={(e) => setAdminGpayVpa(e.target.value)}
                          placeholder="ayishanp1986@oksbi"
                          className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl font-mono text-xs focus:outline-hidden focus:border-[#08A9A2] bg-white"
                        />
                        <p className="text-[10px] text-[#697586] mt-1">Must be a valid active UPI ID registered in Google Pay.</p>
                      </div>

                      <div>
                        <label className="font-bold text-[#192E4D] block mb-1">
                          Account Holder / Merchant Beneficiary Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={adminGpayName}
                          onChange={(e) => setAdminGpayName(e.target.value)}
                          placeholder="Ayisha N.P."
                          className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-xs focus:outline-hidden focus:border-[#08A9A2] bg-white font-bold"
                        />
                        <p className="text-[10px] text-[#697586] mt-1">Exact name as shown in the connected bank account.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F4F8]">
                      <button
                        type="button"
                        onClick={() => setIsEditingGpay(false)}
                        className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="h-10 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Settlement Receiver</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* DANGER ZONE: LOGOUT BUTTON */}
              <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Session Control & Sign Out</span>
                    </h3>
                    <p className="text-[11px] text-[#697586]">
                      Terminate your active administrator session and return to the storefront.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      adminLogout();
                      navigateTo('/');
                    }}
                    className="h-11 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Admin Portal</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 11: NATIVE FLUTTER ARCHITECTURE & EXPORT HUB */}
          {adminModule === 'flutter_export' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-lg font-extrabold text-[#192E4D]">
                  Native Flutter & Dart Production Project
                </h1>
                <p className="text-xs text-[#697586]">
                  As required: Complete cross-platform mobile source files generated in{' '}
                  <code className="font-mono font-bold text-[#08A9A2]">/flutter_zoodi_project</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5 text-xs">
                  <h3 className="font-extrabold text-sm text-[#192E4D]">
                    Generated Flutter Code Tree
                  </h3>
                  <div className="font-mono text-[11px] bg-[#192E4D] text-teal-200 p-3 rounded-xl overflow-x-auto space-y-1">
                    <div>/flutter_zoodi_project</div>
                    <div>├── pubspec.yaml (Firebase, Bloc, GoRouter)</div>
                    <div>├── firestore.rules (Security RBAC rules)</div>
                    <div>├── storage.rules (Storage security)</div>
                    <div>├── lib/</div>
                    <div>│   ├── main.dart (Routing & /superadmin)</div>
                    <div>│   ├── core/theme/zoodi_theme.dart (Brand colors)</div>
                    <div>│   └── features/</div>
                    <div>│       ├── products/product_detail_screen.dart</div>
                    <div>│       ├── home/home_screen.dart</div>
                    <div>│       └── admin/admin_dashboard_screen.dart</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2.5 text-xs">
                  <h3 className="font-extrabold text-sm text-[#192E4D]">
                    How to Build for Android & iOS
                  </h3>
                  <div className="space-y-2 text-[#697586]">
                    <p>
                      <strong>1. Install Flutter SDK:</strong> Ensure Flutter 3.2+ is on your machine.
                    </p>
                    <p>
                      <strong>2. Fetch Dependencies:</strong> Run{' '}
                      <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                        flutter pub get
                      </code>
                    </p>
                    <p>
                      <strong>3. Android Build:</strong> Run{' '}
                      <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                        flutter build apk --release
                      </code>{' '}
                      or{' '}
                      <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                        flutter build appbundle
                      </code>
                    </p>
                    <p>
                      <strong>4. iOS Build:</strong> Run{' '}
                      <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                        flutter build ipa
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE: PUSH NOTIFICATIONS & BROADCAST STUDIO */}
          {adminModule === 'notifications' && <AdminNotificationStudio />}
        </main>
      </div>

      {/* COURIER TRACKING CODE MODAL */}
      {selectedOrderForCourier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-xs text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
              <h3 className="text-sm font-extrabold text-[#192E4D]">Update Courier Tracking</h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedOrderForCourier(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#697586] hover:bg-[#F6F8FA] hover:text-[#192E4D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[#697586]">
              Order ID: <strong className="font-mono text-[#192E4D]">{selectedOrderForCourier}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. BlueDart Express, FedEx, Delhivery"
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">AWB / Tracking Number</label>
                <input
                  type="text"
                  value={courierCode}
                  onChange={(e) => setCourierCode(e.target.value)}
                  placeholder="e.g. BLUEDART-882194"
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForCourier(null)}
                className="flex-1 h-11 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetOrd = orders.find((o) => o.id === selectedOrderForCourier);
                  if (targetOrd && courierCode.trim()) {
                    updateOrderStatus(
                      targetOrd.id,
                      targetOrd.status,
                      {
                        courier: courierName.trim() || 'BlueDart Express',
                        trackingNumber: courierCode.trim(),
                        estimatedDelivery: '2 business days',
                      },
                      `Courier tracking updated to ${courierCode.trim()}`
                    );
                    showNotice(`Courier tracking code updated for ${targetOrd.id}`, 'success');
                  }
                  setSelectedOrderForCourier(null);
                }}
                className="flex-1 h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-bold transition-all active:scale-[0.98] shadow-xs"
              >
                Save Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-xs text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-3">
              <h3 className="text-sm font-extrabold text-[#192E4D]">
                Restock: {restockItem.colorName}
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setRestockItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#697586] hover:bg-[#F6F8FA] hover:text-[#192E4D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[#697586]">
              Current inventory in warehouse: <strong className="text-[#192E4D] font-black">{restockItem.currentStock} units</strong>
            </p>

            <div>
              <label className="font-bold text-[#192E4D] block mb-1">Add Stock Quantity (Units)</label>
              <input
                type="number"
                min="1"
                value={addStockAmount}
                onChange={(e) => setAddStockAmount(parseInt(e.target.value) || 0)}
                className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-bold focus:outline-hidden focus:border-[#08A9A2]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="flex-1 h-11 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const newTotal = restockItem.currentStock + addStockAmount;
                  updateVariantStock(restockItem.productId, restockItem.variantId, newTotal);
                  showNotice(`Stock updated: ${restockItem.colorName} now has ${newTotal} units`, 'success');
                  setRestockItem(null);
                }}
                className="flex-1 h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-bold transition-all active:scale-[0.98] shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10-SECTION ADAPTIVE PRODUCT CREATION & SPECIFICATION MODAL */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onSaveSuccess={(msg) => showNotice(msg, 'success')}
      />

      {/* Create / Edit Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-[#E6EAF0]">
            <div className="flex justify-between items-center pb-3 border-b border-[#E6EAF0]">
              <div>
                <h3 className="font-extrabold text-base text-[#192E4D]">
                  {editingCouponCode ? `Edit Coupon: ${editingCouponCode}` : 'Create New Promotional Coupon'}
                </h3>
                <p className="text-xs text-[#697586]">
                  Configure discount code rules for checkout validation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6F8FA] flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCouponSubmit} className="space-y-4 text-xs font-semibold text-[#192E4D]">
              {/* Code */}
              <div>
                <label className="block mb-1 font-extrabold">Coupon Code *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCouponCode}
                  placeholder="e.g. KERALA25, FESTIVE500"
                  value={cCode}
                  onChange={(e) => setCCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl font-mono text-sm uppercase tracking-wider focus:outline-hidden focus:border-[#08A9A2] disabled:bg-gray-100 disabled:text-gray-500"
                />
                <span className="text-[10px] text-[#697586] mt-0.5 block">
                  Codes auto-convert to uppercase without spaces.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 font-extrabold">Description / Marketing Note *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% Off on all Kerala Ethnic sarees"
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block mb-1 font-extrabold">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCDiscountType('percentage')}
                    className={`h-10 rounded-xl font-bold transition-all ${
                      cDiscountType === 'percentage'
                        ? 'bg-[#08A9A2] text-white shadow-xs'
                        : 'bg-[#F6F8FA] text-[#192E4D] border border-[#E6EAF0]'
                    }`}
                  >
                    Percentage (% OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCDiscountType('fixed');
                      setCMaxDiscount(undefined);
                    }}
                    className={`h-10 rounded-xl font-bold transition-all ${
                      cDiscountType === 'fixed'
                        ? 'bg-[#08A9A2] text-white shadow-xs'
                        : 'bg-[#F6F8FA] text-[#192E4D] border border-[#E6EAF0]'
                    }`}
                  >
                    Fixed Amount (₹ OFF)
                  </button>
                </div>
              </div>

              {/* Live Preview Banner */}
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1">
                <div className="font-extrabold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#08A9A2]" />
                  Live Offer Summary:
                </div>
                {cDiscountType === 'fixed' ? (
                  <p className="text-[#192E4D]">
                    Applying <strong className="font-mono text-[#08A9A2]">{cCode || 'CODE'}</strong> gives a <strong className="text-emerald-700">Flat ₹{cValue || 0} OFF</strong> on orders {cMinOrder > 0 ? `above ₹${cMinOrder}` : 'with no min order requirement'}.
                  </p>
                ) : (
                  <p className="text-[#192E4D]">
                    Applying <strong className="font-mono text-[#08A9A2]">{cCode || 'CODE'}</strong> gives <strong className="text-emerald-700">{cValue || 0}% OFF</strong> discount{cMaxDiscount ? ` (capped at max ₹${cMaxDiscount})` : ''}.
                    <span className="block text-[10px] text-teal-700 mt-1 font-bold">
                      💡 Tip: For a Flat ₹{cValue || 100} Rupee discount, choose "Fixed Amount (₹ OFF)".
                    </span>
                  </p>
                )}
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-extrabold">
                    {cDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={cDiscountType === 'percentage' ? '100' : '100000'}
                    required
                    value={cValue}
                    onChange={(e) => setCValue(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-extrabold">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={cMinOrder}
                    onChange={(e) => setCMinOrder(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                  />
                </div>
              </div>

              {/* Max Discount Cap (only for percentage) */}
              {cDiscountType === 'percentage' && (
                <div>
                  <label className="block mb-1 font-extrabold">Max Discount Cap (₹) (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty for unlimited cap"
                    value={cMaxDiscount === undefined ? '' : cMaxDiscount}
                    onChange={(e) =>
                      setCMaxDiscount(e.target.value === '' ? undefined : parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                  />
                </div>
              )}

              {/* Expiry Date */}
              <div>
                <label className="block mb-1 font-extrabold">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={cExpiresAt}
                  onChange={(e) => setCExpiresAt(e.target.value)}
                  className="w-full h-10 px-3 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2]"
                />
              </div>

              {/* Active status */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cIsActiveCheck"
                  checked={cIsActive}
                  onChange={(e) => setCIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#08A9A2] rounded cursor-pointer"
                />
                <label htmlFor="cIsActiveCheck" className="font-bold cursor-pointer">
                  Activate this coupon immediately
                </label>
              </div>

              {/* Modal Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-[#E6EAF0]">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 h-11 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-bold transition-all shadow-xs"
                >
                  {editingCouponCode ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Coupon Confirmation Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center border border-[#E6EAF0]">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#192E4D]">Delete Coupon Code?</h3>
              <p className="text-xs text-[#697586] mt-1">
                Are you sure you want to delete coupon <span className="font-mono font-bold text-rose-600">{deletingCoupon.code}</span>? Customers will no longer be able to redeem this code at checkout.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                className="flex-1 h-10 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCouponConfirm}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in zoom-in-95">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center border border-[#E6EAF0]">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#192E4D]">Delete Product?</h3>
              <p className="text-xs text-[#697586] mt-1">
                Are you sure you want to delete <strong className="text-[#192E4D]">"{deletingProduct.name}"</strong>?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                This item will be permanently deleted from Cloud Firestore and will immediately vanish from all customer pages on computer, mobile, and any device.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 h-10 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProductConfirm}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
