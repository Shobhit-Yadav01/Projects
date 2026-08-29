import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, Coffee, Check, ShoppingBag, X, Zap, Heart } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuViewProps {
  menu: MenuItem[];
  onSelectProduct: (product: MenuItem) => void;
  onQuickOrder: (product: MenuItem) => void;
  onAskAIAboutProduct: (product: MenuItem) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  menu,
  onSelectProduct,
  onQuickOrder,
  onAskAIAboutProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemp, setSelectedTemp] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<string>('All');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  const categories = [
    'All',
    'Cold Brew',
    'Espresso & Milk',
    'Specialty & Seasonal',
    'Pour-Over & Single Origin',
    'Teas & Botanicals',
    'Decaf & Low-Caffeine',
    'Bakery & Bites',
  ];

  const dietaryOptions = ['All', 'Vegan', 'Dairy-Free', 'Gluten-Free', 'Keto-Friendly', 'Sugar-Free'];
  const tempOptions = ['All', 'Cold', 'Hot'];

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesNotes = item.flavorNotes.some((n) => n.toLowerCase().includes(q));
        const matchesIngredients = item.ingredients.some((i) => i.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesNotes && !matchesIngredients) {
          return false;
        }
      }

      // Temperature filter
      if (selectedTemp !== 'All') {
        if (item.temperature !== selectedTemp && item.temperature !== 'Both') {
          return false;
        }
      }

      // Dietary filter
      if (selectedDietary !== 'All') {
        if (!item.dietaryTags.some((t) => t.toLowerCase() === selectedDietary.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [menu, selectedCategory, searchQuery, selectedTemp, selectedDietary]);

  const activeFilterCount = (selectedTemp !== 'All' ? 1 : 0) + (selectedDietary !== 'All' ? 1 : 0);

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Our Roastery Menu</h1>
          <p className="text-xs text-stone-500">Ethically sourced beans, handcrafted brews, and fresh daily bakery</p>
        </div>

        {/* Search input & filter trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="menu-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drinks, notes, ingredients..."
              className="w-full pl-8 pr-7 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#6F4E37] focus:border-[#6F4E37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-colors ${
              activeFilterCount > 0
                ? 'bg-[#6F4E37] text-white border-[#6F4E37]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#6F4E37] text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#6F4E37] text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expandable Filter Tray */}
      {showFilterDrawer && (
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-stone-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900">Refine Menu Selection</span>
            <button
              onClick={() => {
                setSelectedTemp('All');
                setSelectedDietary('All');
              }}
              className="text-[11px] text-[#6F4E37] font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Temperature Filter */}
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Temperature</label>
              <div className="flex flex-wrap gap-1">
                {tempOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTemp(t)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border ${
                      selectedTemp === t
                        ? 'bg-[#6F4E37] text-white border-[#6F4E37]'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Tags Filter */}
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Dietary & Allergen</label>
              <div className="flex flex-wrap gap-1">
                {dietaryOptions.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDietary(d)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border ${
                      selectedDietary === d
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Cards Grid */}
      {filteredMenu.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-stone-200 p-6 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
            <Coffee className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">No menu items match your criteria</h3>
          <p className="text-xs text-stone-500">Try clearing some search terms or filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedTemp('All');
              setSelectedDietary('All');
            }}
            className="px-3 py-1.5 bg-[#6F4E37] text-white text-xs font-bold rounded-lg"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              {/* Product Header & Image */}
              <div>
                <div className="relative h-40 overflow-hidden bg-stone-100">
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
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-stone-800 rounded shadow-2xs">
                      {product.temperature}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 bg-white px-2 py-0.5 rounded shadow-2xs text-xs font-bold text-stone-900">
                    From ${product.basePrice.toFixed(2)}
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-3.5 space-y-2">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 group-hover:text-[#6F4E37] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Flavor Notes & Caffeine Badge */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {product.flavorNotes.map((note, i) => (
                        <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                          {note}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#6F4E37]" />
                        <span>Caffeine: {product.caffeineMg}mg</span>
                      </span>
                      <span>Sweetness: {product.sweetnessLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 pt-0">
                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onAskAIAboutProduct(product)}
                    title="Ask CoffeeAI Barista about this item"
                    className="p-1.5 rounded-lg text-[#6F4E37] hover:bg-stone-100 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700"
                    >
                      Specs
                    </button>
                    <button
                      onClick={() => onQuickOrder(product)}
                      className="px-3 py-1.5 rounded-lg bg-[#6F4E37] hover:bg-[#5C3F2C] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
