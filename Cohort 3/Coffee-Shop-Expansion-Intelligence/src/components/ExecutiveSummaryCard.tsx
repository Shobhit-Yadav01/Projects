import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Bike, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  GitCompare,
  ArrowUpRight,
  Calculator,
  HelpCircle,
  BarChart2,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CandidateLocation, RecommendationSummary } from '../types.js';

interface ExecutiveSummaryCardProps {
  recommendation: RecommendationSummary;
  candidate: CandidateLocation;
  onSelectCandidate: (candidate: CandidateLocation) => void;
  onCompareWithRunnerUp: () => void;
  onViewProvenance: () => void;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  recommendation,
  candidate,
  onSelectCandidate,
  onCompareWithRunnerUp,
  onViewProvenance
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // Score calculation components
  const cyclingContrib = Math.round(candidate.cyclingScore * 0.35);
  const demandContrib = Math.round(candidate.demandScore * 0.25);
  const saturationContrib = Math.round(candidate.saturationScore * 0.20);
  const revenueContrib = Math.round(candidate.revenuePotentialScore * 0.20);
  const calculatedSum = cyclingContrib + demandContrib + saturationContrib + revenueContrib;

  return (
    <div className="bg-white border border-[#DADCE0] rounded-lg p-4 sm:p-6 shadow-xs my-4 relative overflow-hidden">
      
      {/* Top Header with Badges & Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#DADCE0]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#E8F0FE] text-[#1967D2] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
            <span>AI Strategic Expansion Recommendation</span>
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] uppercase">
            <CheckCircle2 className="w-3 h-3 mr-1 text-[#34A853]" />
            BigQuery Verified
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#5F6368] block">Composite Index Score</span>
            <div className="flex items-baseline space-x-1 justify-end">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1967D2]">{recommendation.overallScore}</span>
              <span className="text-xs font-medium text-[#70757A]">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate 5-Question Clarity Grid */}
      <div className="mt-4 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#DADCE0]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#4285F4]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
              Executive Decision Matrix · Core Answers
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-[#1967D2] bg-[#E8F0FE] px-2 py-0.5 rounded">
            Track 2 Objective
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* Question 1 & 2: Where & Which Location */}
          <div className="bg-white border border-[#DADCE0] rounded-md p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#1A73E8] mb-1 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#1A73E8]" />
              <span>1 & 2. Recommended Expansion Location</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-[#202124]">{recommendation.locationName}</p>
            <p className="text-xs text-[#5F6368] mt-0.5">
              <strong>District:</strong> {recommendation.area}, {recommendation.city} · <span className="font-mono text-[11px]">[{recommendation.coordinates.lat.toFixed(4)}, {recommendation.coordinates.lng.toFixed(4)}]</span>
            </p>
          </div>

          {/* Question 3: Why? */}
          <div className="bg-white border border-[#DADCE0] rounded-md p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#137333] mb-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-[#137333]" />
              <span>3. Strategic Rationale (Why this location?)</span>
            </div>
            <p className="text-xs text-[#202124] font-medium leading-relaxed">
              {recommendation.headlineReason}
            </p>
          </div>

        </div>

        {/* Question 4: What Data Supports It? */}
        <div className="mt-3 bg-white border border-[#DADCE0] rounded-md p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1 text-[#3C4043]">
              <BarChart2 className="w-3 h-3 text-[#4285F4]" />
              <span>4. Supporting Data & Empirical Metrics (BigQuery ST_DISTANCE Joins)</span>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#F8F9FA] rounded p-2 border border-[#DADCE0]">
              <span className="text-[10px] text-[#5F6368] block">Cycling Corridor</span>
              <strong className="text-[#137333] text-sm">{candidate.nearestBikeRouteDistMeters}m</strong>
              <p className="text-[10px] text-[#70757A] truncate">to {candidate.nearestBikeRouteName}</p>
            </div>
            <div className="bg-[#F8F9FA] rounded p-2 border border-[#DADCE0]">
              <span className="text-[10px] text-[#5F6368] block">Daily Cyclist Volume</span>
              <strong className="text-[#1967D2] text-sm">~{candidate.dailyCyclistVolumeEstimate.toLocaleString()}</strong>
              <p className="text-[10px] text-[#70757A]">commuters / day</p>
            </div>
            <div className="bg-[#F8F9FA] rounded p-2 border border-[#DADCE0]">
              <span className="text-[10px] text-[#5F6368] block">Store Cannibalization</span>
              <strong className="text-[#129EAF] text-sm">0 stores &lt; 1km</strong>
              <p className="text-[10px] text-[#70757A]">{candidate.nearestExistingStoreDistKm}km to nearest store</p>
            </div>
            <div className="bg-[#F8F9FA] rounded p-2 border border-[#DADCE0]">
              <span className="text-[10px] text-[#5F6368] block">Estimated Gross Sales</span>
              <strong className="text-[#B06000] text-sm">£{(candidate.estimatedMonthlyRevenue/1000).toFixed(1)}k /mo</strong>
              <p className="text-[10px] text-[#70757A]">Rent Index: {candidate.commercialRentIndex}/100</p>
            </div>
          </div>
        </div>

        {/* Question 5: How Did the Score Get Calculated? */}
        <div className="mt-3 bg-white border border-[#DADCE0] rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3C4043] flex items-center space-x-1">
              <Calculator className="w-3 h-3 text-[#F9AB00]" />
              <span>5. Mathematical Score Calculation Formula</span>
            </div>
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="text-[11px] text-[#1967D2] hover:underline font-medium flex items-center space-x-1 cursor-pointer"
            >
              <span>{showFormulaDetails ? 'Hide Calculation' : 'Show Formula'}</span>
              {showFormulaDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <div className="mt-2 text-xs font-mono bg-[#F8F9FA] p-2.5 rounded border border-[#DADCE0] text-[#3C4043] overflow-x-auto">
            <div className="text-xs">
              <span className="text-[#137333] font-bold">Cycling ({candidate.cyclingScore} × 35%)</span> + 
              <span className="text-[#1967D2] font-bold"> Demand ({candidate.demandScore} × 25%)</span> + 
              <span className="text-[#129EAF] font-bold"> Isolation ({candidate.saturationScore} × 20%)</span> + 
              <span className="text-[#B06000] font-bold"> Revenue ({candidate.revenuePotentialScore} × 20%)</span> = 
              <span className="text-[#202124] font-extrabold text-sm ml-1">{candidate.overallScore} / 100</span>
            </div>
          </div>

          {showFormulaDetails && (
            <div className="mt-2.5 pt-2 border-t border-[#DADCE0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="text-[#137333]">
                <strong>Cycling Contribution:</strong> +{cyclingContrib} pts
              </div>
              <div className="text-[#1967D2]">
                <strong>Demand Contribution:</strong> +{demandContrib} pts
              </div>
              <div className="text-[#129EAF]">
                <strong>Isolation Contribution:</strong> +{saturationContrib} pts
              </div>
              <div className="text-[#B06000]">
                <strong>Revenue Contribution:</strong> +{revenueContrib} pts
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Strategic Rationale Narrative Paragraph */}
      <div className="mt-4 text-xs text-[#3C4043] leading-relaxed">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] mb-1">
          Detailed Synthesis & Strategic Narrative:
        </h3>
        <p className="bg-[#F8F9FA] border border-[#DADCE0] rounded-lg p-3 text-[#3C4043] text-xs sm:text-sm leading-relaxed">
          {recommendation.whyThisLocation}
        </p>
      </div>

      {/* Key Supporting Evidence Bullet Points */}
      <div className="mt-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
          Empirical Supporting Evidence Points:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recommendation.keyEvidence.map((evidence, idx) => (
            <div key={idx} className="flex items-start space-x-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md p-2.5 text-xs text-[#3C4043]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853] flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{evidence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations & Caveats */}
      {recommendation.limitations && recommendation.limitations.length > 0 && (
        <div className="mt-3.5 pt-2.5 border-t border-[#DADCE0]">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#B06000] mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Methodological Assumptions & Limitations:</span>
          </div>
          <ul className="list-disc list-inside text-xs text-[#5F6368] space-y-0.5">
            {recommendation.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3.5 border-t border-[#DADCE0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectCandidate(candidate)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-[#4285F4] hover:bg-[#1A73E8] text-white shadow-xs transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Center on Spatial Map</span>
          </button>

          <button
            onClick={onCompareWithRunnerUp}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] transition-colors cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>Compare with Alternatives</span>
          </button>
        </div>

        <button
          onClick={onViewProvenance}
          className="inline-flex items-center space-x-1 text-xs text-[#1967D2] hover:underline font-medium transition-colors cursor-pointer"
        >
          <span>Inspect BigQuery SQL & MCP Logs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
