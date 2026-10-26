import React from 'react';
import { useApp } from '../../context/AppContext';
import { ZoodiLogo } from '../../components/ZoodiLogo';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  RefreshCw,
  AlertOctagon,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const RestrictedAccessScreen: React.FC = () => {
  const { blockedAttemptEmail, setIsAccessRestricted, setBlockedAttemptEmail, navigateTo } = useApp();

  const handleRetryAuthorized = () => {
    setIsAccessRestricted(false);
    setBlockedAttemptEmail(null);
    navigateTo('/superadmin');
  };

  const handleReturnHome = () => {
    setIsAccessRestricted(false);
    setBlockedAttemptEmail(null);
    navigateTo('/');
  };

  return (
    <div className="min-h-screen bg-[#0D1829] text-white flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-300">
      {/* Top Security Status Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
            Security Incident Blocked · 403 Forbidden
          </span>
        </div>

        <span className="text-[10px] font-mono tracking-widest text-rose-300 bg-rose-950/80 border border-rose-800/80 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-rose-400" />
          <span>Access Restricted</span>
        </span>
      </div>

      {/* Main Restricted Content */}
      <div className="max-w-md w-full mx-auto my-auto py-6 sm:py-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-2xl shadow-rose-950">
            <ShieldAlert className="w-10 h-10 animate-pulse text-rose-500" />
          </div>

          <div className="pt-2">
            <ZoodiLogo size="md" showTagline={false} lightMode={true} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Restricted Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-sm mx-auto">
            You do not have permission to enter the ZOODI Administration Console.
          </p>
        </div>

        {/* Breach Alert Box */}
        <div className="bg-[#15243B] rounded-3xl border border-rose-500/30 p-6 shadow-2xl space-y-5">
          {/* Attempted Identity Record */}
          <div className="p-4 rounded-2xl bg-[#0D1829] border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Attempted Account</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] border border-rose-500/40">
                Unauthorized
              </span>
            </div>
            <p className="font-mono text-xs sm:text-sm font-bold text-rose-200 break-all">
              {blockedAttemptEmail || 'unauthorized.user@gmail.com'}
            </p>
          </div>

          {/* Policy Information */}
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-white">Strict Single-Account Policy:</strong> Only the primary owner account <strong className="text-teal-300">zoodicollection@gmail.com</strong> is authorized to access administrative controls.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Email and password authentication has been retired. All non-authorized Google accounts are blocked by system-level OAuth filters.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px] text-slate-400">
                This attempt was recorded in the Cloud Firestore audit trail: <span className="font-mono text-slate-300">ADMIN_UNAUTHORIZED_ATTEMPT</span>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2 border-t border-slate-700/60">
            <button
              type="button"
              onClick={handleRetryAuthorized}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#08A9A2] to-teal-500 hover:from-[#079690] hover:to-teal-600 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sign in with zoodicollection@gmail.com</span>
            </button>

            <button
              type="button"
              onClick={handleReturnHome}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Shopping Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="text-center text-[10px] text-slate-400 py-2">
        ZOODI Security Firewall • Access Control Enforcement Active • 256-bit Cloud Audit Trail
      </div>
    </div>
  );
};
