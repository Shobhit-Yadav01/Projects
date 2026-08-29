import React from 'react';
import { X, Check, User, Sparkles } from 'lucide-react';
import { CustomerProfile } from '../types';

interface ProfileSwitcherModalProps {
  currentCustomer: CustomerProfile | null;
  allCustomers: CustomerProfile[];
  onSelectCustomer: (customerId: string) => void;
  onClose: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  currentCustomer,
  allCustomers,
  onSelectCustomer,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#EADCC9] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#FAF6F0] p-5 border-b border-[#EADCC9] flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-base text-[#2C1810]">Switch Customer Profile</h2>
            <p className="text-[11px] text-[#7A6253]">Test how CoffeeAI adapts its personalized RAG reasoning</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#EADCC9]/50 hover:bg-[#EADCC9] flex items-center justify-center text-[#2C1810]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {allCustomers.map((cust) => {
            const isSelected = currentCustomer?.id === cust.id;
            return (
              <button
                key={cust.id}
                onClick={() => {
                  onSelectCustomer(cust.id);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-start space-x-3.5 transition-all ${
                  isSelected
                    ? 'bg-[#FAF6F0] border-[#C67D3B] ring-2 ring-[#C67D3B]/20 shadow-xs'
                    : 'bg-white border-[#EADCC9] hover:bg-[#FAF8F5]'
                }`}
              >
                <img
                  src={cust.avatar}
                  alt={cust.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#EADCC9]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#2C1810]">{cust.name}</h3>
                    <span className="text-[10px] font-bold text-[#8C532B] bg-[#C67D3B]/10 px-2 py-0.5 rounded-full">
                      {cust.membershipTier}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6253] mt-0.5">
                    {cust.preferences.preferredTemperature} • {cust.preferences.milkPreference} • {cust.preferences.sweetnessLevel} sweetness
                  </p>
                  <p className="text-[10px] text-[#588157] font-semibold mt-1">
                    Favorite: {cust.preferences.favoriteCategory}
                  </p>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#C67D3B] shrink-0 self-center" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
