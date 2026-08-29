import React, { useState, useEffect } from 'react';
import { Sliders, User, Check, Sparkles, Heart, Coffee, ShieldCheck, RefreshCw } from 'lucide-react';
import { CustomerProfile, CustomerPreferences } from '../types';

interface PreferencesViewProps {
  customer: CustomerProfile;
  allCustomers: CustomerProfile[];
  onSelectCustomer: (customerId: string) => void;
  onSavePreferences: (updated: CustomerPreferences) => Promise<void>;
  onAskAIWithNewPrefs: () => void;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  customer,
  allCustomers,
  onSelectCustomer,
  onSavePreferences,
  onAskAIWithNewPrefs,
}) => {
  const [formData, setFormData] = useState<CustomerPreferences>(customer.preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(customer.preferences);
  }, [customer]);

  const milkOptions = ['Oat Milk', 'Almond Milk', 'Whole Milk', 'Skim Milk', 'Soy Milk', 'Coconut Milk', 'None'];
  const tempOptions = ['Cold', 'Hot', 'Both'];
  const dietaryOptions = ['Dairy-Free', 'Vegan', 'Gluten-Free', 'Keto-Friendly', 'Organic', 'Low-Sugar', 'Nut-Free'];
  const categoryOptions = ['Cold Brew', 'Espresso & Milk', 'Specialty & Seasonal', 'Pour-Over & Single Origin', 'Teas & Botanicals', 'Decaf & Low-Caffeine', 'Bakery & Bites'];

  const handleSweetnessSlider = (val: number) => {
    let level = 'Unsweetened';
    if (val > 0 && val <= 25) level = 'Low';
    else if (val > 25 && val <= 50) level = 'Low-Medium';
    else if (val > 50 && val <= 75) level = 'Medium';
    else if (val > 75) level = 'Sweet';

    setFormData((prev) => ({
      ...prev,
      sweetnessPercent: val,
      sweetnessLevel: level,
    }));
  };

  const toggleDietary = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.dietaryPreferences.includes(tag);
      return {
        ...prev,
        dietaryPreferences: exists
          ? prev.dietaryPreferences.filter((t) => t !== tag)
          : [...prev.dietaryPreferences, tag],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSavePreferences(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header & Profile Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#EADCC9] shadow-xs">
        <div className="flex items-center space-x-4">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[#C67D3B]/20"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2C1810]">{customer.name}</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#C67D3B]/10 text-[#8C532B] rounded-full border border-[#C67D3B]/30">
                {customer.membershipTier}
              </span>
            </div>
            <p className="text-xs text-[#7A6253] mt-0.5">
              {customer.email} • <strong>{customer.loyaltyPoints} Rewards Points</strong>
            </p>
          </div>
        </div>

        {/* Multi-Customer Demo Switcher */}
        <div className="space-y-1 sm:text-right">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C532B] block">
            Demo Customer Profile:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCustomer(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  c.id === customer.id
                    ? 'bg-[#2C1810] text-white shadow-xs'
                    : 'bg-[#FAF6F0] text-[#6B5344] border border-[#EADCC9] hover:bg-[#F3ECE0]'
                }`}
              >
                {c.name.split(' ')[0]} {c.id === 'cust_alex_01' ? '(Default Demo)' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Taste Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADCC9] shadow-xs space-y-8">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#C67D3B]" />
            <h2 className="text-lg font-serif font-bold text-[#2C1810]">Personalized AI Taste Calibration</h2>
          </div>
          <p className="text-xs text-[#7A6253] mt-0.5">
            The CoffeeAI Agent directly queries this profile during RAG retrieval to ground and filter beverage recommendations.
          </p>
        </div>

        {/* Temperature Preference */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#2C1810] flex items-center space-x-1.5">
            <span>Preferred Beverage Temperature</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
            {tempOptions.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setFormData((prev) => ({ ...prev, preferredTemperature: t }))}
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all ${
                  formData.preferredTemperature === t
                    ? 'bg-[#2C1810] text-white border-[#2C1810] shadow-xs'
                    : 'bg-[#FAF6F0] text-[#6B5344] border-[#EADCC9] hover:bg-[#F3ECE0]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Sweetness Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#2C1810]">
              Sweetness Preference: <span className="text-[#C67D3B]">{formData.sweetnessLevel} ({formData.sweetnessPercent}%)</span>
            </label>
            <span className="text-[11px] text-[#7A6253]">0% = Pure Unsweetened</span>
          </div>

          <input
            id="sweetness-range-slider"
            type="range"
            min="0"
            max="100"
            step="25"
            value={formData.sweetnessPercent}
            onChange={(e) => handleSweetnessSlider(Number(e.target.value))}
            className="w-full accent-[#C67D3B] h-2 bg-[#F3ECE0] rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-[#7A6253] font-medium px-1">
            <span>0% (Unsweetened)</span>
            <span>25% (Quarter)</span>
            <span>50% (Half)</span>
            <span>75% (Medium)</span>
            <span>100% (Full Sweet)</span>
          </div>
        </div>

        {/* Milk Choice */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#2C1810]">
            Preferred Milk / Plant-Based Choice
          </label>
          <div className="flex flex-wrap gap-2">
            {milkOptions.map((milk) => (
              <button
                type="button"
                key={milk}
                onClick={() => setFormData((prev) => ({ ...prev, milkPreference: milk }))}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                  formData.milkPreference === milk
                    ? 'bg-[#8C532B] text-white border-[#8C532B] shadow-xs'
                    : 'bg-[#FAF6F0] text-[#6B5344] border-[#EADCC9] hover:bg-[#F3ECE0]'
                }`}
              >
                {milk}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#2C1810]">
            Dietary Preferences & Allergens
          </label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((tag) => {
              const selected = formData.dietaryPreferences.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleDietary(tag)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                    selected
                      ? 'bg-[#588157] text-white border-[#588157] shadow-xs'
                      : 'bg-[#FAF6F0] text-[#6B5344] border-[#EADCC9] hover:bg-[#F3ECE0]'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorite Category */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#2C1810]">
            Favorite Coffee Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoryOptions.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setFormData((prev) => ({ ...prev, favoriteCategory: cat }))}
                className={`p-2.5 rounded-2xl text-xs font-semibold border text-left truncate transition-all ${
                  formData.favoriteCategory === cat
                    ? 'bg-[#2C1810] text-white border-[#2C1810] shadow-xs'
                    : 'bg-[#FAF6F0] text-[#6B5344] border-[#EADCC9] hover:bg-[#F3ECE0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Barista Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#2C1810]">
            Special Notes for Barista & AI Assistant
          </label>
          <textarea
            rows={2}
            value={formData.notes || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="e.g., Extra ice, prefers African single origin beans, light foam..."
            className="w-full p-3.5 bg-[#FAF8F5] border border-[#EADCC9] rounded-2xl text-xs sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C67D3B]/40 focus:border-[#C67D3B]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#F3ECE0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-[#2C1810] hover:bg-[#C67D3B] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSaving ? 'Saving Profile...' : 'Save & Sync Preferences'}</span>
            </button>

            {savedSuccess && (
              <span className="text-xs font-bold text-[#588157] flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Synchronized with AI agent!</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onAskAIWithNewPrefs}
            className="px-4 py-3 bg-[#C67D3B]/10 hover:bg-[#C67D3B]/20 text-[#8C532B] text-xs font-semibold rounded-2xl border border-[#C67D3B]/30 flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C67D3B]" />
            <span>Test Recommendation in AI Chat</span>
          </button>
        </div>
      </form>
    </div>
  );
};
