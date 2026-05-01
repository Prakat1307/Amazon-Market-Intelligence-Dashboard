export interface AspectSentiment {
  [key: string]: number;
}

export interface TrustSignals {
  suspiciousRepetition: number;
  ratingSkew: number;
  verifiedPurchasePercent: number;
  reviewRecencyScore: number;
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  price: number;
  listPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  category: 'hard' | 'soft' | 'duffle';
  size: 'carry-on' | 'medium' | 'large';
  sentimentScore: number;
  topComplaints: string[];
  topPraise: string[];
  reviewSynthesis: string;
  aspects: AspectSentiment;
  trust: TrustSignals;
}

export interface BrandProfile {
  id: string;
  name: string;
  color: string;
  positioning: string;
  description: string;
  topPros: string[];
  topCons: string[];
  aspectSentiment: AspectSentiment;
}

export interface AgentInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'insight' | 'recommendation';
  severity: 'high' | 'medium' | 'low';
  relatedBrands: string[];
}

export interface FilterState {
  selectedBrands: string[];
  priceRange: [number, number];
  minRating: number;
  minSentiment: number;
  category: string;
  size: string;
}

export type ViewType = 'overview' | 'comparison' | 'products' | 'insights';

export const ASPECT_LABELS: Record<string, string> = {
  wheels: 'Wheels',
  handle: 'Handle',
  material: 'Material',
  zipper: 'Zipper',
  size: 'Capacity',
  durability: 'Durability',
  lock: 'Lock',
  design: 'Design',
  valueForMoney: 'Value for ₹',
  weight: 'Weight',
};
