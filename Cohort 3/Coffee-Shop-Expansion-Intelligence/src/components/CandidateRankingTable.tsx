import React, { useState } from 'react';
import { 
  Trophy, 
  ArrowUpDown, 
  Bike, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  GitCompare,
  Eye,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CandidateLocation, RecommendationStatus } from '../types.js';

interface CandidateRankingTableProps {
  candidates: CandidateLocation[];
  selectedCandidate: CandidateLocation | null;
  onSelectCandidate: (candidate: CandidateLocation) => void;
  onOpenComparison: (selectedCandidates: CandidateLocation[]) => void;
}

type SortKey = 'overallScore' | 'cyclingScore' | 'demandScore' | 'saturationScore' | 'revenuePotentialScore';

export const CandidateRankingTable: React.FC<CandidateRankingTableProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onOpenComparison
}) => {
  const [sortField, setSortField] = useState<SortKey>('overallScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleSort = (field: SortKey) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (comparisonIds.includes(id)) {
      setComparisonIds(comparisonIds.filter(item => item !== id));
    } else {
      if (comparisonIds.length < 3) {
        setComparisonIds([...comparisonIds, id]);
      }
    }
  };

  const handleLaunchCompare = () => {
    const selected = candidates.filter(c => comparisonIds.includes(c.id));
    if (selected.length >= 2) {
      onOpenComparison(selected);
    }
  };

  // Filter & Sort
  const filtered = candidates.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  const getStatusBadge = (status: RecommendationStatus) => {
    switch (status) {
      case 'Recommended':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3] uppercase">
            <Sparkles className="w-2.5 h-2.5 mr-1 text-[#F9AB00]" />
            Recommended
          </span>
        );
      case 'Strong Candidate':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#1967D2] border border-[#D2E3FC] uppercase">
            Strong Candidate
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F3F4] text-[#5F6368] uppercase">
            Moderate
          </span>
        );
      case 'Low Priority':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F8F9FA] text-[#70757A] border border-[#DADCE0] uppercase">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#DADCE0] rounded-lg overflow-hidden shadow-xs my-4">
      
      {/* Table Header Controls */}
      <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#DADCE0] flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center space-x-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#F9AB00]" />
            <span>Candidate Expansion Locations Ranking</span>
          </h3>
          <p className="text-[11px] text-[#70757A] mt-0.5">
            Ranked by multi-criteria decision index normalized from BigQuery spatial metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-[#DADCE0] text-[#3C4043] text-xs rounded-md px-2.5 py-1 focus:ring-1 focus:ring-[#4285F4] focus:border-[#4285F4]"
          >
            <option value="all">All Tiers ({candidates.length})</option>
            <option value="Recommended">Recommended Only</option>
            <option value="Strong Candidate">Strong Candidates</option>
            <option value="Moderate">Moderate</option>
            <option value="Low Priority">Low Priority</option>
          </select>

          {/* Compare Button */}
          {comparisonIds.length >= 2 && (
            <button
              onClick={handleLaunchCompare}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold bg-[#4285F4] hover:bg-[#1A73E8] text-white shadow-xs transition-colors cursor-pointer"
            >
              <GitCompare className="w-3 h-3" />
              <span>Compare {comparisonIds.length} Selected</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#3C4043]">
          <thead className="bg-[#F8F9FA] text-[10px] uppercase tracking-wider font-bold text-[#5F6368] border-b border-[#DADCE0]">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">Compare</th>
              <th className="py-2.5 px-3 w-10 text-center">Rank</th>
              <th className="py-2.5 px-3">Location & District</th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-[#202124] transition-colors"
                onClick={() => handleSort('overallScore')}
              >
                <div className="flex items-center space-x-1">
                  <span>Overall Score</span>
                  <ArrowUpDown className="w-3 h-3 text-[#4285F4]" />
                </div>
              </th>
              <th className="py-2.5 px-3">Status</th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-[#202124] transition-colors"
                onClick={() => handleSort('cyclingScore')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cycling Access</span>
                  <ArrowUpDown className="w-3 h-3 text-[#34A853]" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-[#202124] transition-colors"
                onClick={() => handleSort('demandScore')}
              >
                <div className="flex items-center space-x-1">
                  <span>Foot Traffic</span>
                  <ArrowUpDown className="w-3 h-3 text-[#4285F4]" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-[#202124] transition-colors"
                onClick={() => handleSort('saturationScore')}
              >
                <div className="flex items-center space-x-1">
                  <span>Store Buffer</span>
                  <ArrowUpDown className="w-3 h-3 text-[#129EAF]" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-[#202124] transition-colors"
                onClick={() => handleSort('revenuePotentialScore')}
              >
                <div className="flex items-center space-x-1">
                  <span>Est. Monthly Rev</span>
                  <ArrowUpDown className="w-3 h-3 text-[#F9AB00]" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#DADCE0]">
            {sorted.map((cand, idx) => {
              const isSelected = selectedCandidate?.id === cand.id;
              const isCompared = comparisonIds.includes(cand.id);
              const rank = candidates.findIndex(c => c.id === cand.id) + 1;

              return (
                <tr
                  key={cand.id}
                  onClick={() => onSelectCandidate(cand)}
                  className={`hover:bg-[#F8F9FA] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#E8F0FE]' : ''
                  }`}
                >
                  {/* Compare Checkbox */}
                  <td className="py-2.5 px-3 text-center" onClick={(e) => toggleCompare(cand.id, e)}>
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => {}}
                      className="rounded border-[#DADCE0] text-[#4285F4] focus:ring-[#4285F4] h-3.5 w-3.5 cursor-pointer"
                    />
                  </td>

                  {/* Rank */}
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                      rank === 1 
                        ? 'bg-[#F9AB00] text-[#202124] font-black' 
                        : rank <= 3 
                        ? 'bg-[#E8EAED] text-[#202124] font-bold' 
                        : 'text-[#70757A]'
                    }`}>
                      {rank}
                    </span>
                  </td>

                  {/* Location & District */}
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#202124] text-xs">{cand.name}</div>
                    <div className="text-[11px] text-[#70757A]">{cand.area}, {cand.city}</div>
                  </td>

                  {/* Overall Score */}
                  <td className="py-2.5 px-3 font-bold">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${rank === 1 ? 'text-[#1967D2]' : 'text-[#202124]'}`}>
                        {cand.overallScore}
                      </span>
                      <div className="w-14 h-1.5 bg-[#E8EAED] rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${rank === 1 ? 'bg-[#F9AB00]' : 'bg-[#4285F4]'}`}
                          style={{ width: `${cand.overallScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3">
                    {getStatusBadge(cand.status)}
                  </td>

                  {/* Cycling */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#137333]">{cand.cyclingScore} / 100</div>
                    <div className="text-[11px] text-[#70757A] truncate max-w-[130px]">
                      {cand.nearestBikeRouteDistMeters}m to {cand.nearestBikeRouteName.split(' ')[0]}
                    </div>
                  </td>

                  {/* Demand */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#1967D2]">{cand.demandScore} / 100</div>
                    <div className="text-[11px] text-[#70757A]">
                      {cand.avgFootTrafficPerHour} ped/hr
                    </div>
                  </td>

                  {/* Saturation */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#129EAF]">{cand.saturationScore} / 100</div>
                    <div className="text-[11px] text-[#70757A]">
                      {cand.nearestExistingStoreDistKm} km buffer
                    </div>
                  </td>

                  {/* Est Revenue */}
                  <td className="py-2.5 px-3 font-medium text-[#202124]">
                    <div>£{(cand.estimatedMonthlyRevenue / 1000).toFixed(1)}k/mo</div>
                    <div className="text-[11px] text-[#70757A]">Rent: {cand.commercialRentIndex}/100</div>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(cand);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-[#4285F4]" />
                      <span className="hidden md:inline">Inspect</span>
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
