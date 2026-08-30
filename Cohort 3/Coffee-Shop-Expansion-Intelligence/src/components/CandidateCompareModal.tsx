import React from 'react';
import { 
  GitCompare, 
  X, 
  Bike, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Trophy
} from 'lucide-react';
import { CandidateLocation } from '../types.js';

interface CandidateCompareModalProps {
  candidates: CandidateLocation[];
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  candidates,
  isOpen,
  onClose
}) => {
  if (!isOpen || !candidates.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#DADCE0] rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#F8F9FA] px-4 py-3 border-b border-[#DADCE0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-[#E8F0FE] border border-[#D2E3FC] flex items-center justify-center">
              <GitCompare className="w-4 h-4 text-[#1967D2]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                Side-by-Side Location Feasibility Comparison
              </h2>
              <p className="text-[11px] text-[#70757A]">
                Comparing {candidates.length} candidate parcels across 4 decision pillars
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#5F6368] hover:text-[#202124] hover:bg-[#E8EAED] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {candidates.map((cand, idx) => {
              const isTop = idx === 0 && cand.status === 'Recommended';
              return (
                <div 
                  key={cand.id}
                  className={`bg-white border rounded-lg p-3.5 flex flex-col justify-between ${
                    isTop ? 'border-[#F9AB00] bg-[#FEF7E0]/15' : 'border-[#DADCE0]'
                  }`}
                >
                  <div>
                    {/* Badge & Rank */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">
                        Rank #{idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isTop ? 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]' : 'bg-[#F1F3F4] text-[#5F6368]'
                      }`}>
                        {cand.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#202124] mb-0.5">{cand.name}</h3>
                    <p className="text-[11px] text-[#70757A] mb-3">{cand.area}, {cand.city}</p>

                    {/* Overall Score */}
                    <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-md p-2 mb-3 text-center">
                      <span className="text-[10px] text-[#5F6368] uppercase tracking-wider block">Viability Score</span>
                      <span className="text-2xl font-black text-[#1967D2]">{cand.overallScore}</span>
                      <span className="text-xs text-[#70757A]"> / 100</span>
                    </div>

                    {/* 4 Pillars Breakdown */}
                    <div className="space-y-2 text-xs">
                      
                      {/* Cycling */}
                      <div className="bg-[#F8F9FA] p-2 rounded border border-[#DADCE0]">
                        <div className="flex items-center justify-between font-semibold text-[#137333] mb-0.5 text-xs">
                          <span className="flex items-center space-x-1">
                            <Bike className="w-3 h-3" />
                            <span>Cycling Access</span>
                          </span>
                          <span className="text-[#202124] font-bold">{cand.cyclingScore}/100</span>
                        </div>
                        <div className="text-[10px] text-[#5F6368]">
                          {cand.nearestBikeRouteDistMeters}m to {cand.nearestBikeRouteName.split(' ')[0]} (~{cand.dailyCyclistVolumeEstimate.toLocaleString()} riders/day)
                        </div>
                      </div>

                      {/* Demand */}
                      <div className="bg-[#F8F9FA] p-2 rounded border border-[#DADCE0]">
                        <div className="flex items-center justify-between font-semibold text-[#1967D2] mb-0.5 text-xs">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>Demand & Traffic</span>
                          </span>
                          <span className="text-[#202124] font-bold">{cand.demandScore}/100</span>
                        </div>
                        <div className="text-[10px] text-[#5F6368]">
                          {cand.avgFootTrafficPerHour} ped/hr (~{cand.estimatedMonthlyOrders.toLocaleString()} orders/mo)
                        </div>
                      </div>

                      {/* Saturation */}
                      <div className="bg-[#F8F9FA] p-2 rounded border border-[#DADCE0]">
                        <div className="flex items-center justify-between font-semibold text-[#129EAF] mb-0.5 text-xs">
                          <span className="flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Non-Cannibalization</span>
                          </span>
                          <span className="text-[#202124] font-bold">{cand.saturationScore}/100</span>
                        </div>
                        <div className="text-[10px] text-[#5F6368]">
                          {cand.existingStoresWithin1km} stores in 1km (buffer: {cand.nearestExistingStoreDistKm}km)
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="bg-[#F8F9FA] p-2 rounded border border-[#DADCE0]">
                        <div className="flex items-center justify-between font-semibold text-[#B06000] mb-0.5 text-xs">
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Revenue Potential</span>
                          </span>
                          <span className="text-[#202124] font-bold">{cand.revenuePotentialScore}/100</span>
                        </div>
                        <div className="text-[10px] text-[#5F6368]">
                          Est. £{(cand.estimatedMonthlyRevenue / 1000).toFixed(1)}k/mo (Rent: {cand.commercialRentIndex}/100)
                        </div>
                      </div>

                    </div>

                    {/* Key Strengths */}
                    <div className="mt-3 pt-2 border-t border-[#DADCE0]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] mb-1">Key Strengths:</div>
                      <ul className="space-y-1 text-[11px] text-[#3C4043]">
                        {cand.keyStrengths.slice(0, 2).map((s, sIdx) => (
                          <li key={sIdx} className="flex items-start space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-[#34A853] flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] px-4 py-2.5 border-t border-[#DADCE0] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-xs font-medium bg-white hover:bg-[#F1F3F4] text-[#3C4043] border border-[#DADCE0] transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
