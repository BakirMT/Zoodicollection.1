import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  SlidersHorizontal,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Truck,
} from 'lucide-react';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    handleNotificationClick,
    setIsNotifPreferencesOpen,
    pushPermission,
    requestPushPermission,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'orders' | 'promotions' | 'alerts'>('all');

  if (!isNotificationCenterOpen) return null;

  // Filter only notifications meant for customer or all
  const customerNotifications = notifications.filter(
    (n) => n.recipientRole === 'customer' || n.recipientRole === 'all'
  );

  const filteredNotifications = customerNotifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'orders') {
      return (
        n.type === 'order_placed' ||
        n.type === 'order_status' ||
        n.type === 'payment_success' ||
        n.type === 'payment_failed' ||
        n.type === 'refund'
      );
    }
    if (activeFilter === 'promotions') {
      return n.type === 'promotional' || n.type === 'catalogue_update';
    }
    if (activeFilter === 'alerts') {
      return n.type === 'back_in_stock' || n.type === 'account_security' || n.type === 'support_ticket';
    }
    return true;
  });

  const unreadCount = customerNotifications.filter((n) => !n.isRead).length;

  // Relative timestamp formatter
  const formatTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  // Helper icon for notification type
  const renderNotificationIcon = (notif: AppNotification) => {
    switch (notif.type) {
      case 'order_placed':
      case 'order_status':
        if (notif.title.toLowerCase().includes('delivery') || notif.title.toLowerCase().includes('shipped')) {
          return (
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
          );
        }
        return (
          <div className="w-9 h-9 rounded-full bg-teal-50 text-[#08A9A2] flex items-center justify-center shrink-0 shadow-2xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
        );
      case 'payment_success':
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case 'payment_failed':
      case 'refund':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case 'promotional':
      case 'catalogue_update':
        return (
          <div className="w-9 h-9 rounded-full bg-rose-50 text-[#F20D58] flex items-center justify-center shrink-0 shadow-2xs">
            <Tag className="w-4 h-4" />
          </div>
        );
      case 'back_in_stock':
        return (
          <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'support_ticket':
        return (
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <MessageCircle className="w-4 h-4" />
          </div>
        );
      case 'account_security':
        return (
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-[#E6EAF0] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6EAF0] flex items-center justify-between bg-gradient-to-r from-teal-50/40 via-white to-white">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-[#08A9A2] text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FFB000] text-[#192E4D] text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#192E4D]">Notifications</h2>
              <p className="text-[11px] text-[#697586]">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsNotifPreferencesOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-[#08A9A2] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notification Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsNotificationCenterOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Web Push Prompt (if not yet granted) */}
        {pushPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-[#08A9A2]/10 via-teal-50/50 to-white px-5 py-2.5 border-b border-[#08A9A2]/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#08A9A2] shrink-0" />
              <span className="text-[11px] font-bold text-[#192E4D]">
                Enable instant browser alerts for live delivery & offers
              </span>
            </div>
            <button
              type="button"
              onClick={() => requestPushPermission()}
              className="px-2.5 py-1 rounded-lg bg-[#08A9A2] text-white text-[10px] font-black hover:bg-[#079690] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              Enable
            </button>
          </div>
        )}

        {/* Filter Tabs & Quick Actions */}
        <div className="px-5 py-2.5 border-b border-[#E6EAF0] flex items-center justify-between gap-2 bg-[#FAFBFD]">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'orders', label: 'Orders' },
                { id: 'promotions', label: 'Offers & Drops' },
                { id: 'alerts', label: 'Alerts' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  activeFilter === tab.id
                    ? 'bg-[#08A9A2] text-white shadow-xs'
                    : 'text-[#697586] hover:bg-slate-100 hover:text-[#192E4D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsAsRead('customer')}
                className="text-[10px] font-bold text-[#08A9A2] hover:underline flex items-center gap-1 cursor-pointer px-1.5 py-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            {customerNotifications.length > 0 && (
              <button
                type="button"
                onClick={() => clearAllNotifications('customer')}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer px-1.5 py-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-[#F0F4F8]">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-extrabold text-[#192E4D] text-xs">No notifications yet</p>
              <p className="text-[11px] text-[#697586] max-w-xs mx-auto">
                When you place orders, receive dispatch updates, or get exclusive drops, they will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`pt-2.5 first:pt-0 p-3 rounded-2xl flex items-start justify-between gap-3 transition-colors cursor-pointer group ${
                  !notif.isRead ? 'bg-teal-50/40 hover:bg-teal-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {renderNotificationIcon(notif)}

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-[#192E4D] text-xs group-hover:text-[#08A9A2] transition-colors">
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#08A9A2] shrink-0 animate-pulse" />
                      )}
                    </div>

                    <p className="text-[11px] text-[#697586] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] font-medium pt-0.5">
                      <span>{formatTimeAgo(notif.createdAt)}</span>
                      {notif.deepLink && (
                        <>
                          <span>•</span>
                          <span className="text-[#08A9A2] font-bold flex items-center gap-0.5">
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
