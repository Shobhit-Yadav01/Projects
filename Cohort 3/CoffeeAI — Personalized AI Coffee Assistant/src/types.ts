export type TemperatureType = 'Hot' | 'Cold' | 'Both' | 'Warm or Ambient' | 'Fresh Made';
export type SweetnessLevelType = 'Unsweetened' | 'Low' | 'Low-Medium' | 'Medium' | 'Sweet' | 'Savory';
export type CaffeineLevelType = 'None' | 'Low' | 'Medium' | 'High' | 'Decaf';

export interface SizeOption {
  name: string;
  price: number;
  caffeineMg?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  sizes: SizeOption[];
  temperature: TemperatureType;
  sweetnessLevel: SweetnessLevelType;
  defaultSweetnessPercent: number;
  caffeineLevel: CaffeineLevelType;
  caffeineMg: number;
  calories: number;
  milkOptions: string[];
  dietaryTags: string[];
  ingredients: string[];
  flavorNotes: string[];
  roastLevel: string;
  popularity: number;
  isFeatured: boolean;
  imageUrl: string;
  availability: Record<string, boolean>;
}

export interface CustomerPreferences {
  favoriteCategory: string;
  preferredTemperature: string;
  sweetnessLevel: string;
  sweetnessPercent: number;
  milkPreference: string;
  dietaryPreferences: string[];
  caffeinePreference?: string;
  favoriteProductIds: string[];
  dislikedIngredients?: string[];
  notes?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  membershipTier: string;
  loyaltyPoints: number;
  preferences: CustomerPreferences;
  createdAt?: string;
}

export interface OrderItemCustomizations {
  temperature?: string;
  milk?: string;
  sweetness?: string;
  ice?: string;
  warming?: string;
  extra?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  unitPrice: number;
  quantity: number;
  customizations?: OrderItemCustomizations;
  itemTotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  createdAt: string;
  status: 'Pending' | 'Brewing' | 'Ready' | 'Completed' | 'Cancelled';
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  pointsEarned: number;
}

export interface OfferPromotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent?: number;
  discountValue?: number;
  pointsMultiplier?: number;
  eligibleCategories: string[];
  validUntil: string;
  active: boolean;
  badge: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: {
    monday_friday: string;
    saturday_sunday: string;
  };
  features: string[];
  currentWaitMinutes: number;
  hasNitroTap: boolean;
  hasDriveThru: boolean;
  rating: number;
  reviewCount: number;
}

export interface RecommendationCard {
  productId: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  matchScore?: number;
  reason: string;
  matchingTags: string[];
  temperature?: string;
  sweetnessLevel?: string;
  caffeineMg?: number;
}

export interface GroundingSource {
  title: string;
  type: 'menu' | 'customer_profile' | 'order_history' | 'offers' | 'store_info' | 'faq';
  snippet: string;
  confidence?: number;
  id?: string;
}

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, any>;
  resultSummary: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  recommendations?: RecommendationCard[];
  sources?: GroundingSource[];
  toolCalls?: ToolCallRecord[];
  groundingTag?: string;
  isError?: boolean;
}

export interface ChatApiRequest {
  customerId: string;
  message: string;
  conversationId?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatApiResponse {
  response: string;
  recommendations: RecommendationCard[];
  sources: GroundingSource[];
  toolCalls: ToolCallRecord[];
  conversationId: string;
  groundingTag?: string;
  error?: string;
}
