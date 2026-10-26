import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Crown,
  CheckCircle2,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  CreditCard,
  Bell,
  Boxes,
  Users,
  Star,
  LifeBuoy,
  History,
  AlertTriangle,
  Mail,
  ShieldAlert,
} from 'lucide-react';

interface AdminRbacViewProps {
  showNotice: (message?: string, type?: 'success' | 'error') => void;
}

export const AdminRbacView: React.FC<AdminRbacViewProps> = ({ showNotice }) => {
  const { currentAdmin } = useApp();

  const PRIMARY_ADMIN_EMAIL = 'zoodicollection@gmail.com';

  const capabilities = [
    {
      title: 'Full Catalogue & Variant Control',
      icon: <Package className="w-4 h-4 text-teal-600" />,
      desc: 'Create, modify, and delete products, multi-color variants, independent photo galleries, and real-time stock levels.',
    },
    {
      title: 'Real-Time Cloud Firestore Sync',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      desc: 'Instant broadcast of catalog updates, discounts, and deletions across all connected desktop computers and mobile devices.',
    },
    {
      title: 'Google Pay Settlement Receiver',
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      desc: 'Exclusive rights to inspect and update store settlement UPI VPA and merchant payment receivers.',
    },
    {
      title: 'Order Dispatch & Fulfillment Tracking',
      icon: <ShoppingBag className="w-4 h-4 text-blue-600" />,
      desc: 'Confirm payments, manage packed/shipped statuses, attach DTDC & BlueDart Kerala tracking numbers.',
    },
    {
      title: 'Coupons & Flash Sale Marketing',
      icon: <Tag className="w-4 h-4 text-amber-600" />,
      desc: 'Issue flat and percentage promotional codes, define countdown timers, and manage special offers.',
    },
    {
      title: 'Push Notification Broadcast Studio',
      icon: <Bell className="w-4 h-4 text-rose-600" />,
      desc: 'Dispatch storewide browser notifications and targeted promotional announcements to customers.',
    },
    {
      title: 'Inventory & Restock Controls',
      icon: <Boxes className="w-4 h-4 text-indigo-600" />,
      desc: 'Monitor low-stock items, adjust size distributions (S, M, L, XL), and restock high-demand apparel.',
    },
    {
      title: 'Customer Directory & Reviews Moderation',
      icon: <Users className="w-4 h-4 text-cyan-600" />,
      desc: 'Inspect customer profiles, review verified purchase feedback, and resolve customer support tickets.',
    },
    {
      title: 'Immutable Security Audit Trail',
      icon: <History className="w-4 h-4 text-slate-600" />,
      desc: 'All admin actions, catalog updates, price edits, and logins are permanently timestamped under this single identity.',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#192E4D] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#08A9A2]" />
            <span>Single Administrator Architecture</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#697586] mt-1">
            Storewide administrative authority is strictly consolidated into one single verified Google account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Single Admin Policy Active</span>
          </span>
        </div>
      </div>

      {/* Primary Account Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E6EAF0] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#192E4D] to-[#08A9A2] text-white flex items-center justify-center font-black text-xl shadow-md">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#192E4D]">
                  ZOODI Super Admin
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-purple-600" />
                  <span>Sole Super Admin</span>
                </span>
              </div>
              <p className="text-xs font-mono text-[#08A9A2] font-bold mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{PRIMARY_ADMIN_EMAIL}</span>
              </p>
              <p className="text-[11px] text-[#697586] mt-0.5">
                Sole Administrative Authority • Kerala Leadership Hub • Phone: +91 9072976516
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-[#08A9A2] border border-teal-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Google OAuth Verified</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Role: Unrestricted Storewide Super Admin
            </span>
          </div>
        </div>

        {/* Security Architecture Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-[#192E4D] font-bold text-xs">
              <Lock className="w-4 h-4 text-[#08A9A2]" />
              <span>Zero Multi-Admin Accounts</span>
            </div>
            <p className="text-[11px] text-[#697586] leading-relaxed">
              Multi-account creation and sub-roles are permanently turned off. All operational deals, listings, and updates originate exclusively from this account.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-[#192E4D] font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Passwords & Other Emails Blocked</span>
            </div>
            <p className="text-[11px] text-[#697586] leading-relaxed">
              Email and password authentication has been removed. Any login attempt with an unapproved Google email is immediately denied entry with a 403 authorization block.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-[#192E4D] font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Universal Synchronized Session</span>
            </div>
            <p className="text-[11px] text-[#697586] leading-relaxed">
              Opening the admin panel from any desktop computer or mobile smartphone accesses the same unified, persistent instance connected to Cloud Firestore.
            </p>
          </div>
        </div>
      </div>

      {/* Exclusive Capabilities Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#192E4D] flex items-center gap-2">
          <span>Exclusive Store Capabilities</span>
          <span className="text-[11px] text-[#697586] font-normal">
            (Consolidated under {PRIMARY_ADMIN_EMAIL})
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {capabilities.map((c, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white border border-[#E6EAF0] space-y-1.5 shadow-2xs hover:border-[#08A9A2]/40 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#192E4D]">
                <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  {c.icon}
                </span>
                <span>{c.title}</span>
              </div>
              <p className="text-[11px] text-[#697586] leading-relaxed pl-8">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Security Enforcement Confirmation</p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Per strict store policy, only <strong>{PRIMARY_ADMIN_EMAIL}</strong> is permitted to access administrative routes. Any unauthorized attempt will be denied and logged to the immutable security audit trail.
          </p>
        </div>
      </div>
    </div>
  );
};
