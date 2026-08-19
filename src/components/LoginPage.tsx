import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cloud,
  TrendingUp,
  Dumbbell,
  Apple,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
  X,
} from 'lucide-react';
import { signInWithGoogle, logOut } from '../firebase';
import { User } from 'firebase/auth';

interface LoginPageProps {
  currentUser: User | null;
  isOpen?: boolean;
  onClose?: () => void;
  onContinueAsGuest?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  isOpen,
  onClose,
  onContinueAsGuest,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in window closed before completing. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await logOut();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-xl mx-auto bg-[#121212] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background glowing ambient effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Close button if rendered as modal */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#737373] hover:text-[#EDEDED] bg-[#171717] hover:bg-[#262626] rounded-full transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header / Brand */}
      <div className="text-center space-y-2 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 mb-2 shadow-lg shadow-orange-500/10">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#EDEDED] tracking-tight">
          {currentUser ? 'Your Google Account' : 'Sign in to GymPulse'}
        </h2>
        <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto">
          {currentUser
            ? 'Your fitness targets, workout PRs, and nutrition logs are actively synced with Google Cloud.'
            : 'Securely sync your workouts, progressive overload metrics, and nutrition blueprint across all devices.'}
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Authentication Action */}
      <div className="space-y-3 relative z-10">
        {currentUser ? (
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full border border-orange-500/40 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-lg">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#EDEDED] truncate">
                    {currentUser.displayName || 'Google Lifter'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] truncate font-mono">{currentUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#121212] rounded-xl border border-[#262626]">
                <span className="text-[#737373] text-[10px] block">Cloud Status</span>
                <span className="font-semibold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                  <Cloud className="w-3 h-3" /> Synced
                </span>
              </div>
              <div className="p-2.5 bg-[#121212] rounded-xl border border-[#262626]">
                <span className="text-[#737373] text-[10px] block">Security</span>
                <span className="font-semibold text-[#EDEDED] flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-orange-400" /> Zero-Trust
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-orange-500 hover:bg-orange-400 transition-all cursor-pointer"
                >
                  Continue to App
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Google Sign In Button */}
            <button
              type="button"
              id="google_signin_button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60"
            >
              {/* Google Multicolor SVG Logo */}
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
              <span>{isLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            {onContinueAsGuest && (
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-semibold text-[#A1A1AA] hover:text-[#EDEDED] bg-[#171717] hover:bg-[#262626] border border-[#262626] transition-all cursor-pointer"
              >
                <span>Continue as Guest (Local Offline Mode)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="pt-2 border-t border-[#262626] space-y-3 relative z-10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] block">
          Benefits of Google Cloud Sync
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#171717] border border-[#262626]">
            <Cloud className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#EDEDED]">Multi-Device Backup</h4>
              <p className="text-[11px] text-[#A1A1AA]">
                Switch seamlessly between your laptop, tablet, and smartphone without losing data.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#171717] border border-[#262626]">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#EDEDED]">Progressive Overload History</h4>
              <p className="text-[11px] text-[#A1A1AA]">
                Permanent record of lift numbers, max volume, and personal records.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#171717] border border-[#262626]">
            <Apple className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#EDEDED]">Calorie & Macro Blueprint</h4>
              <p className="text-[11px] text-[#A1A1AA]">
                Synchronized Mifflin-St Jeor targets, high-protein meal plans, and diet logs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#171717] border border-[#262626]">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#EDEDED]">Zero-Trust Security</h4>
              <p className="text-[11px] text-[#A1A1AA]">
                Protected by strict Firestore security rules bound directly to your Google UID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return content;
};
