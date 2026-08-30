import React from 'react';
import { 
  Building2, 
  Trophy, 
  Bike, 
  Store, 
  ShieldCheck, 
  BarChart3, 
  TrendingUp 
} from 'lucide-react';
import { CandidateLocation, ExistingStore } from '../types.js';

interface KeyMetricsBarProps {
  candidates: CandidateLocation[];
  existingStores: ExistingStore[];
}

export const KeyMetricsBar: React.FC<KeyMetricsBarProps> = ({
  candidates,
  existingStores
}) => {
  if (!candidates.length) return null;

  const topCandidate = candidates[0];
  const avgScore = Math.round(
    candidates.reduce((acc, c) => acc + c.overallScore, 0) / candidates.length
  );
  
  const bestCycling = [...candidates].sort((a, b) => b.cyclingScore - a.cyclingScore)[0];
  const nonCannibalizedCount = candidates.filter(c => c.existingStoresWithin1km === 0).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
      
      {/* Metric 1: Candidates Analyzed */}
      <div className="bg-white border border-[#DADCE0] rounded-lg p-3 shadow-xs hover:border-[#4285F4] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5F6368] uppercase">Candidates</span>
          <Building2 className="w-3.5 h-3.5 text-[#4285F4]" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-2xl font-semibold text-[#202124]">{candidates.length}</span>
          <span className="text-xs text-[#70757A]">parcels</span>
        </div>
        <p className="text-[10px] text-[#137333] font-medium mt-0.5 truncate">↑ Filtered via BigQuery</p>
      </div>

      {/* Metric 2: Top Score */}
      <div className="bg-white border border-[#DADCE0] rounded-lg p-3 shadow-xs hover:border-[#4285F4] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5F6368] uppercase">Top Score</span>
          <Trophy className="w-3.5 h-3.5 text-[#F9AB00]" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-2xl font-semibold text-[#1967D2]">{topCandidate.overallScore}</span>
          <span className="text-xs text-[#70757A]">/ 100</span>
        </div>
        <p className="text-[10px] text-[#70757A] mt-0.5 truncate">{topCandidate.area}</p>
      </div>

      {/* Metric 3: Average Candidate Score */}
      <div className="bg-white border border-[#DADCE0] rounded-lg p-3 shadow-xs hover:border-[#4285F4] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5F6368] uppercase">Mean Score</span>
          <BarChart3 className="w-3.5 h-3.5 text-[#1A73E8]" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-2xl font-semibold text-[#202124]">{avgScore}</span>
          <span className="text-xs text-[#70757A]">/ 100</span>
        </div>
        <p className="text-[10px] text-[#70757A] mt-0.5 truncate">Normalized Index</p>
      </div>

      {/* Metric 4: Best Cycling Proximity */}
      <div className="bg-white border border-[#DADCE0] rounded-lg p-3 shadow-xs hover:border-[#4285F4] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5F6368] uppercase">Top Cycling</span>
          <Bike className="w-3.5 h-3.5 text-[#34A853]" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-2xl font-semibold text-[#137333]">{bestCycling.cyclingScore}</span>
          <span className="text-xs text-[#70757A]">pts</span>
        </div>
        <p className="text-[10px] text-[#70757A] mt-0.5 truncate">{bestCycling.nearestBikeRouteDistMeters}m to route</p>
      </div>

      {/* Metric 5: Existing Stores */}
      <div className="bg-white border border-[#DADCE0] rounded-lg p-3 shadow-xs hover:border-[#4285F4] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5F6368] uppercase">Current Chain</span>
          <Store className="w-3.5 h-3.5 text-[#E37400]" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-2xl font-semibold text-[#202124]">{existingStores.length}</span>
          <span className="text-xs text-[#70757A]">stores</span>
        </div>
        <p className="text-[10px] text-[#70757A] mt-0.5 truncate">London Operational</p>
      </div>

      {/* Metric 6: Zero Cannibalization Ratio */}
      <div className="bg-white border border-[#DADCE0] rounded-lg p-3 shadow-xs hover:border-[#4285F4] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#5F6368] uppercase">Zero Cannibalization</span>
          <ShieldCheck className="w-3.5 h-3.5 text-[#129EAF]" />
        </div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-2xl font-semibold text-[#1967D2]">{nonCannibalizedCount}</span>
          <span className="text-xs text-[#70757A]">/ {candidates.length}</span>
        </div>
        <p className="text-[10px] text-[#1967D2] font-medium mt-0.5 truncate">&gt; 1.0 km buffer</p>
      </div>

    </div>
  );
};
