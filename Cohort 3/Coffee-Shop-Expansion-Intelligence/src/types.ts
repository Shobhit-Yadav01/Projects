export type RecommendationStatus = 'Recommended' | 'Strong Candidate' | 'Moderate' | 'Low Priority';

export interface CandidateLocation {
  id: string;
  name: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  overallScore: number;
  status: RecommendationStatus;
  
  // Normalized factor scores (0 - 100)
  cyclingScore: number;
  demandScore: number;
  saturationScore: number; // High score = low cannibalization / healthy distance
  revenuePotentialScore: number;
  
  // Real / Retrieved Raw Metrics
  nearestBikeRouteDistMeters: number;
  nearestBikeRouteName: string;
  bikeRouteDensityKm: number;
  dailyCyclistVolumeEstimate: number;
  existingStoresWithin1km: number;
  nearestExistingStoreDistKm: number;
  avgFootTrafficPerHour: number;
  estimatedMonthlyRevenue: number;
  estimatedMonthlyOrders: number;
  commercialRentIndex: number; // 1-100
  
  // AI-generated reasoning and flags
  explanation: string;
  keyStrengths: string[];
  risks: string[];
}

export interface ExistingStore {
  store_id: string;
  store_name: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  monthly_sales: number;
  daily_customers: number;
  store_age_months: number;
  rating: number;
}

export interface BikeRouteSegment {
  id: string;
  name: string;
  type: 'cycle_superhighway' | 'quietway' | 'protected_lane' | 'shared_path';
  coordinates: [number, number][]; // [lat, lng] pairs
  length_km: number;
  surface_type: string;
  daily_cyclist_volume: number;
}

export interface ScoringWeights {
  cyclingAccessibility: number; // e.g. 0.35
  customerDemand: number;        // e.g. 0.25
  storeSaturation: number;       // e.g. 0.20 (low cannibalization)
  revenuePotential: number;      // e.g. 0.20
}

export interface FactorBreakdown {
  name: string;
  label: string;
  score: number;
  weight: number;
  weightedContribution: number;
  rawMetricLabel: string;
  description: string;
}

export interface RecommendationSummary {
  locationName: string;
  area: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  overallScore: number;
  status: RecommendationStatus;
  headlineReason: string;
  whyThisLocation: string;
  keyEvidence: string[];
  limitations: string[];
  comparisons: {
    candidateName: string;
    deltaReason: string;
  }[];
}

// 5 Compact Execution States for the Agent
export type AgentStepStage = 
  | 'understanding_request' 
  | 'checking_data' 
  | 'running_analysis' 
  | 'ranking_locations' 
  | 'generating_recommendation';

export interface AgentExecutionStep {
  id: string;
  stage: AgentStepStage;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp: string;
  sqlQuery?: string;
  mcpTool?: string;
  resultsSummary?: string;
  executionTimeMs?: number;
}

export interface DataSourceItem {
  name: string;
  type: 'bigquery_table' | 'public_mobility_dataset' | 'mcp_tool_service' | 'ai_reasoning';
  tableOrDataset: string;
  rowsAnalyzed: number;
  lastUpdated?: string;
  description: string;
  verified: boolean;
}

export interface MCPCallLog {
  tool: string;
  params: Record<string, unknown>;
  timestamp: string;
  durationMs: number;
  status: 'success' | 'warning' | 'error';
  summary: string;
}

export interface QueryExecutedLog {
  id: string;
  title: string;
  sql: string;
  executionTimeMs: number;
  bytesScannedFormatted?: string;
  rowsReturned: number;
  purpose: string;
}

export interface DataProvenance {
  sources: DataSourceItem[];
  mcpCallLogs: MCPCallLog[];
  queriesExecuted: QueryExecutedLog[];
  schemaInspected: {
    dataset: string;
    table: string;
    columns: { name: string; type: string; description: string }[];
  }[];
}

export interface AgentAnalysisResponse {
  question: string;
  mode: 'real_bigquery' | 'demo_synthetic';
  recommendation: RecommendationSummary;
  candidates: CandidateLocation[];
  existingStores: ExistingStore[];
  bikeRoutes: BikeRouteSegment[];
  weights: ScoringWeights;
  steps: AgentExecutionStep[];
  provenance: DataProvenance;
  executiveSummary: string;
  methodology: string;
  suggestedFollowUps: string[];
  timestamp: string;
  error?: string;
}

export interface MCPConnectionStatus {
  mode: 'mcp_connected' | 'direct_bigquery' | 'sandbox_demo';
  connected: boolean;
  mcpEndpoint?: string;
  projectId?: string;
  dataset?: string;
  availableTables: string[];
  message: string;
  instructions?: string;
}
