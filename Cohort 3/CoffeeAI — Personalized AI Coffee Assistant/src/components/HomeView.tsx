import React from 'react';
import { Sparkles, ArrowRight, Flame, Tag, Heart, ShieldCheck, Clock, MapPin, Zap } from 'lucide-react';
import { CustomerProfile, MenuItem, OfferPromotion, StoreLocation } from '../types';

interface HomeViewProps {
  customer: CustomerProfile | null;
  featuredItems: MenuItem[];
  offers: OfferPromotion[];
  stores: StoreLocation[];
  onOpenAssistantWithPrompt: (prompt: string) => void;
  onSelectProduct: (product: MenuItem) => void;
  onNavigateToMenu: () => void;
  onQuickOrder: (product: MenuItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  customer,
  featuredItems,
  offers,
  stores,
  onOpenAssistantWithPrompt,
  onSelectProduct,
  onNavigateToMenu,
  onQuickOrder,
}) => {
  const quickPrompts = [
    {
      title: 'Personalized Match',
      prompt: 'I want something cold and not too sweet.',
      icon: '🧊',
      tag: 'Customer Preference',
    },
    {
      title: 'Order History',
      prompt: 'What did I order last time?',
      icon: '📜',
      tag: 'Memory Retrieval',
    },
    {
      title: 'Smart Alternative',
      prompt: 'Recommend something similar to my previous order but less sweet.',
      icon: '✨',
      tag: 'Personalized RAG',
    },
    {
      title: 'Price & Caffeine',
      prompt: 'How much does Signature Cold Brew cost and how much caffeine does it have?',
      icon: '⚡',
      tag: 'Knowledge Grounding',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-[#3C2A21] text-white p-6 sm:p-8 lg:p-10 shadow-sm border border-stone-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E7F3FF]/15 border border-[#E7F3FF]/30 text-[11px] text-[#D4A373] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Intelligent Customer-Facing Agent • Powered by Gemini</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Exceptional Coffee, <br />
            <span className="text-[#D4A373]">
              Intelligently Crafted.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Welcome back, <strong className="text-white">{customer?.name || 'Alex'}</strong>. Your AI Barista combines real-time menu knowledge, ethical sourcing details, and your unique taste profile to brew the perfect cup every time.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-cta-ask-ai"
              onClick={() => onOpenAssistantWithPrompt("Hi CoffeeAI! What do you recommend for me today based on my preferences?")}
              className="px-5 py-2.5 rounded-lg bg-[#6F4E37] hover:bg-[#5C3F2C] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Ask CoffeeAI Barista</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="hero-cta-browse-menu"
              onClick={onNavigateToMenu}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              Explore Full Menu
            </button>
          </div>

          {/* Customer Preference Quick Bar */}
          {customer && (
            <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs text-stone-300">
              <span className="text-[#D4A373] font-bold text-[11px] uppercase tracking-wider">Active Profile:</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">Temp: {customer.preferences.preferredTemperature}</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">Sweetness: {customer.preferences.sweetnessLevel}</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">Milk: {customer.preferences.milkPreference}</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px]">{customer.membershipTier}</span>
            </div>
          )}
        </div>
      </section>

      {/* Suggested Quick Prompts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">Try Asking CoffeeAI</h2>
            <p className="text-xs text-stone-500">Demonstrating multi-turn reasoning, RAG grounding, and personal memory</p>
          </div>
          <button
            onClick={() => onOpenAssistantWithPrompt("What makes CoffeeAI different from a regular chatbot?")}
            className="text-xs font-bold text-[#6F4E37] hover:text-[#3C2A21] hidden sm:flex items-center gap-1"
          >
            <span>See how it works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              id={`quick-prompt-btn-${idx}`}
              onClick={() => onOpenAssistantWithPrompt(item.prompt)}
              className="p-3.5 rounded-xl bg-white border border-stone-200 hover:border-[#D4A373] shadow-2xs hover:shadow-xs transition-all text-left group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px] font-bold text-[#6F4E37] bg-[#E7F3FF] px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-[#6F4E37] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                  "{item.prompt}"
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#6F4E37] font-bold">
                <span>Ask Barista</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Single Origins & Handcrafted Brews */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#6F4E37]" />
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">Featured & Tailored For You</h2>
            </div>
            <p className="text-xs text-stone-500">Freshly roasted specialty offerings aligned with your profile</p>
          </div>
          <button
            onClick={onNavigateToMenu}
            className="text-xs font-bold text-[#6F4E37] hover:text-[#3C2A21] flex items-center gap-1"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredItems.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-xs transition-all flex flex-col group"
            >
              {/* Product Image */}
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#3C2A21]/90 text-white rounded">
                    {product.category}
                  </span>
                  {product.dietaryTags.slice(0, 1).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold bg-green-700 text-white rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-white px-2 py-0.5 rounded shadow-2xs text-xs font-bold text-stone-900">
                  ${product.basePrice.toFixed(2)}
                </div>
              </div>

              {/* Product Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-[#6F4E37] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Flavor Notes */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {product.flavorNotes.map((note, i) => (
                      <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900"
                  >
                    View Specs
                  </button>
                  <button
                    onClick={() => onQuickOrder(product)}
                    className="px-3 py-1.5 bg-[#6F4E37] hover:bg-[#5C3F2C] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Quick Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Store Promotions & Offers */}
      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-[#6F4E37]" />
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">Current Promotions & Rewards</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#6F4E37] text-white rounded">
                    {offer.badge}
                  </span>
                  <code className="text-xs font-mono font-bold text-[#6F4E37] bg-white px-2 py-0.5 rounded border border-stone-200">
                    {offer.code}
                  </code>
                </div>
                <h3 className="font-bold text-xs text-stone-900 mt-2">{offer.title}</h3>
                <p className="text-xs text-stone-600 mt-0.5">{offer.description}</p>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                <span>Valid through {new Date(offer.validUntil).toLocaleDateString()}</span>
                <button
                  onClick={() => onOpenAssistantWithPrompt(`How can I use the promo code ${offer.code}?`)}
                  className="font-bold text-[#6F4E37] hover:underline"
                >
                  Apply via AI
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store Locations & Pickup Times */}
      <section className="rounded-xl bg-white p-5 border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#6F4E37]" />
              <h2 className="text-base font-bold text-stone-900">Our Roasteries & Coffee Bars</h2>
            </div>
            <p className="text-xs text-stone-500">Live wait times and equipment status across San Francisco</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-[#065F46] font-bold bg-[#ECFDF5] px-2.5 py-1 rounded border border-[#10B981]/20 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>All Stores Open Today</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stores.map((store) => (
            <div key={store.id} className="p-3 rounded-lg bg-[#FAF9F6] border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-stone-900">{store.name}</h3>
                <span className="text-[10px] font-bold bg-[#E7F3FF] text-[#0A5699] px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>~{store.currentWaitMinutes}m wait</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-500">{store.address}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {store.features.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-600 font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
