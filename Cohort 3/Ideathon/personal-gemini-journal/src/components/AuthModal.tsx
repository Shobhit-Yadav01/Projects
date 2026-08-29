import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
  User,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithEmail,
  signupWithEmail,
  loginGuest
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authInProgress, setAuthInProgress] = useState<string | null>(null); // 'google' | 'email' | 'guest' | null

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setEmail('');
      setPassword('');
      setAuthInProgress(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isBusy = authInProgress !== null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setAuthInProgress('email');

    try {
      if (mode === 'signup') {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthInProgress(null);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setAuthInProgress('google');
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in was not completed.');
    } finally {
      setAuthInProgress(null);
    }
  };

  const handleGuestAuth = async () => {
    setErrorMsg('');
    setAuthInProgress('guest');
    try {
      await loginGuest();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest session initialization failed.');
    } finally {
      setAuthInProgress(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
        
        {/* Close Button */}
        <button
          id="btn-auth-modal-close"
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Your private journal is secured by Firebase Authentication and Firestore zero-trust data isolation.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            id="tab-auth-signin"
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-auth-signup"
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Feedback Notice */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <p className="font-semibold text-rose-900">Authentication Notice</p>
              <p className="leading-relaxed text-rose-700">{errorMsg}</p>
              {errorMsg.includes("Email/Password") && (
                <div className="mt-1 pt-1.5 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-600">Tip: You can use Google Sign-in or Quick Anonymous Guest right away.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Authentication */}
        <button
          id="btn-auth-google"
          type="button"
          onClick={handleGoogleAuth}
          disabled={isBusy}
          className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-60"
        >
          {authInProgress === 'google' ? (
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{authInProgress === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center space-x-3">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Or with Email</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                autoComplete="email"
                value={email}
                disabled={isBusy}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password {mode === 'signup' && <span className="text-slate-400 font-normal">(min 6 characters)</span>}
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="auth-password-input"
                type="password"
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                disabled={isBusy}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-slate-50"
              />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={isBusy}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-200 transition disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {authInProgress === 'email' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <span>{mode === 'signup' ? 'Create Account' : 'Sign In with Email'}</span>
            )}
          </button>
        </form>

        {/* Anonymous Guest Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-slate-50 hover:bg-slate-100/80 transition rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
            <div className="text-left space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Quick Anonymous Guest</p>
              <p className="text-[10px] text-slate-500">Test immediately without email or password</p>
            </div>
            <button
              id="btn-auth-guest"
              type="button"
              onClick={handleGuestAuth}
              disabled={isBusy}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-indigo-600 font-semibold text-xs transition shadow-2xs disabled:opacity-50 flex items-center space-x-1.5"
            >
              {authInProgress === 'guest' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>{authInProgress === 'guest' ? 'Starting...' : 'Start Guest'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

