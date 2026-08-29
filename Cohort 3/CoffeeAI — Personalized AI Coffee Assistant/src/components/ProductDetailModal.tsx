import React from 'react';
import { X, Coffee, Zap, Sparkles, ShieldCheck, Flame, Droplet } from 'lucide-react';
import { MenuItem } from '../types';

interface ProductDetailModalProps {
  product: MenuItem | null;
  onClose: () => void;
  onQuickOrder: (product: MenuItem) => void;
  onAskAIAboutProduct: (product: MenuItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onQuickOrder,
  onAskAIAboutProduct,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#EADCC9] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Image Header */}
        <div className="relative h-56 bg-[#F3ECE0]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 text-xs font-bold bg-[#2C1810]/80 backdrop-blur-md text-white rounded-xl">
              {product.category}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-white/90 text-[#2C1810] rounded-xl">
              {product.temperature}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-[#2C1810]">{product.name}</h2>
              <span className="font-bold text-lg text-[#C67D3B]">${product.basePrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-[#6B5344] mt-1.5 leading-relaxed">{product.description}</p>
          </div>

          {/* Size & Pricing Table */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#2C1810]">Sizes & Pricing</label>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes.map((sz, i) => (
                <div key={i} className="p-2.5 bg-[#FAF6F0] rounded-xl border border-[#EADCC9] text-center">
                  <p className="text-[11px] font-bold text-[#2C1810]">{sz.name}</p>
                  <p className="text-xs font-extrabold text-[#C67D3B] mt-0.5">${sz.price.toFixed(2)}</p>
                  {sz.caffeineMg ? <p className="text-[9px] text-[#7A6253]">{sz.caffeineMg}mg caf</p> : null}
                </div>
              ))}
            </div>
          </div>

          {/* Caffeine & Sweetness Metric */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF6F0] rounded-2xl border border-[#EADCC9] text-xs">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#C67D3B]" />
              <div>
                <span className="text-[#7A6253] block text-[10px]">Caffeine Content</span>
                <span className="font-bold text-[#2C1810]">{product.caffeineMg} mg ({product.caffeineLevel})</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-[#C67D3B]" />
              <div>
                <span className="text-[#7A6253] block text-[10px]">Default Sweetness</span>
                <span className="font-bold text-[#2C1810]">{product.sweetnessLevel} ({product.defaultSweetnessPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Flavor Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2C1810]">Flavor Profile & Notes</label>
            <div className="flex flex-wrap gap-1.5">
              {product.flavorNotes.map((n, i) => (
                <span key={i} className="px-2.5 py-1 text-xs bg-[#F5EBE1] text-[#8C532B] font-medium rounded-lg">
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2C1810]">Ingredients & Sourcing</label>
            <p className="text-xs text-[#6B5344] bg-[#FAF8F5] p-3 rounded-xl border border-[#EADCC9]">
              {product.ingredients.join(', ')}
            </p>
          </div>

          {/* Dietary Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.dietaryTags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 text-[10px] font-semibold bg-[#588157]/15 text-[#386641] rounded-lg">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#FAF6F0] border-t border-[#EADCC9] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onAskAIAboutProduct(product);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8C532B] hover:bg-[#EADCC9]/50 border border-[#EADCC9] flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C67D3B]" />
            <span>Ask AI Questions</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onQuickOrder(product);
            }}
            className="px-5 py-2.5 bg-[#2C1810] hover:bg-[#C67D3B] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <span>Customize & Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
