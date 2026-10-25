import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppNotification, NotificationType } from '../../types';
import {
  Bell,
  Send,
  Sparkles,
  Users,
  Shield,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  History,
  Sliders,
  CheckCheck,
  Trash2,
  ExternalLink,
  Volume2,
  VolumeX,
  CreditCard,
  ShoppingBag,
  Package,
  Layers,
  MessageCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const AdminNotificationStudio: React.FC = () => {
  const {
    notifications,
    adminNotifSettings,
    updateAdminNotifSettings,
    notificationCampaigns,
    dispatchNotificationCampaign,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    handleNotificationClick,
    fcmDeviceToken,
    pushPermission,
    requestPushPermission,
    mainCategories,
    products,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'feed' | 'broadcast' | 'history' | 'settings'>('broadcast');

  // Broadcast Studio State
  const [campaignTitle, setCampaignTitle] = useState('Festive Weekend Flash Drop! 🔥');
  const [campaignMessage, setCampaignMessage] = useState(
    'Save an extra 25% on our luxury Sartorial Autumn drops with code FESTIVE25. Valid for 48 hours.'
  );
  const [targetAudience, setTargetAudience] = useState<'all' | 'buyers' | 'wishlist'>('all');
  const [deepLinkType, setDeepLinkType] = useState<'home' | 'category' | 'product' | 'flash_deals'>('category');
  const [selectedCatId, setSelectedCatId] = useState(mainCategories[0]?.id || 'cat_fashion');
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || 'prod_jacket_01');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Feed Filter
  const [feedFilter, setFeedFilter] = useState<'all' | 'orders' | 'stock' | 'payments' | 'support'>('all');

  const adminNotifications = notifications.filter(
    (n) => n.recipientRole === 'admin' || n.recipientRole === 'all'
  );

  const filteredFeed = adminNotifications.filter((n) => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'orders') return n.type === 'order_placed' || n.type === 'order_status';
    if (feedFilter === 'stock') return n.type === 'low_stock' || n.type === 'out_of_stock' || n.type === 'back_in_stock';
    if (feedFilter === 'payments') return n.type === 'payment_success' || n.type === 'payment_failed' || n.type === 'refund';
    if (feedFilter === 'support') return n.type === 'support_ticket';
    return true;
  });

  const unreadCount = adminNotifications.filter((n) => !n.isRead).length;

  const getComputedDeepLink = () => {
    if (deepLinkType === 'home') return 'tab:home';
    if (deepLinkType === 'flash_deals') return 'tab:categories';
    if (deepLinkType === 'category') return `category:${selectedCatId}`;
    if (deepLinkType === 'product') return `product:${selectedProdId}`;
    return 'tab:home';
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignMessage.trim()) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSend = async () => {
    setIsSending(true);
    try {
      const res = await dispatchNotificationCampaign({
        title: campaignTitle.trim(),
        message: campaignMessage.trim(),
        audience: targetAudience,
        deepLink: getComputedDeepLink(),
      });
      setIsConfirmModalOpen(false);
      setBroadcastNotice({
        message: `Campaign successfully broadcast to ${res.count} customers via Web Push & FCM!`,
        type: 'success',
      });
      setTimeout(() => setBroadcastNotice(null), 5000);
    } catch {
      setBroadcastNotice({ message: 'Failed to broadcast campaign.', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  // Icon helper
  const getFeedIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_placed':
      case 'order_status':
        return <ShoppingBag className="w-4 h-4 text-[#08A9A2]" />;
      case 'payment_success':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'low_stock':
      case 'out_of_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'support_ticket':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6EAF0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#192E4D]">Push Notifications & Broadcast Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#08A9A2]/10 text-[#08A9A2] uppercase tracking-wider">
              FCM & Web Push
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Real-time multi-channel customer campaigns, delivery updates, and administrative store alerts.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="p-1 bg-[#F6F8FA] border border-[#E6EAF0] rounded-2xl flex items-center gap-1 self-start sm:self-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-white text-[#192E4D] shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D]'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#08A9A2]" />
            <span>Campaign Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-white text-[#192E4D] shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Live Store Feed</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-[#192E4D] shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D]'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-500" />
            <span>History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-[#192E4D] shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {broadcastNotice && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200 ${
            broadcastNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{broadcastNotice.message}</span>
        </div>
      )}

      {/* TAB 1: BROADCAST CAMPAIGN STUDIO */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Campaign Form */}
          <form
            onSubmit={handleBroadcastSubmit}
            className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#E6EAF0] shadow-xs space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#08A9A2] text-white flex items-center justify-center shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#192E4D] text-sm">Create Push Broadcast Campaign</h2>
                  <p className="text-[11px] text-[#697586]">
                    Compose and dispatch real-time push notifications across Android, iOS and Web.
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Title */}
            <div>
              <label className="font-bold text-[#192E4D] block mb-1">
                Notification Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. Autumn Drop 2026 Live! 🔥"
                maxLength={60}
                required
                className="w-full h-10 px-3.5 border border-[#E6EAF0] rounded-xl text-xs font-bold text-[#192E4D] focus:outline-hidden focus:border-[#08A9A2]"
              />
              <span className="text-[10px] text-gray-400 block text-right mt-0.5">
                {campaignTitle.length}/60 characters
              </span>
            </div>

            {/* Message Body */}
            <div>
              <label className="font-bold text-[#192E4D] block mb-1">
                Notification Message Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                placeholder="Write an engaging message encouraging customers to tap and shop..."
                maxLength={160}
                required
                className="w-full p-3 border border-[#E6EAF0] rounded-xl text-xs focus:outline-hidden focus:border-[#08A9A2] resize-none"
              />
              <span className="text-[10px] text-gray-400 block text-right mt-0.5">
                {campaignMessage.length}/160 characters
              </span>
            </div>

            {/* Target Audience Segment */}
            <div>
              <label className="font-bold text-[#192E4D] block mb-1.5">Target Audience Segment</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'all', title: 'All Opted-in Customers', count: '1,420 users', desc: 'Active subscribers' },
                  { id: 'buyers', title: 'Recent Verified Buyers', count: '680 users', desc: 'Placed orders in last 90d' },
                  { id: 'wishlist', title: 'Wishlist & Cart Savers', count: '340 users', desc: 'High purchase intent' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setTargetAudience(aud.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      targetAudience === aud.id
                        ? 'border-[#08A9A2] bg-teal-50/50 shadow-xs ring-1 ring-[#08A9A2]'
                        : 'border-[#E6EAF0] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-extrabold text-[#192E4D] text-xs block">{aud.title}</span>
                    <span className="text-[11px] font-bold text-[#08A9A2] block mt-0.5">{aud.count}</span>
                    <span className="text-[10px] text-[#697586] block mt-0.5">{aud.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deep Link Destination */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <label className="font-bold text-[#192E4D] block">Action On Tap (Deep Link Destination)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'home', label: 'Home Page' },
                  { id: 'category', label: 'Category' },
                  { id: 'product', label: 'Product Item' },
                  { id: 'flash_deals', label: 'All Categories' },
                ].map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setDeepLinkType(dest.id as any)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-center text-xs transition-all cursor-pointer border ${
                      deepLinkType === dest.id
                        ? 'bg-[#08A9A2] text-white border-[#08A9A2] shadow-xs'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#192E4D]'
                    }`}
                  >
                    {dest.label}
                  </button>
                ))}
              </div>

              {deepLinkType === 'category' && (
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] block mb-1">Select Target Category</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#192E4D] bg-white"
                  >
                    {mainCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {deepLinkType === 'product' && (
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] block mb-1">Select Target Product</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#192E4D] bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Dispatch Action */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#697586]">
                Broadcasts respect customer marketing notification opt-in preferences.
              </span>
              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold shadow-sm active:scale-95 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Review & Broadcast</span>
              </button>
            </div>
          </form>

          {/* Smartphone Lockscreen Live Simulation Preview */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-[#E6EAF0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F8]">
              <div className="flex items-center gap-1.5 font-extrabold text-[#192E4D] text-xs">
                <Smartphone className="w-4 h-4 text-[#08A9A2]" />
                <span>Live Smartphone Lockscreen Preview</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">Android & iOS</span>
            </div>

            {/* Mock Phone Container */}
            <div className="relative mx-auto w-full max-w-[280px] h-[460px] rounded-[36px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-3 shadow-2xl border-4 border-slate-700 flex flex-col justify-between overflow-hidden">
              {/* Phone Camera Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2" />

              {/* Lockscreen Time */}
              <div className="text-center text-white space-y-1">
                <span className="text-3xl font-light tracking-tight">09:41</span>
                <span className="text-[10px] text-slate-300 block font-medium">Friday, October 23</span>
              </div>

              {/* Incoming Push Notification Banner */}
              <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/20 space-y-1.5 text-left animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-[#08A9A2] text-white flex items-center justify-center text-[9px] font-black">
                      Z
                    </div>
                    <span className="text-[10px] font-extrabold text-[#192E4D] uppercase tracking-wider">
                      ZOODI
                    </span>
                  </div>
                  <span className="text-[9px] text-[#697586]">now</span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-[#192E4D] leading-snug">
                    {campaignTitle.trim() || 'Headline here'}
                  </h4>
                  <p className="text-[11px] text-[#475569] leading-snug line-clamp-3 mt-0.5">
                    {campaignMessage.trim() || 'Notification body text appears here.'}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-[9px] text-[#08A9A2] font-bold border-t border-slate-100">
                  <span>Swipe to open</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Bottom Phone Indicator */}
              <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-auto" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#697586]">
              <span className="font-bold text-[#192E4D]">FCM Delivery Pipeline:</span> Push message payload is formatted with custom Android notification channels (`zoodi_promotions_channel`) and APNs foreground badge options.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE STORE FEED */}
      {activeTab === 'feed' && (
        <div className="bg-white p-5 rounded-3xl border border-[#E6EAF0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F8]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'all', label: 'All Alerts' },
                  { id: 'orders', label: 'Orders & Dispatch' },
                  { id: 'stock', label: 'Stock & Inventory' },
                  { id: 'payments', label: 'Payments' },
                  { id: 'support', label: 'Support' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeedFilter(f.id)}
                  className={`h-7 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    feedFilter === f.id
                      ? 'bg-[#08A9A2] text-white shadow-xs'
                      : 'bg-slate-100 text-[#697586] hover:text-[#192E4D]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllNotificationsAsRead('admin')}
                  className="text-xs font-bold text-[#08A9A2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              {adminNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAllNotifications('admin')}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear feed</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5 divide-y divide-[#F0F4F8]">
            {filteredFeed.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No store alerts matching current filter.
              </div>
            ) : (
              filteredFeed.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`pt-2.5 first:pt-0 p-3.5 rounded-2xl flex items-start justify-between gap-3 transition-colors cursor-pointer group ${
                    !notif.isRead ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white border border-[#E6EAF0] shrink-0 shadow-2xs">
                      {getFeedIcon(notif.type)}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#192E4D] text-xs group-hover:text-[#08A9A2] transition-colors">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[#697586] text-[9px] font-bold uppercase">
                          {notif.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#697586] leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <span>{new Date(notif.createdAt).toLocaleTimeString()}</span>
                        {notif.relatedId && <span>• Ref: {notif.relatedId}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CAMPAIGN HISTORY & ANALYTICS */}
      {activeTab === 'history' && (
        <div className="bg-white p-5 rounded-3xl border border-[#E6EAF0] shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F8]">
            <div>
              <h2 className="font-extrabold text-[#192E4D] text-sm">Past Campaign Broadcasts & Delivery</h2>
              <p className="text-[11px] text-[#697586]">
                Audit history of all dispatched push campaigns with live delivery and open stats.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {notificationCampaigns.map((cmp) => (
              <div
                key={cmp.id}
                className="p-4 rounded-2xl border border-[#E6EAF0] hover:border-[#08A9A2]/40 transition-colors bg-white space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0F4F8]">
                  <div>
                    <h3 className="font-extrabold text-[#192E4D] text-xs">{cmp.title}</h3>
                    <p className="text-[11px] text-[#697586] mt-0.5">{cmp.message}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                    Status: {cmp.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-gray-500 block">Target Audience</span>
                    <span className="font-extrabold text-[#192E4D] text-xs block mt-0.5 capitalize">
                      {cmp.audience} ({cmp.targetCount})
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-gray-500 block">Delivered</span>
                    <span className="font-extrabold text-emerald-600 text-xs block mt-0.5">
                      {cmp.deliveredCount} ({Math.round((cmp.deliveredCount / cmp.targetCount) * 100)}%)
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-gray-500 block">Opens / Taps</span>
                    <span className="font-extrabold text-[#08A9A2] text-xs block mt-0.5">
                      {cmp.openCount} opens
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-gray-500 block">Sent By</span>
                    <span className="font-extrabold text-[#192E4D] text-xs block mt-0.5 truncate">
                      {cmp.sentByAdminName}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1">
                  <span>Sent on: {new Date(cmp.sentAt).toLocaleString()}</span>
                  {cmp.deepLink && <span>Target: {cmp.deepLink}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & PERMISSIONS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Admin Notification Triggers */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6EAF0] shadow-xs space-y-4">
            <h2 className="font-extrabold text-[#192E4D] text-sm pb-2 border-b border-[#F0F4F8]">
              Automated Admin Alert Triggers
            </h2>

            <div className="space-y-3">
              {[
                {
                  key: 'enableOrderAlerts',
                  title: 'New Customer Order Notifications',
                  desc: 'Instant chime & alert when any customer places a new order',
                },
                {
                  key: 'enablePaymentAlerts',
                  title: 'Payment Confirmation & Fraud Alerts',
                  desc: 'Trigger alerts when payments succeed or require manual verification',
                },
                {
                  key: 'enableStockAlerts',
                  title: 'Variant Low Stock & Out-of-Stock Warnings',
                  desc: 'Alert when variant inventory dips below 5 units or hits 0',
                },
                {
                  key: 'enableCustomerRegistrationAlerts',
                  title: 'Customer Registration Alerts',
                  desc: 'Notify when new customer accounts sign up',
                },
                {
                  key: 'enableCatalogueAlerts',
                  title: 'Catalogue Audit & Edit Alerts',
                  desc: 'Notify when products or categories are modified',
                },
                {
                  key: 'soundEnabled',
                  title: 'Audio Chime Sound Effects',
                  desc: 'Synthesize luxury chime on incoming real-time alerts',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E6EAF0]"
                >
                  <div>
                    <h3 className="font-extrabold text-[#192E4D] text-xs">{item.title}</h3>
                    <p className="text-[10px] text-[#697586]">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateAdminNotifSettings({
                        [item.key]: !(adminNotifSettings as any)[item.key],
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      (adminNotifSettings as any)[item.key] ? 'bg-[#08A9A2]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                        (adminNotifSettings as any)[item.key] ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FCM & Device Diagnostics */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6EAF0] shadow-xs space-y-4">
            <h2 className="font-extrabold text-[#192E4D] text-sm pb-2 border-b border-[#F0F4F8]">
              FCM & Push Device Diagnostics
            </h2>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#192E4D]">Web Push System Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pushPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pushPermission === 'granted' ? 'Active & Permitted' : 'Permission Pending'}
                </span>
              </div>

              {pushPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={() => requestPushPermission()}
                  className="w-full py-2 rounded-xl bg-[#08A9A2] text-white font-bold text-xs hover:bg-[#079690] cursor-pointer"
                >
                  Request Admin Browser Push Permission
                </button>
              )}

              <div>
                <span className="text-[10px] font-bold text-[#64748B] block mb-1">
                  Active Web Push / FCM Device Token:
                </span>
                <div className="p-2 rounded-xl bg-white border border-[#E2E8F0] font-mono text-[10px] text-slate-600 break-all">
                  {fcmDeviceToken || 'Generating token via ServiceWorker...'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] block mb-1">
                  Android Notification Channels Configured:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600 font-mono">
                  <li>zoodi_orders_channel (Priority: HIGH)</li>
                  <li>zoodi_payments_channel (Priority: HIGH)</li>
                  <li>zoodi_delivery_channel (Priority: MAX)</li>
                  <li>zoodi_promotions_channel (Priority: DEFAULT)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#E6EAF0] p-6 space-y-4 my-auto text-xs">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#192E4D] text-sm">Confirm Push Broadcast</h3>
                <p className="text-[11px] text-[#697586]">Safety check before dispatching</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold">Headline</span>
                <span className="font-bold text-[#192E4D]">{campaignTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-bold">Audience</span>
                <span className="font-bold text-[#08A9A2] capitalize">
                  {targetAudience} customers ({targetAudience === 'all' ? 1420 : targetAudience === 'buyers' ? 680 : 340} recipients)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#697586]">
              Are you sure you want to trigger this notification campaign? It will dispatch immediately to customer devices and browsers.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="h-9 px-4 rounded-xl border border-[#E6EAF0] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleConfirmSend}
                className="h-9 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isSending ? 'Sending...' : 'Confirm & Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
