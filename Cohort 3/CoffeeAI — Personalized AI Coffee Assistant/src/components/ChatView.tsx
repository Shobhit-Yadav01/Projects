import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Coffee,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sliders,
  ExternalLink,
  Flame,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, CustomerProfile, MenuItem, RecommendationCard, Order } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  customer: CustomerProfile | null;
  orders?: Order[];
  menu?: MenuItem[];
  onQuickOrder: (card: RecommendationCard) => void;
  onSelectProductById: (productId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearHistory,
  customer,
  orders = [],
  menu = [],
  onQuickOrder,
  onSelectProductById,
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    'My usual please',
    'I want something cold and not too sweet',
    'New seasonal drinks',
    'Check rewards & previous orders',
    'Is your oat milk certified gluten-free?',
    'Store hours & nitro draft availability',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleDetails = (id: string) => {
    setExpandedDetailsId((prev) => (prev === id ? null : id));
  };

  // Recent order items for sidebar
  const recentOrders = orders.slice(0, 3);

  // Recommended items from menu based on customer preference
  const featuredRecs = menu.filter((m) => m.isFeatured).slice(0, 2);

  // Loyalty calculations
  const loyaltyPoints = customer?.loyaltyPoints || 1240;
  const pointsToNext = Math.max(0, 1500 - loyaltyPoints);
  const loyaltyPct = Math.min(100, Math.round((loyaltyPoints / 1500) * 100));

  return (
    <div className="w-full h-[calc(100vh-56px)] flex bg-[#FDFCFB] font-sans text-stone-800 overflow-hidden border-t border-stone-200">
      {/* Left Sidebar: Preferences & Cloud Run Status (High Density) */}
      <aside className="w-64 border-r border-stone-200 p-4 hidden md:flex flex-col gap-5 bg-[#FAF9F6] shrink-0 overflow-y-auto">
        {/* Your Preferences */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">Your Preferences</h3>
            <span className="text-[10px] font-semibold text-[#6F4E37]">{customer?.name?.split(' ')[0] || 'User'}</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-stone-200/80 shadow-2xs">
              <span className="text-xs font-medium text-stone-600">Sweetness</span>
              <span className="text-xs text-[#6F4E37] font-bold">
                {customer?.preferences.sweetnessLevel || 'Low'} ({customer?.preferences.sweetnessPercent ?? 25}%)
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-stone-200/80 shadow-2xs">
              <span className="text-xs font-medium text-stone-600">Temperature</span>
              <span className="text-xs text-[#6F4E37] font-bold">
                {customer?.preferences.preferredTemperature || 'Iced'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-stone-200/80 shadow-2xs">
              <span className="text-xs font-medium text-stone-600">Milk Base</span>
              <span className="text-xs text-[#6F4E37] font-bold">
                {customer?.preferences.milkPreference || 'Oat Milk'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-stone-200/80 shadow-2xs">
              <span className="text-xs font-medium text-stone-600">Dietary</span>
              <span className="text-xs text-[#6F4E37] font-bold truncate max-w-[90px]">
                {customer?.preferences.dietaryPreferences[0] || 'Dairy-Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Cloud Run Status */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400 mb-2">Cloud Run Status</h3>
          <div className="p-3 bg-[#ECFDF5] border border-[#10B981]/20 rounded-lg space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
              <span className="text-xs font-bold text-[#065F46]">Agent Live</span>
            </div>
            <div className="text-[10px] text-[#065F46]/80 leading-tight">
              Deployment: coffeeai-agent-v2.4<br />
              Latency: 142ms • Model: Gemini 2.5 Flash
            </div>
          </div>
        </div>

        {/* Quick Prompts */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400 mb-2">Quick Prompts</h3>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(p)}
                disabled={isLoading}
                className="text-[10px] bg-white border border-stone-200 px-2 py-1 rounded hover:border-[#D4A373] text-stone-700 hover:text-[#6F4E37] transition-colors text-left"
              >
                '{p}'
              </button>
            ))}
          </div>
        </div>

        {/* Reset Session */}
        <div className="mt-auto pt-2">
          <button
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-stone-100 border border-stone-200 rounded text-xs font-medium text-stone-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-stone-400" />
            <span>Reset Session</span>
          </button>
        </div>
      </aside>

      {/* Center Main Chat Panel */}
      <section className="flex-1 flex flex-col relative bg-white min-w-0">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Welcome Greeting when empty */}
          {messages.length === 0 && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-[#6F4E37] flex items-center justify-center shrink-0 shadow-xs">
                <div className="w-4 h-4 border-white border-2 rounded-full border-t-transparent animate-spin-slow"></div>
              </div>
              <div className="max-w-[85%]">
                <div className="bg-[#F3F4F6] p-3.5 rounded-2xl rounded-tl-none shadow-2xs">
                  <p className="text-sm leading-relaxed text-stone-800">
                    Welcome back, <strong>{customer?.name || 'Alex'}</strong>! 👋 I see you enjoyed an{' '}
                    <strong>Oat Milk Latte</strong> recently. Would you like to try something similar, perhaps our new{' '}
                    <span className="text-[#6F4E37] font-bold">Iced Caramel Cloud Brew</span>? It's currently in stock and matches your preference for low sweetness.
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  CoffeeAI Agent • Grounded in Menu & Profile Memory
                </span>
              </div>
            </div>
          )}

          {/* Rendered Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col space-y-2">
              {msg.role === 'user' ? (
                /* User Message */
                <div className="flex gap-3 justify-end">
                  <div className="max-w-[80%]">
                    <div className="bg-[#D4A373] text-white p-3.5 rounded-2xl rounded-tr-none shadow-xs">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0 font-bold text-stone-600 text-xs">
                    {customer?.name?.slice(0, 2).toUpperCase() || 'AM'}
                  </div>
                </div>
              ) : (
                /* Assistant Message */
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6F4E37] flex items-center justify-center shrink-0 shadow-xs">
                    <div className="w-4 h-4 border-white border-2 rounded-full border-t-transparent"></div>
                  </div>
                  <div className="max-w-[85%] space-y-2">
                    <div className="bg-[#F3F4F6] p-3.5 rounded-2xl rounded-tl-none shadow-2xs">
                      <div className="text-sm leading-relaxed text-stone-800 prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* Grounding Transparency Badge */}
                      {msg.groundingTag && (
                        <div className="mt-2.5 pt-2 border-t border-stone-200/80 flex items-center gap-1.5 text-[10px] font-semibold text-[#6F4E37]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>{msg.groundingTag}</span>
                        </div>
                      )}
                    </div>

                    {/* Recommendation Cards if attached */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {msg.recommendations.map((card) => (
                          <div
                            key={card.productId}
                            className="bg-white rounded-lg p-3 border border-stone-200 shadow-2xs space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-stone-900">{card.name}</span>
                                <p className="text-[11px] text-stone-500 mt-0.5">{card.reason}</p>
                              </div>
                              <span className="text-xs font-bold text-[#6F4E37] ml-2 shrink-0">
                                ${card.price.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex flex-wrap gap-1.5">
                                {card.matchingTags.map((t, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 uppercase font-bold"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onSelectProductById(card.productId)}
                                  className="text-[10px] font-bold text-stone-500 hover:text-stone-800 uppercase"
                                >
                                  Specs
                                </button>
                                <button
                                  onClick={() => onQuickOrder(card)}
                                  className="text-[10px] font-bold text-[#D4A373] hover:text-[#6F4E37] uppercase bg-stone-50 px-2 py-0.5 rounded border border-stone-200"
                                >
                                  Order
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expandable Tool Execution and Grounding Trace */}
                    {(msg.sources?.length || msg.toolCalls?.length) ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleDetails(msg.id)}
                            className="text-[10px] text-stone-400 hover:text-stone-600 italic flex items-center gap-1 focus:outline-none"
                          >
                            <span>
                              {msg.toolCalls?.length ? `Grounded via Tool: ${msg.toolCalls[0].name}()` : 'Grounded Knowledge Base'}
                            </span>
                            {expandedDetailsId === msg.id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                          <div className="h-[1px] flex-1 bg-stone-100"></div>
                        </div>

                        {expandedDetailsId === msg.id && (
                          <div className="p-3 bg-[#FAF9F6] border border-stone-200 rounded-lg text-xs space-y-2 font-mono">
                            {msg.toolCalls && msg.toolCalls.length > 0 && (
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-[#6F4E37]">
                                  Google Gen AI Function Call Trace:
                                </p>
                                {msg.toolCalls.map((t, idx) => (
                                  <div key={idx} className="mt-1 p-1.5 bg-white rounded border border-stone-200 text-[10px]">
                                    <span className="font-bold text-[#6F4E37]">⚡ {t.name}()</span>
                                    <div className="text-stone-500 truncate text-[9px] mt-0.5">Args: {JSON.stringify(t.args)}</div>
                                    <div className="text-[#065F46] bg-[#ECFDF5] p-1 rounded mt-0.5 text-[9px]">{t.resultSummary}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {msg.sources && msg.sources.length > 0 && (
                              <div className="pt-1">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-[#6F4E37]">
                                  Grounded RAG Sources:
                                </p>
                                {msg.sources.map((src, idx) => (
                                  <div key={idx} className="mt-1 p-1.5 bg-white rounded border border-stone-200 text-[10px]">
                                    <span className="font-bold text-stone-800">{src.title}</span>
                                    <p className="text-stone-500 text-[9px] line-clamp-2 mt-0.5">{src.snippet}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing State */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6F4E37] flex items-center justify-center shrink-0 shadow-xs">
                <div className="w-4 h-4 border-white border-2 rounded-full border-t-transparent animate-spin-slow"></div>
              </div>
              <div className="bg-[#F3F4F6] p-3 rounded-2xl rounded-tl-none shadow-2xs flex items-center gap-2">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6F4E37] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6F4E37] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6F4E37] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-stone-500 ml-1">Consulting roastery menu and barista tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-stone-200 bg-white">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              id="chat-user-input"
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask CoffeeAI about the menu or your orders..."
              disabled={isLoading}
              className="w-full bg-[#F9F8F6] border border-stone-200 rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373] text-stone-800 placeholder-stone-400 transition-all"
            />
            <button
              id="btn-chat-send"
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2 w-8 h-8 bg-[#6F4E37] hover:bg-[#5C3F2C] disabled:opacity-40 rounded-full flex items-center justify-center text-white shadow-xs transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Right Sidebar: Smart Recommendations & Loyalty (High Density) */}
      <aside className="w-80 border-l border-stone-200 p-4 hidden xl:flex flex-col gap-5 shrink-0 bg-[#FDFCFB] overflow-y-auto">
        {/* Smart Recommendations */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400 mb-3">Smart Recommendations</h3>
          <div className="space-y-3">
            {featuredRecs.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden border border-stone-200 bg-white p-3 hover:shadow-xs transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold leading-tight mb-1 text-stone-900 truncate">{item.name}</div>
                    <div className="text-[10px] text-stone-400 leading-tight line-clamp-2">{item.description}</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6F4E37]">${item.basePrice.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectProductById(item.id)}
                      className="text-[10px] font-semibold text-stone-500 hover:text-stone-800"
                    >
                      Details
                    </button>
                    <button
                      onClick={() =>
                        onQuickOrder({
                          productId: item.id,
                          name: item.name,
                          category: item.category,
                          price: item.basePrice,
                          reason: 'Recommended for you',
                          matchingTags: item.flavorNotes,
                          imageUrl: item.imageUrl,
                        })
                      }
                      className="text-[10px] font-bold text-[#D4A373] hover:text-[#6F4E37] uppercase"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent History */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400 mb-2">Recent History</h3>
          <div className="space-y-1.5">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded border border-transparent hover:border-stone-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 shrink-0">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) : 'Recent'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-stone-900 truncate">
                      {order.items[0]?.productName || 'Specialty Coffee'}
                    </div>
                    <div className="text-[9px] text-stone-400">
                      {order.storeName.split('—')[0]} • ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-stone-50 rounded text-center text-[10px] text-stone-400">
                No previous order history
              </div>
            )}
          </div>
        </div>

        {/* Loyalty Rewards Widget */}
        <div className="mt-auto p-4 bg-[#6F4E37] rounded-2xl text-white shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Loyalty Rewards</div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold">{loyaltyPoints.toLocaleString()}</span>
              <span className="text-[10px] ml-1 opacity-80">pts</span>
            </div>
            <div className="w-12 h-12 border-4 border-white/20 rounded-full flex items-center justify-center relative">
              <div
                className="absolute inset-0 border-4 border-white rounded-full"
                style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 75%, 50% 75%)' }}
              ></div>
              <span className="text-[10px] font-bold">{loyaltyPct}%</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] opacity-80 leading-tight">
            Almost there! {pointsToNext} points until your next free signature drink.
          </div>
        </div>
      </aside>
    </div>
  );
};
