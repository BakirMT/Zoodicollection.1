import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, Shield, Tag, ShoppingBag, Sparkles, Check, AlertCircle } from 'lucide-react';

export const CustomerNotificationPreferencesModal: React.FC = () => {
  const {
    isNotifPreferencesOpen,
    setIsNotifPreferencesOpen,
    customerNotifPrefs,
    updateCustomerNotifPrefs,
    pushPermission,
    requestPushPermission,
  } = useApp();

  if (!isNotifPreferencesOpen) return null;

  const handleToggle = (key: keyof typeof customerNotifPrefs) => {
    updateCustomerNotifPrefs({ [key]: !customerNotifPrefs[key] });
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      updateCustomerNotifPrefs({ browserPushEnabled: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#E6EAF0] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6EAF0] flex items-center justify-between bg-gradient-to-r from-teal-50/40 via-white to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#08A9A2] text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#192E4D]">Notification Settings</h2>
              <p className="text-[11px] text-[#697586]">Manage alerts, delivery tracking and promotional drops</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNotifPreferencesOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Browser System Push Permission Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#08A9A2]/10 to-teal-50 border border-[#08A9A2]/20 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-[#192E4D] text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#08A9A2]" />
                <span>Web & System Push Notifications</span>
              </div>
              <p className="text-[11px] text-[#697586]">
                Receive instant real-time alerts even when your browser tab is closed.
              </p>
              <div className="pt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pushPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : pushPermission === 'denied'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      pushPermission === 'granted'
                        ? 'bg-emerald-500'
                        : pushPermission === 'denied'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>Permission: {pushPermission.toUpperCase()}</span>
                </span>
              </div>
            </div>

            {pushPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-3 py-1.5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white text-[11px] font-extrabold shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                Enable
              </button>
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Preferences Toggles */}
          <div className="space-y-3 pt-1">
            {/* 1. Order & Delivery Updates */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E6EAF0] hover:border-[#08A9A2]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#08A9A2] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#192E4D] text-xs">Order & Delivery Updates</h3>
                  <p className="text-[10px] text-[#697586]">Confirmation, packing, dispatch and live delivery tracking</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('orderUpdates')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  customerNotifPrefs.orderUpdates ? 'bg-[#08A9A2]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                    customerNotifPrefs.orderUpdates ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 2. Promotions & Flash Drops */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E6EAF0] hover:border-[#08A9A2]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#192E4D] text-xs">Promotions & Flash Drops</h3>
                  <p className="text-[10px] text-[#697586]">Seasonal discounts, coupon codes, and weekend specials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('promotionsAndOffers')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  customerNotifPrefs.promotionsAndOffers ? 'bg-[#08A9A2]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                    customerNotifPrefs.promotionsAndOffers ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 3. Back in Stock Alerts */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E6EAF0] hover:border-[#08A9A2]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#192E4D] text-xs">Wishlist Back in Stock</h3>
                  <p className="text-[10px] text-[#697586]">Alert me when saved wishlist items become available</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('backInStockAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  customerNotifPrefs.backInStockAlerts ? 'bg-[#08A9A2]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                    customerNotifPrefs.backInStockAlerts ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* 4. Account & Security Events */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E6EAF0] hover:border-[#08A9A2]/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#192E4D] text-xs">Account & Security Alerts</h3>
                  <p className="text-[10px] text-[#697586]">Sign-in activity, password updates and policy changes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('accountSecurity')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  customerNotifPrefs.accountSecurity ? 'bg-[#08A9A2]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                    customerNotifPrefs.accountSecurity ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3 border-t border-[#E6EAF0] flex justify-end">
            <button
              type="button"
              onClick={() => setIsNotifPreferencesOpen(false)}
              className="h-9 px-5 rounded-xl bg-[#08A9A2] hover:bg-[#079690] text-white font-extrabold shadow-sm active:scale-95 transition-all text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
