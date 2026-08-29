import React from 'react';
import {
  BookOpen,
  CheckSquare,
  History,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Lock,
  User,
  LogOut,
  LogIn,
  KeyRound,
  FileCode2,
  BrainCircuit,
  LayoutDashboard
} from 'lucide-react';
import { UserSecurityProfile } from '../types';

export type AppTabType = 'dashboard' | 'journal' | 'weekly' | 'actions' | 'history' | 'analytics' | 'security';

interface NavbarProps {
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  user: UserSecurityProfile | null;
  actionItemsCount: number;
  pendingActionsCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSecurityModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  actionItemsCount,
  pendingActionsCount,
  onOpenAuth,
  onLogout,
  onOpenSecurityModal
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 tracking-tight text-lg">
                  Personal Gemini Journal
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Isolated Firestore
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Reflective Companion & Longitudinal Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-tab-journal"
              onClick={() => setActiveTab('journal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'journal'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal Workspace</span>
            </button>

            <button
              id="nav-tab-weekly"
              onClick={() => setActiveTab('weekly')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'weekly'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
              <span>Weekly Insights</span>
            </button>

            <button
              id="nav-tab-actions"
              onClick={() => setActiveTab('actions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                activeTab === 'actions'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Actions</span>
              {pendingActionsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  {pendingActionsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              id="nav-tab-security"
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security Spec</span>
            </button>
          </nav>

          {/* Right Action: Auth / User Details */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-security-quick-view"
              onClick={onOpenSecurityModal}
              title="Enterprise Security Architecture Details"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:inline-flex items-center gap-1 text-xs border border-slate-200"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secret Manager</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs uppercase font-bold">
                    {user.email ? user.email.charAt(0) : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="truncate max-w-[120px] font-semibold text-slate-800">
                      {user.displayName || user.email || 'Authenticated User'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {user.isAnonymous ? 'Guest Session' : 'Secured Firestore'}
                    </p>
                  </div>
                </div>
                <button
                  id="btn-nav-logout"
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-signin"
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === 'journal' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Journal & AI
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-1.5 rounded-md font-medium relative ${
              activeTab === 'actions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Action Items ({pendingActionsCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Archive
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-md font-medium ${
              activeTab === 'security' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Spec
          </button>
        </div>
      </div>
    </header>
  );
};
