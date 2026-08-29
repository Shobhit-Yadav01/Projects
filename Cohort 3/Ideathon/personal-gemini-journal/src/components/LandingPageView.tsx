import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Compass,
  Zap,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  Layers,
  HeartHandshake,
  User,
  Loader2,
  LogIn
} from 'lucide-react';
import { UserSecurityProfile } from '../types';
import { loginGuest } from '../lib/firebase';

interface LandingPageViewProps {
  user: UserSecurityProfile | null;
  onGetStarted: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  user,
  onGetStarted,
  onOpenAuth
}) => {
  const [isGuestStarting, setIsGuestStarting] = useState(false);
  const [guestError, setGuestError] = useState('');

  const handleGuestLogin = async () => {
    setGuestError('');
    setIsGuestStarting(true);
    try {
      await loginGuest();
      onGetStarted();
    } catch (err: any) {
      setGuestError(err.message || 'Could not start guest session.');
    } finally {
      setIsGuestStarting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 pb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Enterprise Zero-Trust & Cloud Firestore Isolation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Your thoughts. <span className="text-indigo-600">Your AI companion.</span> Your private space.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong>Personal Gemini Journal</strong> combines deep multi-turn reflective AI dialogue, automatic executive summarization, and weekly longitudinal insights—backed by Google Cloud Secret Manager and strict tenant isolation.
        </p>

        {/* Security Tagline Badge */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your journal is private and protected by Firebase Authentication and Firestore Security Rules.</span>
        </div>

        {guestError && (
          <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {guestError}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {user ? (
            <button
              id="btn-landing-enter-workspace"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Enter Journal Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                id="btn-landing-get-started"
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition flex items-center justify-center space-x-2"
              >
                <span>Get Started with Private Journal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-landing-signin"
                onClick={() => onOpenAuth('signin')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-2xs transition flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Sign In to Your Account</span>
              </button>

              <button
                id="btn-landing-guest"
                onClick={handleGuestLogin}
                disabled={isGuestStarting}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGuestStarting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{isGuestStarting ? 'Starting Guest...' : 'Start Anonymous Guest'}</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Multi-Turn Reflective AI</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Engage with specialized Gemini personas—from probing Socratic coaching and strategic brainstorming to mindful decompression and executive decision matrices.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Strict Data Isolation & Secret Zero</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            API keys are never exposed in the browser. Credentials resolve via Google Cloud Secret Manager, and Firestore Security Rules enforce zero-trust ownership boundaries.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Weekly Reflection & Insights</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Original feature: Automatically analyze past summaries to surface recurring thought patterns, goal momentum, unresolved dilemmas, and next week's focus areas.
          </p>
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Engineered for Clarity & Enterprise Security</h2>
          <p className="text-xs text-slate-500">
            Everything you need for thoughtful reflection, task execution, and longitudinal personal growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            { title: 'Interactive Scratchpad', desc: 'Dual-pane workflow combining freeform journaling with AI conversational insights.' },
            { title: 'Auto Action Extraction', desc: 'Converts unstructured reflections into actionable goals with priorities and deadlines.' },
            { title: 'Executive Summaries', desc: 'Instant structured extraction of core takeaways, themes, and follow-up prompts.' },
            { title: 'Cloud Run Ready', desc: 'Production Node.js/Express container architecture optimized for Google Cloud deployment.' }
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-indigo-600 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{f.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

