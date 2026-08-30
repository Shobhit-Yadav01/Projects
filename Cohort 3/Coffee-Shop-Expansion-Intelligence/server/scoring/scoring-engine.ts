import {
  CandidateLocation,
  FactorBreakdown,
  RecommendationStatus,
  RecommendationSummary,
  ScoringWeights
} from '../types.js';

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  cyclingAccessibility: 0.35,
  customerDemand: 0.25,
  storeSaturation: 0.20, // Non-cannibalization score
  revenuePotential: 0.20
};

export function normalizeWeights(weights: Partial<ScoringWeights>): ScoringWeights {
  const c = weights.cyclingAccessibility ?? DEFAULT_SCORING_WEIGHTS.cyclingAccessibility;
  const d = weights.customerDemand ?? DEFAULT_SCORING_WEIGHTS.customerDemand;
  const s = weights.storeSaturation ?? DEFAULT_SCORING_WEIGHTS.storeSaturation;
  const r = weights.revenuePotential ?? DEFAULT_SCORING_WEIGHTS.revenuePotential;
  
  const total = c + d + s + r;
  if (total === 0) return DEFAULT_SCORING_WEIGHTS;

  return {
    cyclingAccessibility: Number((c / total).toFixed(2)),
    customerDemand: Number((d / total).toFixed(2)),
    storeSaturation: Number((s / total).toFixed(2)),
    revenuePotential: Number((r / total).toFixed(2))
  };
}

export function computeCyclingScore(distMeters: number, densityKm: number, dailyVolume: number): number {
  // Proximity score (0-50 pts)
  let proximityPts = 0;
  if (distMeters <= 20) proximityPts = 50;
  else if (distMeters <= 50) proximityPts = 42;
  else if (distMeters <= 100) proximityPts = 32;
  else if (distMeters <= 200) proximityPts = 20;
  else proximityPts = Math.max(5, 15 - Math.floor(distMeters / 50));

  // Density score (0-25 pts)
  const densityPts = Math.min(25, Math.round(densityKm * 7.5));

  // Volume score (0-25 pts)
  const volumePts = Math.min(25, Math.round((dailyVolume / 15000) * 25));

  return Math.min(100, Math.max(0, proximityPts + densityPts + volumePts));
}

export function computeDemandScore(footTrafficPerHour: number, monthlyOrders: number): number {
  const trafficPts = Math.min(50, Math.round((footTrafficPerHour / 1600) * 50));
  const ordersPts = Math.min(50, Math.round((monthlyOrders / 18000) * 50));
  return Math.min(100, Math.max(0, trafficPts + ordersPts));
}

export function computeSaturationScore(nearestStoreDistKm: number, storesWithin1km: number): number {
  // High score means LOW saturation / NO cannibalization
  let distScore = 0;
  if (nearestStoreDistKm >= 2.5) distScore = 60;
  else if (nearestStoreDistKm >= 1.5) distScore = 50;
  else if (nearestStoreDistKm >= 1.0) distScore = 40;
  else if (nearestStoreDistKm >= 0.8) distScore = 25;
  else distScore = 10;

  let countScore = 0;
  if (storesWithin1km === 0) countScore = 40;
  else if (storesWithin1km === 1) countScore = 20;
  else countScore = 5;

  return Math.min(100, Math.max(0, distScore + countScore));
}

export function computeRevenuePotentialScore(estimatedMonthlyRev: number, rentIndex: number): number {
  const revPts = Math.min(60, Math.round((estimatedMonthlyRev / 100000) * 60));
  // Rent efficiency: lower rent index is better margin
  const rentPts = Math.max(10, Math.round(40 * (1 - rentIndex / 150)));
  return Math.min(100, Math.max(0, revPts + rentPts));
}

export function scoreAndRankCandidates(
  rawCandidates: Array<{
    id: string;
    name: string;
    city: string;
    area: string;
    latitude: number;
    longitude: number;
    nearestBikeRouteDistMeters: number;
    nearestBikeRouteName: string;
    bikeRouteDensityKm: number;
    dailyCyclistVolumeEstimate: number;
    existingStoresWithin1km: number;
    nearestExistingStoreDistKm: number;
    avgFootTrafficPerHour: number;
    estimatedMonthlyRevenue: number;
    estimatedMonthlyOrders: number;
    commercialRentIndex: number;
  }>,
  weights: ScoringWeights
): CandidateLocation[] {
  const scored = rawCandidates.map((c) => {
    const cyclingScore = computeCyclingScore(
      c.nearestBikeRouteDistMeters,
      c.bikeRouteDensityKm,
      c.dailyCyclistVolumeEstimate
    );
    const demandScore = computeDemandScore(
      c.avgFootTrafficPerHour,
      c.estimatedMonthlyOrders
    );
    const saturationScore = computeSaturationScore(
      c.nearestExistingStoreDistKm,
      c.existingStoresWithin1km
    );
    const revenuePotentialScore = computeRevenuePotentialScore(
      c.estimatedMonthlyRevenue,
      c.commercialRentIndex
    );

    const overall =
      cyclingScore * weights.cyclingAccessibility +
      demandScore * weights.customerDemand +
      saturationScore * weights.storeSaturation +
      revenuePotentialScore * weights.revenuePotential;

    const overallScore = Math.round(overall);

    // Strengths & Risks
    const keyStrengths: string[] = [];
    const risks: string[] = [];

    if (cyclingScore >= 85) keyStrengths.push(`Direct frontage to ${c.nearestBikeRouteName} (${c.nearestBikeRouteDistMeters}m away) with ~${c.dailyCyclistVolumeEstimate.toLocaleString()} daily riders`);
    if (demandScore >= 80) keyStrengths.push(`Heavy pedestrian corridor with ${c.avgFootTrafficPerHour} passersby/hr and ~${c.estimatedMonthlyOrders.toLocaleString()} est. orders/mo`);
    if (saturationScore >= 80) keyStrengths.push(`Zero cannibalization risk: nearest existing store is ${c.nearestExistingStoreDistKm}km away`);
    if (revenuePotentialScore >= 80) keyStrengths.push(`Projected monthly revenue £${c.estimatedMonthlyRevenue.toLocaleString()} with strong margin efficiency`);

    if (c.existingStoresWithin1km > 0) risks.push(`Proximity risk: Existing store within ${c.nearestExistingStoreDistKm}km`);
    if (c.nearestBikeRouteDistMeters > 100) risks.push(`Sub-optimal cycling frontage: ${c.nearestBikeRouteDistMeters}m from nearest designated cycle lane`);
    if (c.commercialRentIndex > 80) risks.push(`Premium commercial lease rates (Rent Index: ${c.commercialRentIndex}/100)`);

    const candidate: CandidateLocation = {
      ...c,
      cyclingScore,
      demandScore,
      saturationScore,
      revenuePotentialScore,
      overallScore,
      status: 'Moderate', // Will assign below
      explanation: '',
      keyStrengths,
      risks
    };

    return candidate;
  });

  // Sort descending by overall score
  scored.sort((a, b) => b.overallScore - a.overallScore);

  // Assign status
  scored.forEach((c, idx) => {
    if (idx === 0 && c.overallScore >= 80) {
      c.status = 'Recommended';
      c.explanation = `Top-ranked candidate with ${c.overallScore}/100 overall score. Excels in cycling accessibility (${c.cyclingScore}/100) and zero cannibalization of existing stores.`;
    } else if (c.overallScore >= 78) {
      c.status = 'Strong Candidate';
      c.explanation = `Viable high-potential location with ${c.overallScore}/100 score. Strong secondary candidate for phased expansion.`;
    } else if (c.overallScore >= 65) {
      c.status = 'Moderate';
      c.explanation = `Moderate viability (${c.overallScore}/100). Balances good foot traffic with higher competition or moderate bike route connectivity.`;
    } else {
      c.status = 'Low Priority';
      c.explanation = `Low priority score (${c.overallScore}/100). Restricted by lower cyclist density or store cannibalization risk.`;
    }
  });

  return scored;
}

export function buildFactorBreakdown(candidate: CandidateLocation, weights: ScoringWeights): FactorBreakdown[] {
  return [
    {
      name: 'cyclingAccessibility',
      label: 'Cycling Accessibility',
      score: candidate.cyclingScore,
      weight: weights.cyclingAccessibility,
      weightedContribution: Math.round(candidate.cyclingScore * weights.cyclingAccessibility),
      rawMetricLabel: `${candidate.nearestBikeRouteDistMeters}m to ${candidate.nearestBikeRouteName} (~${candidate.dailyCyclistVolumeEstimate.toLocaleString()} riders/day)`,
      description: 'Proximity to segregated bike corridors, cycling network density, and daily commuter flow.'
    },
    {
      name: 'customerDemand',
      label: 'Customer Demand',
      score: candidate.demandScore,
      weight: weights.customerDemand,
      weightedContribution: Math.round(candidate.demandScore * weights.customerDemand),
      rawMetricLabel: `${candidate.avgFootTrafficPerHour} pedestrians/hr, ~${candidate.estimatedMonthlyOrders.toLocaleString()} monthly orders`,
      description: 'Pedestrian foot traffic, office density, and aggregate local consumer volume.'
    },
    {
      name: 'storeSaturation',
      label: 'Store Saturation (Non-Cannibalization)',
      score: candidate.saturationScore,
      weight: weights.storeSaturation,
      weightedContribution: Math.round(candidate.saturationScore * weights.storeSaturation),
      rawMetricLabel: `${candidate.existingStoresWithin1km} stores within 1km (nearest: ${candidate.nearestExistingStoreDistKm}km)`,
      description: 'Protection against cannibalizing existing company stores while capturing unserved territory.'
    },
    {
      name: 'revenuePotential',
      label: 'Revenue Potential & Margin',
      score: candidate.revenuePotentialScore,
      weight: weights.revenuePotential,
      weightedContribution: Math.round(candidate.revenuePotentialScore * weights.revenuePotential),
      rawMetricLabel: `£${candidate.estimatedMonthlyRevenue.toLocaleString()}/mo est. gross (Rent Index: ${candidate.commercialRentIndex}/100)`,
      description: 'Projected monthly top-line revenue combined with commercial lease index efficiency.'
    }
  ];
}
