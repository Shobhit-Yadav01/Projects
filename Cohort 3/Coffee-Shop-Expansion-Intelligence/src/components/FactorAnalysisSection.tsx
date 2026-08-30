import React from 'react';
import { 
  Sliders, 
  Bike, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  RotateCcw, 
  Info,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { CandidateLocation, ScoringWeights } from '../types.js';

interface FactorAnalysisSectionProps {
  weights: ScoringWeights;
  onWeightsChange: (newWeights: ScoringWeights) => void;
  selectedCandidate: CandidateLocation;
}

export const FactorAnalysisSection: React.FC<FactorAnalysisSectionProps> = ({
  weights,
  onWeightsChange,
  selectedCandidate
}) => {
  const handleSliderChange = (key: keyof ScoringWeights, val: number) => {
    onWeightsChange({
      ...weights,
      [key]: val
    });
  };

  const handleResetDefaults = () => {
    onWeightsChange({
      cyclingAccessibility: 0.35,
      customerDemand: 0.25,
      storeSaturation: 0.20,
      revenuePotential: 0.20
    });
  };

  const factors = [
    {
      key: 'cyclingAccessibility' as keyof ScoringWeights,
      label: 'Cycling Accessibility',
      weight: weights.cyclingAccessibility,
      score: selectedCandidate.cyclingScore,
      icon: <Bike className="w-3.5 h-3.5 text-[#137333]" />,
      color: 'emerald',
      rawText: `${selectedCandidate.nearestBikeRouteDistMeters}m to ${selectedCandidate.nearestBikeRouteName} (~${selectedCandidate.dailyCyclistVolumeEstimate.toLocaleString()} riders/day)`,
      desc: 'Proximity to high-capacity segregated cycle superhighways and quietways.'
    },
    {
      key: 'customerDemand' as keyof ScoringWeights,
      label: 'Foot Traffic Demand',
      weight: weights.customerDemand,
      score: selectedCandidate.demandScore,
      icon: <Users className="w-3.5 h-3.5 text-[#1967D2]" />,
      color: 'sky',
      rawText: `${selectedCandidate.avgFootTrafficPerHour} ped/hr, ~${selectedCandidate.estimatedMonthlyOrders.toLocaleString()} monthly orders`,
      desc: 'Pedestrian commuter density and local residential/office density.'
    },
    {
      key: 'storeSaturation' as keyof ScoringWeights,
      label: 'Store Buffer Isolation',
      weight: weights.storeSaturation,
      score: selectedCandidate.saturationScore,
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#129EAF]" />,
      color: 'teal',
      rawText: `${selectedCandidate.existingStoresWithin1km} stores within 1km (nearest: ${selectedCandidate.nearestExistingStoreDistKm}km)`,
      desc: 'Rewards locations outside the cannibalization radius of existing company shops.'
    },
    {
      key: 'revenuePotential' as keyof ScoringWeights,
      label: 'Revenue Potential',
      weight: weights.revenuePotential,
      score: selectedCandidate.revenuePotentialScore,
      icon: <TrendingUp className="w-3.5 h-3.5 text-[#F9AB00]" />,
      color: 'amber',
      rawText: `£${selectedCandidate.estimatedMonthlyRevenue.toLocaleString()}/mo gross (Rent Index: ${selectedCandidate.commercialRentIndex}/100)`,
      desc: 'Projected gross turnover weighted against regional commercial lease expenditure.'
    }
  ];

  return (
    <div className="bg-white border border-[#DADCE0] rounded-lg p-4 shadow-xs my-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DADCE0]">
        <div>
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#4285F4]" />
            <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              Transparent Decision Weights & Factor Analysis
            </h3>
          </div>
          <p className="text-[11px] text-[#70757A] mt-0.5">
            Adjust factor weights to simulate strategic priorities in real-time
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-[#4285F4]" />
          <span>Reset to AI Defaults</span>
        </button>
      </div>

      {/* 4 Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
        {factors.map((f) => {
          const pct = Math.round(f.weight * 100);
          return (
            <div key={f.key} className="bg-[#F8F9FA] border border-[#DADCE0] rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  {f.icon}
                  <span className="text-xs font-bold text-[#202124]">{f.label}</span>
                </div>
                <span className="text-xs font-bold text-[#1967D2] bg-[#E8F0FE] border border-[#D2E3FC] px-1.5 py-0.5 rounded">
                  {pct}%
                </span>
              </div>

              <input
                type="range"
                min="0.05"
                max="0.70"
                step="0.05"
                value={f.weight}
                onChange={(e) => handleSliderChange(f.key, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#DADCE0] rounded-lg appearance-none cursor-pointer accent-[#4285F4] my-2"
              />

              <div className="mt-1 text-[11px] text-[#5F6368] leading-tight">
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Location Factor Breakdown */}
      <div className="mt-4 pt-3 border-t border-[#DADCE0]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
            Factor Breakdown for: <strong className="text-[#202124] normal-case">{selectedCandidate.name}</strong>
          </span>
          <span className="text-xs text-[#1967D2] font-bold">
            Overall Score: {selectedCandidate.overallScore} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {factors.map((f) => {
            const weightedContrib = Math.round(f.score * f.weight);
            return (
              <div key={f.key} className="bg-white border border-[#DADCE0] rounded-md p-2.5 text-xs">
                <div className="flex items-center justify-between text-[#3C4043] font-semibold text-xs">
                  <span>{f.label}</span>
                  <span className="text-[#202124] font-bold">{f.score}/100</span>
                </div>
                <div className="w-full bg-[#E8EAED] h-1.5 rounded-full overflow-hidden my-1.5">
                  <div 
                    className="h-full bg-[#4285F4] rounded-full" 
                    style={{ width: `${f.score}%` }} 
                  />
                </div>
                <div className="text-[11px] text-[#5F6368] mt-1">
                  <strong>Metric:</strong> {f.rawText}
                </div>
                <div className="text-[10px] text-[#1967D2] mt-1 font-mono">
                  Contrib: {f.score} × {f.weight.toFixed(2)} = +{weightedContrib} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
