import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ZoodiLogo } from '../../components/ZoodiLogo';
import {
  Mail,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  ArrowRight,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { adminLogin, navigateTo, setCustomerTab, setActiveScreen } = useApp();

  const [email, setEmail] = useState('adminzoodi@2026.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = adminLogin(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Access Denied: Invalid administrator credentials');
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
          <span>Exit to Customer Store</span>
        </button>

        <span className="text-[10px] font-mono tracking-widest text-teal-300 bg-teal-950/60 border border-teal-800 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-[#08A9A2]" />
          <span>Authorized Staff Only</span>
        </span>
      </div>

      {/* Login Box */}
      <div className="max-w-md w-full mx-auto my-auto py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <ZoodiLogo size="lg" showTagline={true} lightMode={true} />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-4 text-white">
            Admin Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
            Enter your authorized administrator credentials to manage products, inventory, orders & storefront settings.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-[#243c61]/80 backdrop-blur-md rounded-3xl border border-slate-700/80 p-6 sm:p-7 shadow-xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-[#192E4D] border border-slate-600 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/30"
                  placeholder="adminzoodi@2026.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-[#192E4D] border border-slate-600 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/30"
                  placeholder="Enter administrator password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Authenticate & Enter Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-700/60 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#08A9A2]" />
              <span>Real-time database sync connected to Cloud Firestore</span>
            </span>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-400 py-2">
        ZOODI Security Engine • Role-Based Access Control Active • 256-bit Encrypted Session
      </div>
    </div>
  );
};
