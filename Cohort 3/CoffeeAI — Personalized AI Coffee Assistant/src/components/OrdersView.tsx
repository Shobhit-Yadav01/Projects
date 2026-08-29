import React from 'react';
import { ShoppingBag, Clock, MapPin, Sparkles, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { Order, CustomerProfile } from '../types';

interface OrdersViewProps {
  orders: Order[];
  customer: CustomerProfile | null;
  onReorder: (order: Order) => void;
  onAskAIAboutOrder: (order: Order) => void;
  onNavigateToMenu: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  customer,
  onReorder,
  onAskAIAboutOrder,
  onNavigateToMenu,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADCC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-[#C67D3B]" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2C1810]">Order History</h1>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6253] mt-1">
            Orders for <strong>{customer?.name || 'Customer'}</strong> • Memory grounded in your past favorites
          </p>
        </div>

        <button
          onClick={() => onAskAIAboutOrder(orders[0])}
          disabled={orders.length === 0}
          className="px-4 py-2.5 bg-[#C67D3B]/10 hover:bg-[#C67D3B]/20 text-[#8C532B] rounded-2xl text-xs font-semibold border border-[#C67D3B]/30 flex items-center space-x-2 transition-all w-fit"
        >
          <Sparkles className="w-4 h-4 text-[#C67D3B]" />
          <span>Ask AI: "What did I order last time?"</span>
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#EADCC9] p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A08878] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#2C1810] text-sm">No past orders found</h3>
          <p className="text-xs text-[#7A6253]">Place your first coffee order or ask CoffeeAI for recommendations.</p>
          <button
            onClick={onNavigateToMenu}
            className="px-4 py-2 bg-[#2C1810] text-white text-xs font-semibold rounded-xl"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#EADCC9] p-6 shadow-2xs space-y-4 hover:shadow-xs transition-all"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F3ECE0]">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs bg-[#FAF6F0] px-2.5 py-1 rounded-xl text-[#2C1810] border border-[#EADCC9]">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-[#7A6253] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#588157]/15 text-[#386641] flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{order.status}</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#C67D3B]">
                    +{order.pointsEarned} pts
                  </span>
                </div>
              </div>

              {/* Store Name */}
              <div className="text-xs text-[#6B5344] flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C67D3B]" />
                <span>{order.storeName}</span>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs py-1">
                    <div>
                      <div className="font-bold text-[#2C1810]">
                        {item.quantity}x {item.productName} <span className="font-normal text-[#7A6253]">({item.size})</span>
                      </div>
                      {item.customizations && (
                        <div className="text-[11px] text-[#7A6253] space-x-2 mt-0.5">
                          {item.customizations.milk && <span>• {item.customizations.milk}</span>}
                          {item.customizations.sweetness && <span>• {item.customizations.sweetness}</span>}
                          {item.customizations.ice && <span>• {item.customizations.ice}</span>}
                          {item.customizations.extra && <span>• {item.customizations.extra}</span>}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-[#2C1810]">${item.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total & Actions */}
              <div className="pt-3 border-t border-[#F3ECE0] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-[#7A6253]">Total: </span>
                  <span className="font-serif font-bold text-base text-[#2C1810]">${order.total.toFixed(2)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAskAIAboutOrder(order)}
                    className="px-3 py-1.5 rounded-xl border border-[#EADCC9] hover:bg-[#FAF6F0] text-xs font-semibold text-[#8C532B] flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#C67D3B]" />
                    <span>Ask AI for Similar</span>
                  </button>
                  <button
                    onClick={() => onReorder(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2C1810] hover:bg-[#C67D3B] text-white text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
