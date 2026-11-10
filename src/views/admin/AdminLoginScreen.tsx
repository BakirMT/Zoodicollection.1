import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ZoodiLogo } from '../../components/ZoodiLogo';
import { auth } from '../../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  ShieldAlert,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { adminLoginWithGoogle } = useApp();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authorized Super Admin Google Account
  const AUTHORIZED_ADMIN_EMAIL = 'zoodicollection@gmail.com';

  const handleContinueWithGoogle = async () => {
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessNotice(null);

    try {
      // Configure Google OAuth provider to always display the real Google Account Chooser
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      // Trigger the official Google OAuth Account Selection popup immediately on user click
      const credential = await signInWithPopup(auth, provider);
      setIsSubmitting(true);

      const user = credential.user;
      const emailReceived = (user.email || '').toLowerCase().trim();
      const displayName = user.displayName || 'ZOODI Super Admin';
      const photoURL = user.photoURL || undefined;
      const isEmailVerified = Boolean(user.emailVerified);
      const idToken = await user.getIdToken(true);

      // 1. Verify token and email on the backend via Firebase Admin SDK
      const verifyResponse = await fetch('/api/admin/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ idToken }),
      });

      const verifyData = await verifyResponse.json().catch(() => ({}));

      if (!verifyResponse.ok || !verifyData.authorized) {
        await signOut(auth).catch(() => {});
        adminLoginWithGoogle(emailReceived || 'unauthorized@gmail.com', displayName);
        setErrorMsg(
          verifyData.error ||
            (!isEmailVerified
              ? 'Access Denied! Email address is not verified.'
              : 'Access Denied! This Google account is not authorized to access the Super Admin panel.')
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Verify email_verified === true
      if (!isEmailVerified) {
        await signOut(auth).catch(() => {});
        setErrorMsg('Access Denied! Email address is not verified.');
        setIsSubmitting(false);
        return;
      }

      // 3. Strictly enforce zoodicollection@gmail.com
      if (emailReceived !== AUTHORIZED_ADMIN_EMAIL) {
        await signOut(auth).catch(() => {});
        adminLoginWithGoogle(emailReceived, displayName);
        setErrorMsg(
          'Access Denied! This Google account is not authorized to access the Super Admin panel.'
        );
        setIsSubmitting(false);
        return;
      }

      // 4. Authorized Super Admin confirmed
      setSuccessNotice(
        `Authentication verified for ${AUTHORIZED_ADMIN_EMAIL}. Launching admin console...`
      );
      setTimeout(() => {
        adminLoginWithGoogle(AUTHORIZED_ADMIN_EMAIL, displayName, photoURL, idToken);
        setIsSubmitting(false);
      }, 300);
    } catch (authError: any) {
      setIsSubmitting(false);
      await signOut(auth).catch(() => {});

      const code = authError?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }

      if (code === 'auth/popup-blocked') {
        setErrorMsg(
          'Google Sign-In popup was blocked by your browser. Please allow popups for this site and click "Continue with Google" again.'
        );
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        setErrorMsg(
          `This domain (${window.location.hostname}) is not yet added to Firebase Authorized Domains. Please add it in Firebase Console → Authentication → Settings → Authorized domains.`
        );
        return;
      }

      setErrorMsg(
        authError?.message || 'Google Sign-In could not be completed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#101E33] text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top security status bar */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">ZOODI Management Engine</span>
        </div>

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
