import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { MenuView } from './components/MenuView';
import { PreferencesView } from './components/PreferencesView';
import { OrdersView } from './components/OrdersView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuickOrderModal } from './components/QuickOrderModal';
import { TestScenariosModal } from './components/TestScenariosModal';
import { ProfileSwitcherModal } from './components/ProfileSwitcherModal';
import {
  CustomerProfile,
  CustomerPreferences,
  MenuItem,
  OfferPromotion,
  StoreLocation,
  Order,
  ChatMessage,
  RecommendationCard,
  ChatApiResponse,
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'assistant' | 'menu' | 'preferences' | 'orders'>('home');
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [allCustomers, setAllCustomers] = useState<CustomerProfile[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<OfferPromotion[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [conversationId, setConversationId] = useState<string>(() => `conv_alex_${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<MenuItem | null>(null);
  const [selectedProductForQuickOrder, setSelectedProductForQuickOrder] = useState<MenuItem | null>(null);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState<boolean>(false);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState<boolean>(false);

  // Initial Data Fetching
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [custRes, allCustRes, menuRes, offersRes, storesRes, ordersRes] = await Promise.all([
          fetch('/api/customer/cust_alex_01').then((r) => r.json()),
          fetch('/api/customers').then((r) => r.json()),
          fetch('/api/menu').then((r) => r.json()),
          fetch('/api/offers').then((r) => r.json()),
          fetch('/api/stores').then((r) => r.json()),
          fetch('/api/customer/cust_alex_01/orders').then((r) => r.json()),
        ]);

        setCustomer(custRes);
        setAllCustomers(allCustRes);
        setMenu(menuRes);
        setOffers(offersRes);
        setStores(storesRes);
        setOrders(ordersRes);
      } catch (err) {
        console.error('Failed to load initial application state:', err);
      }
    }

    loadInitialData();
  }, []);

  // Customer Switching
  const handleSelectCustomer = async (customerId: string) => {
    try {
      const [custRes, ordersRes] = await Promise.all([
        fetch(`/api/customer/${customerId}`).then((r) => r.json()),
        fetch(`/api/customer/${customerId}/orders`).then((r) => r.json()),
      ]);
      setCustomer(custRes);
      setOrders(ordersRes);
      setConversationId(`conv_${customerId}_${Date.now()}`);
      setMessages([]);
    } catch (err) {
      console.error('Failed to switch customer:', err);
    }
  };

  // Preference Updates
  const handleSavePreferences = async (updated: CustomerPreferences) => {
    if (!customer) return;
    try {
      const res = await fetch(`/api/customer/${customer.id}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      setCustomer(data);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  // Chat message submission
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id || 'cust_alex_01',
          message: text,
          conversationId,
        }),
      });

      const data: ChatApiResponse = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString(),
        recommendations: data.recommendations,
        sources: data.sources,
        toolCalls: data.toolCalls,
        groundingTag: data.groundingTag,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat request error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting to the barista server. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setConversationId(`conv_${customer?.id || 'guest'}_${Date.now()}`);
  };

  const handleOpenAssistantWithPrompt = (prompt: string) => {
    setActiveTab('assistant');
    handleSendMessage(prompt);
  };

  const handleAskAIAboutProduct = (product: MenuItem) => {
    setActiveTab('assistant');
    handleSendMessage(`Tell me more about ${product.name}. How is it brewed and what are its flavor notes?`);
  };

  const handleAskAIAboutOrder = (order: Order) => {
    setActiveTab('assistant');
    handleSendMessage(`Recommend something similar to my previous order of ${order.items[0]?.productName || 'coffee'} but with less sweetness.`);
  };

  // Place Quick Order
  const handlePlaceOrder = async (orderPayload: any): Promise<Order | null> => {
    if (!customer) return null;
    try {
      const res = await fetch(`/api/customer/${customer.id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const newOrder: Order = await res.json();
      setOrders((prev) => [newOrder, ...prev]);

      // Refresh customer points
      const updatedCust = await fetch(`/api/customer/${customer.id}`).then((r) => r.json());
      setCustomer(updatedCust);

      return newOrder;
    } catch (err) {
      console.error('Order submission error:', err);
      return null;
    }
  };

  const handleQuickOrderFromCard = (card: RecommendationCard) => {
    const matched = menu.find((m) => m.id === card.productId);
    if (matched) {
      setSelectedProductForQuickOrder(matched);
    }
  };

  const handleSelectProductById = (productId: string) => {
    const matched = menu.find((m) => m.id === productId);
    if (matched) {
      setSelectedProductForDetail(matched);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-800 flex flex-col font-sans selection:bg-[#D4A373]/30 selection:text-stone-900">
      {/* Sticky Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customer={customer}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
      />

      {/* Main View Container */}
      <main className={`flex-1 w-full ${activeTab === 'assistant' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
        {activeTab === 'home' && (
          <HomeView
            customer={customer}
            featuredItems={menu.filter((m) => m.isFeatured)}
            offers={offers}
            stores={stores}
            onOpenAssistantWithPrompt={handleOpenAssistantWithPrompt}
            onSelectProduct={(product) => setSelectedProductForDetail(product)}
            onNavigateToMenu={() => setActiveTab('menu')}
            onQuickOrder={(product) => setSelectedProductForQuickOrder(product)}
          />
        )}

        {activeTab === 'assistant' && (
          <ChatView
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            customer={customer}
            orders={orders}
            menu={menu}
            onQuickOrder={handleQuickOrderFromCard}
            onSelectProductById={handleSelectProductById}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            menu={menu}
            onSelectProduct={(product) => setSelectedProductForDetail(product)}
            onQuickOrder={(product) => setSelectedProductForQuickOrder(product)}
            onAskAIAboutProduct={handleAskAIAboutProduct}
          />
        )}

        {activeTab === 'preferences' && customer && (
          <PreferencesView
            customer={customer}
            allCustomers={allCustomers}
            onSelectCustomer={handleSelectCustomer}
            onSavePreferences={handleSavePreferences}
            onAskAIWithNewPrefs={() => handleOpenAssistantWithPrompt('What coffee do you recommend based on my newly updated preferences?')}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            customer={customer}
            onReorder={(order) => {
              const firstItem = order.items[0];
              const matched = menu.find((m) => m.id === firstItem.productId);
              if (matched) setSelectedProductForQuickOrder(matched);
            }}
            onAskAIAboutOrder={handleAskAIAboutOrder}
            onNavigateToMenu={() => setActiveTab('menu')}
          />
        )}
      </main>

      {/* Footer */}
      {activeTab !== 'assistant' && (
        <footer className="border-t border-stone-200 bg-[#FAF9F6] py-5 mt-10 text-center text-xs text-stone-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">CoffeeAI</span>
              <span>• Intelligent Customer-Facing Agent</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-stone-400">
              <span className="font-semibold text-[#6F4E37]">Cloud Run Ready</span>
              <span>•</span>
              <span>RAG Grounded</span>
              <span>•</span>
              <span>ADK Tools</span>
            </div>
          </div>
        </footer>
      )}

      {/* Modals & Overlays */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onQuickOrder={(product) => setSelectedProductForQuickOrder(product)}
          onAskAIAboutProduct={handleAskAIAboutProduct}
        />
      )}

      {selectedProductForQuickOrder && (
        <QuickOrderModal
          product={selectedProductForQuickOrder}
          customer={customer}
          stores={stores}
          onClose={() => setSelectedProductForQuickOrder(null)}
          onSubmitOrder={handlePlaceOrder}
        />
      )}

      {isTestSuiteOpen && (
        <TestScenariosModal
          onClose={() => setIsTestSuiteOpen(false)}
          onRunTestInChat={handleOpenAssistantWithPrompt}
          customerId={customer?.id || 'cust_alex_01'}
        />
      )}

      {isProfileSwitcherOpen && (
        <ProfileSwitcherModal
          currentCustomer={customer}
          allCustomers={allCustomers}
          onSelectCustomer={handleSelectCustomer}
          onClose={() => setIsProfileSwitcherOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
