import React from 'react';
import { Coffee, Sparkles, User, ShoppingBag, Sliders, PlayCircle, Store } from 'lucide-react';
import { CustomerProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'assistant' | 'menu' | 'preferences' | 'orders';
  setActiveTab: (tab: 'home' | 'assistant' | 'menu' | 'preferences' | 'orders') => void;
  customer: CustomerProfile | null;
  onOpenTestSuite: () => void;
  onOpenProfileSwitcher: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  customer,
  onOpenTestSuite,
  onOpenProfileSwitcher,
}) => {
  return (
    <header className="h-14 border-b border-stone-200 bg-white sticky top-0 z-40 px-4 sm:px-6 shrink-0 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        {/* Logo & Branding */}
        <div className="flex items-center gap-2">
          <button
            id="nav-logo-btn"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 bg-[#6F4E37] rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin-slow"></div>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#3C2A21]">
              Coffee<span className="text-[#D4A373]">AI</span>
            </span>
          </button>
          <span className="hidden md:inline-flex ml-2 px-2 py-0.5 bg-[#E7F3FF] text-[#0A5699] text-[10px] font-bold rounded uppercase tracking-wider">
            AI Barista
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`h-full flex items-center px-1 transition-colors border-b-2 text-xs font-semibold ${
              activeTab === 'home'
                ? 'text-[#6F4E37] border-[#6F4E37]'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            Home
          </button>

          <button
            id="nav-tab-assistant"
            onClick={() => setActiveTab('assistant')}
            className={`h-full flex items-center gap-1.5 px-1 transition-colors border-b-2 text-xs font-semibold ${
              activeTab === 'assistant'
                ? 'text-[#6F4E37] border-[#6F4E37]'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Assistant</span>
          </button>

          <button
            id="nav-tab-menu"
            onClick={() => setActiveTab('menu')}
            className={`h-full flex items-center px-1 transition-colors border-b-2 text-xs font-semibold ${
              activeTab === 'menu'
                ? 'text-[#6F4E37] border-[#6F4E37]'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            Menu
          </button>

          <button
            id="nav-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`h-full flex items-center px-1 transition-colors border-b-2 text-xs font-semibold ${
              activeTab === 'orders'
                ? 'text-[#6F4E37] border-[#6F4E37]'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            Orders
          </button>

          <button
            id="nav-tab-preferences"
            onClick={() => setActiveTab('preferences')}
            className={`h-full flex items-center px-1 transition-colors border-b-2 text-xs font-semibold ${
              activeTab === 'preferences'
                ? 'text-[#6F4E37] border-[#6F4E37]'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            Preferences
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Test Scenarios Evaluation Suite Button */}
          <button
            id="btn-open-test-scenarios"
            onClick={onOpenTestSuite}
            title="Run 10 Gen AI Evaluation Test Scenarios"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#6F4E37] bg-[#FAF9F6] hover:bg-stone-100 border border-stone-200 rounded-md transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="hidden sm:inline">Evaluation Tests</span>
            <span className="sm:hidden">Tests</span>
          </button>

          {/* Customer Profile Switcher & Chip */}
          {customer && (
            <button
              id="btn-customer-profile-pill"
              onClick={onOpenProfileSwitcher}
              className="flex items-center gap-2 hover:bg-stone-50 p-1 pl-2 rounded-lg border border-transparent hover:border-stone-200 transition-all text-left"
            >
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-stone-900 leading-tight">{customer.name}</div>
                <div className="text-[10px] text-stone-400 leading-tight">{customer.membershipTier.split(' ')[0]} Member • {customer.loyaltyPoints} pts</div>
              </div>
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-8 h-8 rounded-full bg-[#D4A373] border-2 border-white shadow-xs object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto space-x-1 py-1.5 border-t border-stone-100 bg-white no-scrollbar">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            activeTab === 'home' ? 'bg-[#6F4E37] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'assistant' ? 'bg-[#6F4E37] text-white' : 'text-[#6F4E37] bg-[#E7F3FF]'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            activeTab === 'menu' ? 'bg-[#6F4E37] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-[#6F4E37] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${
            activeTab === 'preferences' ? 'bg-[#6F4E37] text-white' : 'text-stone-600 bg-stone-100'
          }`}
        >
          Preferences
        </button>
      </div>
    </header>
  );
};
