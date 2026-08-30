import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  Database, 
  Sliders, 
  CheckCircle2, 
  Loader2,
  Bike,
  Award
} from 'lucide-react';
import { AgentExecutionStep, AgentStepStage } from '../types.js';

interface QueryHeroProps {
  onSearch: (question: string, areaFilter?: string) => void;
  isLoading: boolean;
  activeSteps: AgentExecutionStep[];
  currentQuestion: string;
}

const SUGGESTED_QUERIES = [
  'Where should we open our next coffee shop to maximize cyclist commuter traffic?',
  'Find the top 5 locations with strong cycling accessibility and zero store cannibalization',
  'Which location has the highest daily cyclist volume along protected bike routes?',
  'Compare Blackfriars North against London Fields and Angel Islington',
  'Show candidate locations with over 1,000 pedestrians/hr foot traffic'
];

export const QueryHero: React.FC<QueryHeroProps> = ({
  onSearch,
  isLoading,
  activeSteps,
  currentQuestion
}) => {
  const [inputVal, setInputVal] = useState(currentQuestion || '');
  const [selectedArea, setSelectedArea] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal.trim(), selectedArea || undefined);
    }
  };

  const handlePresetClick = (query: string) => {
    setInputVal(query);
    if (!isLoading) {
      onSearch(query, selectedArea || undefined);
    }
  };

  const stageIcons: Record<AgentStepStage, React.ReactNode> = {
    understanding_request: <BrainCircuit className="w-3.5 h-3.5 text-[#9334E6]" />,
    checking_data: <Database className="w-3.5 h-3.5 text-[#4285F4]" />,
    running_analysis: <Bike className="w-3.5 h-3.5 text-[#34A853]" />,
    ranking_locations: <Sliders className="w-3.5 h-3.5 text-[#F9AB00]" />,
    generating_recommendation: <Award className="w-3.5 h-3.5 text-[#1967D2]" />
  };

  // Compact Execution States in canonical order
  const displayStages: { stage: AgentStepStage; label: string }[] = [
    { stage: 'understanding_request', label: 'Understanding request' },
    { stage: 'checking_data', label: 'Checking data' },
    { stage: 'running_analysis', label: 'Running analysis' },
    { stage: 'ranking_locations', label: 'Ranking locations' },
    { stage: 'generating_recommendation', label: 'Generating recommendation' }
  ];

  return (
    <div className="bg-white border-b border-[#DADCE0] px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Query Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <div className="relative flex items-center bg-[#F8F9FA] border border-[#DADCE0] focus-within:border-[#4285F4] focus-within:ring-1 focus-within:ring-[#4285F4] rounded-lg p-1.5 transition-all">
            
            <div className="pl-2.5 pr-2 text-[#5F6368]">
              <Search className="w-4 h-4 text-[#4285F4]" />
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask where we should open our next coffee shop (e.g. 'Find candidate locations near high-volume cycle routes')..."
              className="w-full bg-transparent border-0 text-[#202124] placeholder-[#70757A] text-xs sm:text-sm font-normal focus:ring-0 focus:outline-none py-1.5"
              disabled={isLoading}
            />

            {/* Area Filter Selector */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              disabled={isLoading}
              className="hidden md:block bg-white border border-[#DADCE0] text-[#3C4043] text-xs rounded-md px-2.5 py-1.5 mr-2 focus:ring-1 focus:ring-[#4285F4] focus:border-[#4285F4]"
            >
              <option value="">All London Districts</option>
              <option value="Blackfriars">Blackfriars / City</option>
              <option value="Hackney">Hackney / London Fields</option>
              <option value="Islington">Islington / Angel</option>
              <option value="Bermondsey">Bermondsey</option>
              <option value="Paddington">Paddington</option>
              <option value="King's Cross">King's Cross</option>
            </select>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="inline-flex items-center space-x-1.5 bg-[#4285F4] hover:bg-[#1A73E8] text-white font-bold text-xs px-4 py-2 rounded-md shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Queries Chips */}
        <div className="mt-3 max-w-4xl mx-auto">
          <div className="flex items-center space-x-1.5 text-xs text-[#5F6368] mb-1.5">
            <Sparkles className="w-3 h-3 text-[#4285F4]" />
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#5F6368]">Suggested Queries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUERIES.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(query)}
                disabled={isLoading}
                className="text-xs text-left bg-white hover:bg-[#F8F9FA] hover:border-[#4285F4] text-[#3C4043] hover:text-[#1967D2] px-2.5 py-1 rounded border border-[#DADCE0] transition-colors disabled:opacity-50 cursor-pointer"
              >
                '{query}'
              </button>
            ))}
          </div>
        </div>

        {/* Visible, Compact Agent Execution States */}
        <div className="mt-3.5 max-w-4xl mx-auto bg-[#F8F9FA] border border-[#DADCE0] rounded-lg p-2.5 shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#DADCE0]">
            <div className="flex items-center space-x-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-[#4285F4]" />
              <span className="text-[11px] font-bold text-[#202124] uppercase tracking-wider">Agent Execution State:</span>
            </div>
            <span className="text-[10px] text-[#70757A] font-mono">
              Natural Language ➔ BigQuery MCP ➔ Spatial Scoring ➔ Evidence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-1.5">
            {displayStages.map((ds) => {
              const matchedStep = activeSteps.find((s) => s.stage === ds.stage);
              const isCompleted = matchedStep?.status === 'completed';
              const isActive = isLoading && !isCompleted;
              
              return (
                <div
                  key={ds.stage}
                  className={`flex items-center space-x-1.5 px-2 py-1.5 rounded border text-xs transition-all ${
                    isActive
                      ? 'bg-[#E8F0FE] border-[#4285F4] text-[#1967D2] font-semibold'
                      : isCompleted
                      ? 'bg-white border-[#DADCE0] text-[#3C4043]'
                      : 'bg-[#F1F3F4] border-[#DADCE0] text-[#70757A]'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isLoading && !isCompleted ? (
                      <Loader2 className="w-3 h-3 text-[#4285F4] animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-[#34A853]" />
                    ) : (
                      stageIcons[ds.stage] || <div className="w-3 h-3 rounded-full border border-[#DADCE0]" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-medium truncate text-[11px]">{ds.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
