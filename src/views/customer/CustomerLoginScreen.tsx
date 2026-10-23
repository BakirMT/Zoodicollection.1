import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ZoodiLogo } from '../../components/ZoodiLogo';
import {
  ChevronLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CustomerLoginScreen: React.FC = () => {
  const { customerLogin, setActiveScreen, setCustomerTab } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Quick Demo One-Click Fill
  const handleQuickDemo = (demoEmail: string, demoName: string) => {
    setIsLoading(true);
    setTimeout(() => {
      customerLogin('email', demoEmail, demoName);
      setIsLoading(false);
      setActiveScreen('tab');
      setCustomerTab('account');
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      customerLogin('google', 'bakirmannarkkad170@gmail.com', 'Bakir Mannarkkad');
      setIsLoading(false);
      setActiveScreen('tab');
      setCustomerTab('account');
    }, 700);
  };

  const handleAppleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      customerLogin('apple', 'apple.user@icloud.com', 'Apple User');
      setIsLoading(false);
      setActiveScreen('tab');
      setCustomerTab('account');
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthNotice('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const displayName = fullName.trim() || email.split('@')[0];
      customerLogin('email', email.trim(), displayName);
      setIsLoading(false);
      setActiveScreen('tab');
      setCustomerTab('account');
    }, 700);
  };

  const handleSkipGuest = () => {
    setActiveScreen('tab');
    setCustomerTab('home');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex flex-col justify-between text-left select-none pb-8 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E6EAF0] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          type="button"
          onClick={handleSkipGuest}
          className="flex items-center gap-1.5 text-xs font-bold text-[#697586] hover:text-[#192E4D] transition-colors p-1 rounded-lg"
          aria-label="Back to store"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <button
          type="button"
          onClick={handleSkipGuest}
          className="text-xs font-bold text-[#08A9A2] hover:underline"
        >
          Continue as Guest
        </button>
      </header>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 my-auto">
        <div className="bg-white rounded-3xl border border-[#E6EAF0] p-6 sm:p-7 shadow-sm space-y-6">
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-1">
              <ZoodiLogo size="md" showTagline={true} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#192E4D] tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-xs text-[#697586] max-w-xs mx-auto">
              {mode === 'signin'
                ? 'Sign in to access your orders, express Kerala delivery & saved items.'
                : 'Join ZOODI for member-only drops, instant order tracking & 10% off your first order.'}
            </p>
          </div>

          {authNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span>{authNotice}</span>
              <button
                type="button"
                onClick={() => setAuthNotice(null)}
                className="text-amber-800 text-sm font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {/* SOCIAL LOGIN BUTTONS: Google & Apple */}
          <div className="space-y-2.5">
            {/* Continue with Google */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 px-4 rounded-xl border border-[#E6EAF0] hover:border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-[#192E4D] font-bold text-xs flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Continue with Apple */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleAppleSignIn}
              className="w-full h-11 px-4 rounded-xl bg-[#192E4D] hover:bg-[#132238] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.47c.66-.8 1.1-1.92.98-3.04-.95.04-2.1.63-2.77 1.42-.59.68-1.11 1.82-.97 2.91 1.06.08 2.1-.5 2.76-1.29z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E6EAF0] w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-[#697586] uppercase tracking-wider relative shrink-0">
              or continue with email
            </span>
          </div>

          {/* Sign In vs Sign Up Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#F6F8FA] rounded-xl border border-[#E6EAF0]">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#192E4D] shadow-xs'
                  : 'text-[#697586] hover:text-[#192E4D]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#192E4D] shadow-xs'
                  : 'text-[#697586] hover:text-[#192E4D]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-[#192E4D] block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#697586] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammed Nihal"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#192E4D] block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#697586] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#192E4D]">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setAuthNotice('Password reset link sent to your email inbox.')}
                    className="text-[11px] font-bold text-[#08A9A2] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#697586] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20 font-mono"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-8 h-8 rounded-full flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-[#192E4D] block mb-1">Phone (Kerala / India)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#697586] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 94471 23456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-[#697586]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#08A9A2] focus:ring-[#08A9A2] border-slate-300"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to ZOODI' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset for Test Drive */}
          <div className="pt-2 border-t border-[#F0F4F8] space-y-2">
            <span className="text-[10px] font-bold text-[#697586] uppercase tracking-wider block text-center">
              One-Click Demo Account
            </span>
            <button
              type="button"
              onClick={() => handleQuickDemo('nihal.kerala@example.com', 'Muhammed Nihal')}
              className="w-full h-9 px-3 rounded-lg bg-teal-50 hover:bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#08A9A2]" />
              <span>Quick Login: Muhammed Nihal (Mannarkkad, Kerala)</span>
            </button>
          </div>
        </div>

        {/* Security & Guarantee Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#697586] mt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>256-bit SSL Encrypted · ZOODI Kerala Direct Fulfillment</span>
        </div>
      </div>
    </div>
  );
};
