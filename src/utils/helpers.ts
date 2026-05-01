import type { Product } from '../types';

export function getBrandProducts(brandId: string, sourceProducts: Product[]): Product[] {
  return sourceProducts.filter(p => p.brandId === brandId);
}

export function getFilteredProducts(filters: {
  selectedBrands: string[];
  priceRange: [number, number];
  minRating: number;
  minSentiment: number;
  category: string;
  size: string;
}, sourceProducts: Product[]): Product[] {
  return sourceProducts.filter(p => {
    if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(p.brandId)) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    if (p.rating < filters.minRating) return false;
    if (p.sentimentScore < filters.minSentiment) return false;
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.size !== 'all' && p.size !== filters.size) return false;
    return true;
  });
}

export function getBrandStats(brandId: string, sourceProducts: Product[]) {
  const brandProducts = getBrandProducts(brandId, sourceProducts);
  if (brandProducts.length === 0) return null;

  const avgPrice = Math.round(brandProducts.reduce((s, p) => s + p.price, 0) / brandProducts.length);
  const avgListPrice = Math.round(brandProducts.reduce((s, p) => s + p.listPrice, 0) / brandProducts.length);
  const avgDiscount = Math.round(brandProducts.reduce((s, p) => s + p.discount, 0) / brandProducts.length);
  const avgRating = Math.round(brandProducts.reduce((s, p) => s + p.rating, 0) / brandProducts.length * 10) / 10;
  const totalReviews = brandProducts.reduce((s, p) => s + p.reviewCount, 0);
  const avgSentiment = Math.round(brandProducts.reduce((s, p) => s + p.sentimentScore, 0) / brandProducts.length);

  return {
    avgPrice,
    avgListPrice,
    avgDiscount,
    avgRating,
    totalReviews,
    avgSentiment,
    productCount: brandProducts.length,
    priceMin: Math.min(...brandProducts.map(p => p.price)),
    priceMax: Math.max(...brandProducts.map(p => p.price)),
    sentimentPerRupee: Math.round((avgSentiment / avgPrice) * 10000) / 10,
  };
}
