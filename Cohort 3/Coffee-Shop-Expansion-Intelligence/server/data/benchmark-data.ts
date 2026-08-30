import { BikeRouteSegment, CandidateLocation, ExistingStore } from '../types.js';

export const BENCHMARK_EXISTING_STORES: ExistingStore[] = [
  {
    store_id: 'CS-101',
    store_name: 'Origin Roast - Covent Garden',
    city: 'London',
    area: 'Covent Garden',
    latitude: 51.5129,
    longitude: -0.1243,
    monthly_sales: 84500,
    daily_customers: 620,
    store_age_months: 36,
    rating: 4.8
  },
  {
    store_id: 'CS-102',
    store_name: 'Origin Roast - Shoreditch High St',
    city: 'London',
    area: 'Shoreditch',
    latitude: 51.5245,
    longitude: -0.0768,
    monthly_sales: 96200,
    daily_customers: 710,
    store_age_months: 28,
    rating: 4.9
  },
  {
    store_id: 'CS-103',
    store_name: 'Origin Roast - Soho Square',
    city: 'London',
    area: 'Soho',
    latitude: 51.5152,
    longitude: -0.1322,
    monthly_sales: 78900,
    daily_customers: 580,
    store_age_months: 48,
    rating: 4.7
  },
  {
    store_id: 'CS-104',
    store_name: 'Origin Roast - Southwark Bridge',
    city: 'London',
    area: 'Bankside / Southwark',
    latitude: 51.5065,
    longitude: -0.0935,
    monthly_sales: 71400,
    daily_customers: 510,
    store_age_months: 18,
    rating: 4.6
  },
  {
    store_id: 'CS-105',
    store_name: 'Origin Roast - Victoria Station',
    city: 'London',
    area: 'Victoria',
    latitude: 51.4965,
    longitude: -0.1438,
    monthly_sales: 91200,
    daily_customers: 690,
    store_age_months: 42,
    rating: 4.5
  }
];

export const BENCHMARK_BIKE_ROUTES: BikeRouteSegment[] = [
  {
    id: 'CS-3',
    name: 'Cycle Superhighway 3 (East-West Arterial)',
    type: 'cycle_superhighway',
    length_km: 18.2,
    surface_type: 'Segregated Asphalt',
    daily_cyclist_volume: 14200,
    coordinates: [
      [51.5033, -0.1428], // Hyde Park Corner
      [51.5038, -0.1275], // Westminster
      [51.5112, -0.1085], // Blackfriars
      [51.5098, -0.0762], // Tower Hill
      [51.5122, -0.0520], // Shadwell
      [51.5155, -0.0195]  // Canary Wharf Approach
    ]
  },
  {
    id: 'CS-6',
    name: 'Cycle Superhighway 6 (North-South Corridor)',
    type: 'cycle_superhighway',
    length_km: 11.5,
    surface_type: 'Protected Segregated Lane',
    daily_cyclist_volume: 11800,
    coordinates: [
      [51.5365, -0.1245], // King\'s Cross
      [51.5220, -0.1050], // Farringdon / Clerkenwell
      [51.5110, -0.1040], // Blackfriars Bridge
      [51.5020, -0.1010], // Elephant & Castle
      [51.4880, -0.1080]  // Kennington
    ]
  },
  {
    id: 'CS-2',
    name: 'Cycle Superhighway 2 (Stratford to Aldgate)',
    type: 'cycle_superhighway',
    length_km: 7.3,
    surface_type: 'High-Vis Segregated Lane',
    daily_cyclist_volume: 9800,
    coordinates: [
      [51.5140, -0.0750], // Aldgate
      [51.5190, -0.0590], // Whitechapel
      [51.5235, -0.0380], // Stepney Green
      [51.5270, -0.0150]  // Bow Church
    ]
  },
  {
    id: 'QW-1',
    name: 'Quietway 1 (Waterloo to Greenwich Park)',
    type: 'quietway',
    length_km: 9.1,
    surface_type: 'Low-Traffic Calmed Green Corridor',
    daily_cyclist_volume: 6400,
    coordinates: [
      [51.5030, -0.1130], // Waterloo
      [51.4980, -0.0890], // Bermondsey North
      [51.4910, -0.0620], // South Bermondsey
      [51.4820, -0.0350], // Deptford
      [51.4780, -0.0010]  // Greenwich
    ]
  },
  {
    id: 'QW-2',
    name: 'Quietway 2 (Bloomsbury to Walthamstow via Hackney)',
    type: 'quietway',
    length_km: 12.4,
    surface_type: 'Filtered Permeability Cycle Track',
    daily_cyclist_volume: 8200,
    coordinates: [
      [51.5230, -0.1260], // Russell Square
      [51.5280, -0.0980], // Angel / Islington
      [51.5380, -0.0710], // Haggerston / Regent\'s Canal
      [51.5450, -0.0550], // London Fields
      [51.5540, -0.0350]  // Hackney Central
    ]
  },
  {
    id: 'C-27',
    name: 'Cycleway 27 (Marylebone to Paddington Canal Path)',
    type: 'protected_lane',
    length_km: 5.8,
    surface_type: 'Canal Towpath & Protected Track',
    daily_cyclist_volume: 5900,
    coordinates: [
      [51.5220, -0.1550], // Baker Street
      [51.5180, -0.1760], // Paddington Basin
      [51.5240, -0.1980], // Little Venice
      [51.5290, -0.2150]  // Westbourne Park
    ]
  }
];

export const RAW_CANDIDATE_LOCATIONS_DATABASE: Omit<CandidateLocation, 'overallScore' | 'status' | 'cyclingScore' | 'demandScore' | 'saturationScore' | 'revenuePotentialScore' | 'explanation' | 'keyStrengths' | 'risks'>[] = [
  {
    id: 'cand-01',
    name: 'Blackfriars North Forecourt & Cycleway Hub',
    city: 'London',
    area: 'Blackfriars / Fleet St Corridor',
    latitude: 51.5118,
    longitude: -0.1039,
    nearestBikeRouteDistMeters: 18,
    nearestBikeRouteName: 'Intersection CS-3 (East-West) & CS-6 (North-South)',
    bikeRouteDensityKm: 3.4,
    dailyCyclistVolumeEstimate: 16800,
    existingStoresWithin1km: 0,
    nearestExistingStoreDistKm: 1.25,
    avgFootTrafficPerHour: 1420,
    estimatedMonthlyRevenue: 98500,
    estimatedMonthlyOrders: 18400,
    commercialRentIndex: 78
  },
  {
    id: 'cand-02',
    name: 'London Fields - Broadway Market West',
    city: 'London',
    area: 'Hackney / London Fields',
    latitude: 51.5398,
    longitude: -0.0595,
    nearestBikeRouteDistMeters: 35,
    nearestBikeRouteName: 'Quietway 2 & Regent\'s Canal Cycleway',
    bikeRouteDensityKm: 2.8,
    dailyCyclistVolumeEstimate: 9400,
    existingStoresWithin1km: 0,
    nearestExistingStoreDistKm: 2.1,
    avgFootTrafficPerHour: 980,
    estimatedMonthlyRevenue: 86200,
    estimatedMonthlyOrders: 15100,
    commercialRentIndex: 58
  },
  {
    id: 'cand-03',
    name: 'Angel Islington - St John Street Junction',
    city: 'London',
    area: 'Islington',
    latitude: 51.5312,
    longitude: -0.1055,
    nearestBikeRouteDistMeters: 80,
    nearestBikeRouteName: 'CS-6 North Extension / Upper St Cycle Corridor',
    bikeRouteDensityKm: 2.3,
    dailyCyclistVolumeEstimate: 8700,
    existingStoresWithin1km: 0,
    nearestExistingStoreDistKm: 1.85,
    avgFootTrafficPerHour: 1250,
    estimatedMonthlyRevenue: 89400,
    estimatedMonthlyOrders: 16200,
    commercialRentIndex: 72
  },
  {
    id: 'cand-04',
    name: 'Bermondsey Street - Ropewalk Arterial',
    city: 'London',
    area: 'Bermondsey / London Bridge South',
    latitude: 51.5005,
    longitude: -0.0825,
    nearestBikeRouteDistMeters: 95,
    nearestBikeRouteName: 'Quietway 1 & C4 Protected Route',
    bikeRouteDensityKm: 2.1,
    dailyCyclistVolumeEstimate: 6900,
    existingStoresWithin1km: 1, // CS-104 is 0.95km away
    nearestExistingStoreDistKm: 0.95,
    avgFootTrafficPerHour: 860,
    estimatedMonthlyRevenue: 74800,
    estimatedMonthlyOrders: 13200,
    commercialRentIndex: 62
  },
  {
    id: 'cand-05',
    name: 'Paddington Basin - Grand Union Canal Path',
    city: 'London',
    area: 'Paddington',
    latitude: 51.5195,
    longitude: -0.1740,
    nearestBikeRouteDistMeters: 45,
    nearestBikeRouteName: 'Cycleway 27 & Canal Towpath',
    bikeRouteDensityKm: 1.9,
    dailyCyclistVolumeEstimate: 6100,
    existingStoresWithin1km: 0,
    nearestExistingStoreDistKm: 2.9,
    avgFootTrafficPerHour: 1100,
    estimatedMonthlyRevenue: 81500,
    estimatedMonthlyOrders: 14700,
    commercialRentIndex: 75
  },
  {
    id: 'cand-06',
    name: 'King\'s Cross - York Way Cycleway',
    city: 'London',
    area: 'King\'s Cross / St Pancras',
    latitude: 51.5340,
    longitude: -0.1220,
    nearestBikeRouteDistMeters: 25,
    nearestBikeRouteName: 'CS-6 Northern Terminus & C6',
    bikeRouteDensityKm: 2.5,
    dailyCyclistVolumeEstimate: 11200,
    existingStoresWithin1km: 0,
    nearestExistingStoreDistKm: 2.4,
    avgFootTrafficPerHour: 1650,
    estimatedMonthlyRevenue: 94100,
    estimatedMonthlyOrders: 17600,
    commercialRentIndex: 88
  },
  {
    id: 'cand-07',
    name: 'Holborn Viaduct - Chancery Lane',
    city: 'London',
    area: 'Holborn',
    latitude: 51.5175,
    longitude: -0.1090,
    nearestBikeRouteDistMeters: 140,
    nearestBikeRouteName: 'Farringdon C6 Link',
    bikeRouteDensityKm: 1.6,
    dailyCyclistVolumeEstimate: 5400,
    existingStoresWithin1km: 1, // CS-101 is 0.88km away
    nearestExistingStoreDistKm: 0.88,
    avgFootTrafficPerHour: 1300,
    estimatedMonthlyRevenue: 79200,
    estimatedMonthlyOrders: 13900,
    commercialRentIndex: 82
  }
];

export const BIGQUERY_TABLE_SCHEMAS = [
  {
    dataset: 'coffee_expansion_lab',
    table: 'business_stores_performance',
    description: 'Internal operational metrics, sales figures, foot-traffic, and geographic locations of all current company coffee shops.',
    columns: [
      { name: 'store_id', type: 'STRING', description: 'Unique identifier for coffee shop' },
      { name: 'store_name', type: 'STRING', description: 'Commercial store display name' },
      { name: 'city', type: 'STRING', description: 'City location' },
      { name: 'area', type: 'STRING', description: 'Urban neighborhood or district' },
      { name: 'latitude', type: 'FLOAT64', description: 'WGS84 latitude coordinate' },
      { name: 'longitude', type: 'FLOAT64', description: 'WGS84 longitude coordinate' },
      { name: 'monthly_sales', type: 'NUMERIC', description: 'Average monthly gross revenue in GBP' },
      { name: 'daily_customers', type: 'INT64', description: 'Average weekday customer transactions' },
      { name: 'store_age_months', type: 'INT64', description: 'Operational age in months' },
      { name: 'rating', type: 'FLOAT64', description: 'Customer satisfaction score (1.0 - 5.0)' }
    ]
  },
  {
    dataset: 'bigquery-public-data.london_bicycles',
    table: 'cycle_routes_and_spatial_network',
    description: 'Public mobility dataset detailing Cycle Superhighways, Quietways, daily cyclist counts, and segregated path infrastructure.',
    columns: [
      { name: 'route_id', type: 'STRING', description: 'Official Transport network route ID' },
      { name: 'route_name', type: 'STRING', description: 'Public route title (e.g. CS-3, CS-6, QW-1)' },
      { name: 'route_type', type: 'STRING', description: 'Classification: cycle_superhighway, quietway, protected_lane' },
      { name: 'route_length_km', type: 'FLOAT64', description: 'Total length of route in kilometers' },
      { name: 'surface_type', type: 'STRING', description: 'Infrastructure material description' },
      { name: 'daily_cyclist_volume', type: 'INT64', description: 'Average daily cyclist flow through monitored sensors' },
      { name: 'route_geometry', type: 'GEOGRAPHY', description: 'GeoJSON / WKT spatial representation of path' }
    ]
  },
  {
    dataset: 'coffee_expansion_lab',
    table: 'candidate_zones_spatial_index',
    description: 'Pre-screened commercial parcels and junction points undergoing strategic expansion feasibility analysis.',
    columns: [
      { name: 'candidate_id', type: 'STRING', description: 'Candidate parcel ID' },
      { name: 'parcel_name', type: 'STRING', description: 'Commercial location title' },
      { name: 'area', type: 'STRING', description: 'Borough or district' },
      { name: 'latitude', type: 'FLOAT64', description: 'Latitude centroid' },
      { name: 'longitude', type: 'FLOAT64', description: 'Longitude centroid' },
      { name: 'avg_foot_traffic_per_hour', type: 'INT64', description: 'Pedestrian flow sensor average' },
      { name: 'commercial_rent_index', type: 'INT64', description: 'Relative lease rate benchmark (1-100)' }
    ]
  }
];
