import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  MapPin, 
  HelpCircle, 
  Database,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { CandidateCompareModal } from './components/CandidateCompareModal.js';
import { CandidateRankingTable } from './components/CandidateRankingTable.js';
import { ChartsSection } from './components/ChartsSection.js';
import { ExecutiveSummaryCard } from './components/ExecutiveSummaryCard.js';
import { FactorAnalysisSection } from './components/FactorAnalysisSection.js';
import { Header } from './components/Header.js';
import { InteractiveMap } from './components/InteractiveMap.js';
import { KeyMetricsBar } from './components/KeyMetricsBar.js';
import { MCPConfigModal } from './components/MCPConfigModal.js';
import { ProvenanceAndTransparency } from './components/ProvenanceAndTransparency.js';
import { QueryHero } from './components/QueryHero.js';
import { 
  AgentAnalysisResponse, 
  AgentExecutionStep, 
  CandidateLocation, 
  MCPConnectionStatus, 
  ScoringWeights 
} from './types.js';

const INITIAL_QUESTION = 'Where should we open our next coffee shop to maximize cyclist commuter traffic and avoid cannibalization?';

export function App() {
  const [analysis, setAnalysis] = useState<AgentAnalysisResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSteps, setActiveSteps] = useState<AgentExecutionStep[]>([]);
  const [mcpStatus, setMcpStatus] = useState<MCPConnectionStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparedCandidates, setComparedCandidates] = useState<CandidateLocation[]>([]);

  // Scoring Weights State
  const [currentWeights, setCurrentWeights] = useState<ScoringWeights>({
    cyclingAccessibility: 0.35,
    customerDemand: 0.25,
    storeSaturation: 0.20,
    revenuePotential: 0.20
  });

  // Fetch MCP status and run initial analysis
  useEffect(() => {
    fetchMcpStatus();
    runAnalysis(INITIAL_QUESTION);
  }, []);

  const fetchMcpStatus = async () => {
    try {
      const res = await fetch('/api/expansion/mcp-status');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setMcpStatus(data);
        } catch {
          // Ignore non-json
        }
      }
    } catch (err) {
      console.warn('Could not fetch MCP status:', err);
    }
  };

  const runAnalysis = async (question: string, areaFilter?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveSteps([
      {
        id: 'step-1',
        stage: 'understanding_request',
        title: 'Understanding request',
        description: 'Analyzing business question and strategic constraints...',
        status: 'active',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    try {
      const res = await fetch('/api/expansion/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          weights: currentWeights,
          areaFilter
        })
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        if (!res.ok) {
          throw new Error(`Server returned error status ${res.status}`);
        }
        throw new Error(`Invalid response received from server (${text.slice(0, 80)}...)`);
      }

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Expansion analysis failed with status ${res.status}`);
      }

      setAnalysis(data as AgentAnalysisResponse);
      if (data.weights) setCurrentWeights(data.weights);
      if (data.steps) setActiveSteps(data.steps);

      if (data.candidates && data.candidates.length > 0) {
        setSelectedCandidate(data.candidates[0]);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to complete expansion intelligence query.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-scoring when user adjusts sliders
  const handleWeightsChange = async (newWeights: ScoringWeights) => {
    setCurrentWeights(newWeights);
    if (!analysis) return;

    try {
      const res = await fetch('/api/expansion/rescore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights: newWeights })
      });

      if (res.ok) {
        const text = await res.text();
        const data = JSON.parse(text);
        setAnalysis(prev => {
          if (!prev) return null;
          return {
            ...prev,
            weights: data.weights,
            candidates: data.candidates,
            recommendation: {
              ...prev.recommendation,
              locationName: data.topCandidate.name,
              area: data.topCandidate.area,
              overallScore: data.topCandidate.overallScore,
              status: data.topCandidate.status,
              coordinates: {
                lat: data.topCandidate.latitude,
                lng: data.topCandidate.longitude
              }
            }
          };
        });

        if (selectedCandidate) {
          const updatedSelected = data.candidates.find((c: CandidateLocation) => c.id === selectedCandidate.id);
          if (updatedSelected) {
            setSelectedCandidate(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error('Re-scoring failed:', err);
    }
  };

  const handleCompareWithRunnerUp = () => {
    if (analysis && analysis.candidates.length >= 2) {
      setComparedCandidates([analysis.candidates[0], analysis.candidates[1]]);
      setIsCompareOpen(true);
    }
  };

  const handleOpenComparison = (selected: CandidateLocation[]) => {
    setComparedCandidates(selected);
    setIsCompareOpen(true);
  };

  const activeCandidate = selectedCandidate || (analysis?.candidates ? analysis.candidates[0] : null);

  return (
    <div className="min-h-screen bg-[#F1F3F4] text-[#202124] font-sans selection:bg-[#4285F4] selection:text-white">
      
      {/* 1. Header */}
      <Header
        mcpStatus={mcpStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProvenance={() => setIsProvenanceOpen(true)}
        onReset={() => runAnalysis(analysis?.question || INITIAL_QUESTION)}
        isLoading={isLoading}
      />

      {/* 2. Natural Language Query & Pipeline Status Hero */}
      <QueryHero
        onSearch={runAnalysis}
        isLoading={isLoading}
        activeSteps={activeSteps}
        currentQuestion={analysis?.question || INITIAL_QUESTION}
      />

      {/* Main Dashboard Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Demo Mode Notice Banner */}
        {mcpStatus?.mode === 'sandbox_demo' && (
          <div className="mb-4 bg-[#FEF7E0] border border-[#FEEFC3] text-[#B06000] rounded-lg p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F9AB00] animate-pulse flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#7A4100]">Demo Dataset Mode Active:</span>{' '}
                <span>Simulating BigQuery MCP Server with real London geospatial records. To connect live GCP project, click </span>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="font-bold underline hover:text-[#202124] cursor-pointer"
                >
                  Configure BigQuery MCP
                </button>.
              </div>
            </div>
            <button
              onClick={() => setIsProvenanceOpen(true)}
              className="text-xs font-semibold bg-white/80 hover:bg-white text-[#7A4100] px-2.5 py-1 rounded border border-[#FEEFC3] transition-colors cursor-pointer"
            >
              Inspect BigQuery SQL & Schemas
            </button>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-4 bg-[#FCE8E6] border border-[#F5C2C7] text-[#C5221F] rounded-lg p-3.5 flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 text-[#C5221F] flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold text-[#C5221F]">Analysis Error</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => runAnalysis(analysis?.question || INITIAL_QUESTION)}
              className="px-2.5 py-1 bg-white border border-[#F5C2C7] rounded text-xs font-bold text-[#C5221F] hover:bg-[#FCE8E6] transition-colors cursor-pointer"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Loading Spinner for full rebuild */}
        {isLoading && !analysis && (
          <div className="py-20 text-center bg-white border border-[#DADCE0] rounded-lg p-8 shadow-xs">
            <Loader2 className="w-8 h-8 text-[#4285F4] animate-spin mx-auto mb-3" />
            <h2 className="text-base font-bold text-[#202124]">Running Spatial Intelligence Expansion Agent...</h2>
            <p className="text-xs text-[#5F6368] mt-1 max-w-md mx-auto">
              Synthesizing BigQuery ST_DISTANCE calculations across London cycle superhighways and candidate locations.
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {analysis.candidates.length === 0 ? (
              <div className="bg-white border border-[#DADCE0] rounded-lg p-8 sm:p-12 text-center shadow-xs my-4">
                <div className="w-12 h-12 rounded-full bg-[#FEF7E0] border border-[#FEEFC3] flex items-center justify-center mx-auto mb-3 text-[#B06000]">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#202124]">No matching candidate locations found</h3>
                <p className="text-xs text-[#5F6368] mt-1 max-w-md mx-auto">
                  No candidate commercial parcels matched the criteria or district filter in '{analysis.question}'. Try broadening your query or selecting "All London Districts".
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => runAnalysis(INITIAL_QUESTION)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-bold bg-[#4285F4] hover:bg-[#1A73E8] text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Full City Analysis</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 3. High-Level KPI Summary Metrics Bar */}
                <KeyMetricsBar
                  candidates={analysis.candidates}
                  existingStores={analysis.existingStores}
                />

                {/* 4. Top Recommendation Showcase Card */}
                {activeCandidate && (
                  <ExecutiveSummaryCard
                    recommendation={analysis.recommendation}
                    candidate={activeCandidate}
                    onSelectCandidate={(c) => setSelectedCandidate(c)}
                    onCompareWithRunnerUp={handleCompareWithRunnerUp}
                    onViewProvenance={() => setIsProvenanceOpen(true)}
                  />
                )}

                {/* 5. Interactive Leaflet Spatial Map */}
                <InteractiveMap
                  candidates={analysis.candidates}
                  existingStores={analysis.existingStores}
                  bikeRoutes={analysis.bikeRoutes}
                  selectedCandidate={activeCandidate}
                  onSelectCandidate={(c) => setSelectedCandidate(c)}
                />

                {/* 6. Candidate Ranking Table with Multi-Selection & Sorting */}
                <CandidateRankingTable
                  candidates={analysis.candidates}
                  selectedCandidate={activeCandidate}
                  onSelectCandidate={(c) => setSelectedCandidate(c)}
                  onOpenComparison={handleOpenComparison}
                />

                {/* 7. Decision Weights Sliders & Factor Breakdown */}
                {activeCandidate && (
                  <FactorAnalysisSection
                    weights={currentWeights}
                    onWeightsChange={handleWeightsChange}
                    selectedCandidate={activeCandidate}
                  />
                )}

                {/* 8. Visual Analytics Charts (Comparison & Quadrant Matrix) */}
                <ChartsSection
                  candidates={analysis.candidates}
                  selectedCandidate={activeCandidate}
                  onSelectCandidate={(c) => setSelectedCandidate(c)}
                />
              </>
            )}

            {/* 9. Suggested Follow-Up Queries */}
            {analysis.suggestedFollowUps && analysis.suggestedFollowUps.length > 0 && (
              <div className="bg-white border border-[#DADCE0] rounded-lg p-4 shadow-xs">
                <div className="flex items-center space-x-2 text-[11px] font-bold text-[#1967D2] mb-2.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Strategic Follow-Up Inquiries:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedFollowUps.map((fu, idx) => (
                    <button
                      key={idx}
                      onClick={() => runAnalysis(fu)}
                      disabled={isLoading}
                      className="text-xs text-left bg-[#F8F9FA] hover:bg-[#E8F0FE] hover:border-[#4285F4] text-[#3C4043] hover:text-[#1967D2] px-3 py-1.5 rounded-md border border-[#DADCE0] transition-colors flex items-center space-x-2 cursor-pointer font-medium"
                    >
                      <span>{fu}</span>
                      <ArrowRight className="w-3 h-3 text-[#4285F4] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#DADCE0] bg-white py-4 px-4 text-center text-xs text-[#5F6368]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#202124]">Coffee Shop Expansion Intelligence</span>
          </div>
          <div className="flex items-center space-x-3 text-[#70757A]">
            <span>Powered by Gemini 3.7 Flash</span>
            <span>·</span>
            <span>BigQuery MCP Server</span>
            <span>·</span>
            <span>Spatial ST_DISTANCE Joins</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {analysis && (
        <ProvenanceAndTransparency
          provenance={analysis.provenance}
          methodology={analysis.methodology}
          isOpen={isProvenanceOpen}
          onClose={() => setIsProvenanceOpen(false)}
        />
      )}

      <CandidateCompareModal
        candidates={comparedCandidates}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <MCPConfigModal
        mcpStatus={mcpStatus}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshStatus={fetchMcpStatus}
      />

    </div>
  );
}

export default App;
