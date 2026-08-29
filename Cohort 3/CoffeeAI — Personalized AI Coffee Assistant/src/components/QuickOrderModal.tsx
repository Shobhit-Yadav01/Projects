import React, { useState } from 'react';
import { X, Check, ShoppingBag, Coffee, Sparkles, MapPin } from 'lucide-react';
import { CustomerProfile, MenuItem, StoreLocation, Order } from '../types';

interface QuickOrderModalProps {
  product: MenuItem | null;
  customer: CustomerProfile | null;
  stores: StoreLocation[];
  onClose: () => void;
  onSubmitOrder: (orderPayload: any) => Promise<Order | null>;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  product,
  customer,
  stores,
  onClose,
  onSubmitOrder,
}) => {
  if (!product) return null;

  const defaultSize = product.sizes.find((s) => s.name === 'Medium') || product.sizes[0];
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedMilk, setSelectedMilk] = useState(customer?.preferences.milkPreference || 'Oat Milk');
  const [selectedSweetness, setSelectedSweetness] = useState(customer?.preferences.sweetnessLevel || 'Low');
  const [selectedIce, setSelectedIce] = useState('Regular Ice');
  const [selectedStore, setSelectedStore] = useState(stores[0]?.id || 'store_downtown_01');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const milkOptions = ['Oat Milk (+$0.75)', 'Almond Milk (+$0.75)', 'Whole Milk', 'Skim Milk', 'Soy Milk (+$0.75)', 'None / Black'];
  const sweetnessOptions = ['0% Unsweetened', '25% Quarter Sweet', '50% Half Sweet', '100% Full Sweet'];
  const iceOptions = ['Regular Ice', 'Light Ice', 'Extra Ice', 'No Ice'];

  const getMilkExtra = () => (selectedMilk.includes('+$0.75') ? 0.75 : 0);
  const unitPrice = selectedSize.price + getMilkExtra();
  const totalPrice = unitPrice * quantity;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const storeObj = stores.find((s) => s.id === selectedStore) || stores[0];
      const payload = {
        storeId: storeObj.id,
        storeName: storeObj.name,
        items: [
          {
            productId: product.id,
            productName: product.name,
            size: selectedSize.name,
            unitPrice: unitPrice,
            quantity: quantity,
            itemTotal: totalPrice,
            customizations: {
              milk: selectedMilk.split(' (')[0],
              sweetness: selectedSweetness,
              ice: product.temperature.toLowerCase().includes('cold') ? selectedIce : 'Hot',
            },
          },
        ],
      };

      const order = await onSubmitOrder(payload);
      if (order) {
        setCompletedOrder(order);
      }
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#EADCC9] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#FAF6F0] p-5 border-b border-[#EADCC9] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C1810] text-[#D4A373] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2C1810]">
                {completedOrder ? 'Order Confirmed!' : `Quick Order: ${product.name}`}
              </h2>
              <p className="text-[11px] text-[#7A6253]">
                {completedOrder ? 'Brewing right now' : `Pre-calibrated to ${customer?.name || 'your'} profile`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#EADCC9]/50 hover:bg-[#EADCC9] flex items-center justify-center text-[#2C1810]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Completed State */}
        {completedOrder ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#588157]/15 text-[#386641] flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-[#2C1810]">Thank you, {customer?.name || 'Coffee Lover'}!</h3>
              <p className="text-xs text-[#6B5344]">
                Order <strong className="font-mono text-[#2C1810]">{completedOrder.orderNumber}</strong> has been sent to our barista team at <strong>{completedOrder.storeName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EADCC9] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A6253]">Drink:</span>
                <span className="font-bold text-[#2C1810]">{product.name} ({selectedSize.name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6253]">Customizations:</span>
                <span className="font-medium text-[#2C1810]">{selectedMilk.split(' (')[0]} • {selectedSweetness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6253]">Total Paid:</span>
                <span className="font-bold text-[#2C1810]">${completedOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#C67D3B] font-bold pt-1 border-t border-[#EADCC9]">
                <span>Points Earned:</span>
                <span>+{completedOrder.pointsEarned} Points</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#2C1810] text-white text-xs font-bold rounded-2xl shadow-xs"
            >
              Done & Return to App
            </button>
          </div>
        ) : (
          /* Customization Form */
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Size Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1810]">Select Size</label>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((sz, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(sz)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      selectedSize.name === sz.name
                        ? 'bg-[#2C1810] text-white border-[#2C1810]'
                        : 'bg-[#FAF6F0] text-[#6B5344] border-[#EADCC9]'
                    }`}
                  >
                    <p className="text-xs font-bold">{sz.name}</p>
                    <p className="text-[11px] mt-0.5">${sz.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Milk Option */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1810]">Milk Preference</label>
              <select
                value={selectedMilk}
                onChange={(e) => setSelectedMilk(e.target.value)}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADCC9] rounded-xl text-xs text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C67D3B]/40"
              >
                {milkOptions.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Sweetness */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1810]">Sweetness Level</label>
              <div className="grid grid-cols-2 gap-1.5">
                {sweetnessOptions.map((sw, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSweetness(sw)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left truncate ${
                      selectedSweetness === sw
                        ? 'bg-[#8C532B] text-white border-[#8C532B]'
                        : 'bg-[#FAF6F0] text-[#6B5344] border-[#EADCC9]'
                    }`}
                  >
                    {sw}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Pickup Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1810] flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#C67D3B]" />
                <span>Pickup Roastery</span>
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADCC9] rounded-xl text-xs text-[#2C1810] focus:outline-none"
              >
                {stores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} (~{st.currentWaitMinutes} min wait)
                  </option>
                ))}
              </select>
            </div>

            {/* Total & Submit Button */}
            <div className="pt-3 border-t border-[#F3ECE0] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#2C1810]">
                <span>Order Total:</span>
                <span className="font-serif text-lg text-[#C67D3B]">${totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3 bg-[#2C1810] hover:bg-[#C67D3B] text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Coffee className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending to Barista...' : 'Confirm & Place Order'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
