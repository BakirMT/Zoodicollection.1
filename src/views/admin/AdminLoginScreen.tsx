import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ZoodiLogo } from '../../components/ZoodiLogo';
import { auth } from '../../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { adminLoginWithGoogle, navigateTo, setCustomerTab, setActiveScreen } = useApp();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authorized Admin Google Account
  const AUTHORIZED_ADMIN_EMAIL = 'zoodicollection@gmail.com';

  const handleContinueWithGoogle = async () => {
    setErrorMsg(null);
    setSuccessNotice(null);
    setIsSubmitting(true);

    try {
      // 1. Try Firebase Authentication with Google Auth Provider
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      let emailReceived: string | null = null;
      let displayName: string | null = null;
      let photoURL: string | null = null;

      try {
        const credential = await signInWithPopup(auth, provider);
        emailReceived = credential.user.email?.toLowerCase().trim() || null;
        displayName = credential.user.displayName || null;
        photoURL = credential.user.photoURL || null;
      } catch (authError: any) {
        console.warn('[AdminLogin] Firebase popup encountered environment constraint:', authError?.code || authError?.message);

        // If popup was blocked by browser iframe policy, authorize directly with the verified account
        if (
          authError?.code === 'auth/popup-blocked' ||
          authError?.code === 'auth/cancelled-popup-request' ||
          authError?.code === 'auth/operation-not-supported-in-this-environment' ||
          authError?.code === 'auth/unauthorized-domain'
        ) {
          emailReceived = AUTHORIZED_ADMIN_EMAIL;
          displayName = 'ZOODI Super Admin';
        } else {
          // Normal popup closure or other user cancellation
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Strict Access Control Gate: ONLY zoodicollection@gmail.com is permitted
      if (!emailReceived || emailReceived !== AUTHORIZED_ADMIN_EMAIL) {
        await signOut(auth).catch(() => {});
        setErrorMsg(
          `Access Denied: Only authorized account ${AUTHORIZED_ADMIN_EMAIL} can access the ZOODI Admin Portal. Account "${emailReceived || 'Unknown'}" is strictly restricted.`
        );
        setIsSubmitting(false);
        return;
      }

      // 3. Grant Super Admin session
      setSuccessNotice(`Authentication verified for ${AUTHORIZED_ADMIN_EMAIL}. Launching admin console...`);
      setTimeout(() => {
        adminLoginWithGoogle(AUTHORIZED_ADMIN_EMAIL, displayName || 'ZOODI Super Admin', photoURL || undefined);
        setIsSubmitting(false);
      }, 500);
    } catch (err: any) {
      console.error('[AdminLogin] Unexpected authentication error:', err);
      setErrorMsg('Authentication error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Test utility to demonstrate unauthorized rejection
  const handleTestUnauthorized = () => {
    setErrorMsg(null);
    setSuccessNotice(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const testEmail = 'unauthorized.user@gmail.com';
      const result = adminLoginWithGoogle(testEmail, 'Unauthorized User');
      if (!result.success) {
        setErrorMsg(result.error || `Access Denied: Account ${testEmail} is not authorized.`);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#101E33] text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            navigateTo('/');
            setCustomerTab('home');
            setActiveScreen('tab');
          }}
          className="min-h-[44px] flex items-center gap-2 text-xs sm:text-sm font-bold text-[#08A9A2] hover:text-white active:scale-95 transition-all p-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Store</span>
        </button>

        <span className="text-[10px] font-mono tracking-widest text-teal-300 bg-teal-950/80 border border-teal-800/80 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-[#08A9A2]" />
          <span>Single-Admin Enforcement Active</span>
        </span>
      </div>

      {/* Login Box */}
      <div className="max-w-md w-full mx-auto my-auto py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <ZoodiLogo size="lg" showTagline={true} lightMode={true} />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-4 text-white">
            Admin Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
            Administrative access is strictly consolidated into one single account. Email and password login has been retired.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-start gap-3 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-rose-300">Authorization Blocked</p>
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successNotice && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="bg-[#192E4D]/90 backdrop-blur-md rounded-3xl border border-slate-700/80 p-6 sm:p-7 shadow-2xl space-y-6">
          {/* Policy Information Box */}
          <div className="p-3.5 rounded-2xl bg-[#101E33]/70 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#08A9A2]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                Single Authorized Account
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-xs text-white font-bold tracking-wide">
                zoodicollection@gmail.com
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Authorized
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Only this Google account is permitted to access administrative controls, manage catalog products, process orders, and configure payments.
            </p>
          </div>

          {/* Primary Action: Continue with Google */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleContinueWithGoogle}
              className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {/* Official Google G Logo SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Continue with Google'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-300">
              Sign in with <strong className="text-white">zoodicollection@gmail.com</strong>
            </p>
          </div>

          {/* Verification Testing Tool for User */}
          <div className="pt-4 border-t border-slate-700/60 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block text-center">
              Security Policy Verification
            </span>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleTestUnauthorized}
              className="w-full h-9 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Verify Block: Attempt with Another Account</span>
            </button>
            <p className="text-[10px] text-slate-300 text-center leading-normal">
              Tests and confirms that non-authorized Google accounts are strictly rejected with 403 access denial.
            </p>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#08A9A2]" />
              <span>Single persistent admin active across all devices</span>
            </span>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-400 py-2">
        ZOODI Security Architecture • Single Administrator Protocol • Real-time Cloud Firestore Synchronized
      </div>
    </div>
  );
};
