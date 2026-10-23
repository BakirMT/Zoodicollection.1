import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ZoodiLogo } from '../../components/ZoodiLogo';
import {
  Mail,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  ShoppingBag,
  Sparkles,
  Crown,
  Package,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface DemoAccount {
  roleTitle: string;
  badge: string;
  name: string;
  email: string;
  icon: React.ReactNode;
  badgeClass: string;
  scopeSummary: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    roleTitle: 'Order Manager',
    badge: 'Logistics & Ops',
    name: 'Rohan Verma',
    email: 'orders@zoodi.com',
    icon: <ShoppingBag className="w-4 h-4 text-blue-400" />,
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    scopeSummary: 'Orders, fulfillment, couriers & tracking',
  },
  {
    roleTitle: 'Marketing Lead',
    badge: 'Growth Lead',
    name: 'Sneha Rao',
    email: 'marketing@zoodi.com',
    icon: <Sparkles className="w-4 h-4 text-rose-400" />,
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    scopeSummary: 'Homepage sections, coupons & reviews',
  },
  {
    roleTitle: 'Super Administrator',
    badge: 'Root Access',
    name: 'ZOODI Super Admin',
    email: 'admin@zoodi.com',
    icon: <Crown className="w-4 h-4 text-purple-400" />,
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    scopeSummary: 'All 13 modules, RBAC & user management',
  },
  {
    roleTitle: 'Product Manager',
    badge: 'Catalog Lead',
    name: 'Devika Sen',
    email: 'products@zoodi.com',
    icon: <Package className="w-4 h-4 text-teal-400" />,
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    scopeSummary: 'Products, variants, stock & 3-level categories',
  },
];

export const AdminLoginScreen: React.FC = () => {
  const { adminLogin, navigateTo, setCustomerTab, setActiveScreen } = useApp();

  const [email, setEmail] = useState('orders@zoodi.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = adminLogin(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Access Denied: Invalid credentials');
    }
  };

  const handleSelectDemo = (accountEmail: string, autoSubmit = false) => {
    setEmail(accountEmail);
    setPassword('admin123');
    setErrorMsg(null);
    if (autoSubmit) {
      const result = adminLogin(accountEmail, 'admin123');
      if (!result.success) {
        setErrorMsg(result.error || 'Access Denied: Invalid credentials');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#192E4D] text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            navigateTo('/');
            setCustomerTab('home');
            setActiveScreen('tab');
          }}
          className="min-h-[44px] flex items-center gap-2 text-xs sm:text-sm font-bold text-[#08A9A2] hover:text-white active:scale-95 transition-all p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer App</span>
        </button>

        <span className="text-[10px] font-mono tracking-widest text-teal-300 bg-teal-950/60 border border-teal-800 px-3 py-1 rounded-full uppercase">
          Private Internal Portal
        </span>
      </div>

      {/* Login Box */}
      <div className="max-w-lg w-full mx-auto my-auto py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <ZoodiLogo size="lg" showTagline={true} lightMode={true} />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-4 text-white">
            Administrator Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
            Sign in with authorized administrative credentials to manage products, inventory, homepage & orders.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1.5">
              Admin Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-[#243c61] border border-slate-600 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/30"
                placeholder="e.g. orders@zoodi.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1.5">
              Security Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-[#243c61] border border-slate-600 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Authenticate & Open Management Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Verified Demo Role Accounts */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#243c61]/70 border border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[#FFB000] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB000]" />
              <span>Verified RBAC Demo Accounts (Password: admin123)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1-Click Sign In</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Select any role below to automatically authenticate and evaluate permission scopes in real time:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = email.toLowerCase() === acc.email.toLowerCase();
              return (
                <div
                  key={acc.email}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#192E4D] border-[#08A9A2] ring-1 ring-[#08A9A2] shadow-md'
                      : 'bg-[#192E4D]/70 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-[#243c61] border border-slate-600">
                          {acc.icon}
                        </span>
                        <span className="font-extrabold text-white text-xs">{acc.roleTitle}</span>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${acc.badgeClass}`}
                      >
                        {acc.badge}
                      </span>
                    </div>

                    <div className="text-[11px] text-teal-300 font-mono font-semibold">
                      {acc.email}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {acc.name} • {acc.scopeSummary}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDemo(acc.email, false)}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#243c61] hover:bg-slate-600 text-slate-200 text-[10px] font-bold transition-all text-center"
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemo(acc.email, true)}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#08A9A2] hover:bg-[#079690] text-white text-[10px] font-extrabold transition-all text-center flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-400 py-2">
        ZOODI Security Engine • Role-Based Access Control Active • 256-bit Encrypted Session
      </div>
    </div>
  );
};
