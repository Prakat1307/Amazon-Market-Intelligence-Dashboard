import { useState, useMemo, useEffect } from 'react';
import type { FilterState, ViewType, Product, BrandProfile, AgentInsight } from './types';
import { getFilteredProducts, getBrandStats } from './utils/helpers';
import Sidebar from './components/Sidebar';
import OverviewView from './components/OverviewView';
import ComparisonView from './components/ComparisonView';
import ProductsView from './components/ProductsView';
import InsightsView from './components/InsightsView';

const defaultFilters: FilterState = {
  selectedBrands: [],
  priceRange: [0, 15000],
  minRating: 0,
  minSentiment: 0,
  category: 'all',
  size: 'all',
};

export default function App() {
  const [view, setView] = useState<ViewType>('overview');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [brandsData, setBrandsData] = useState<BrandProfile[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [insightsData, setInsightsData] = useState<AgentInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/data`);
        if (res.ok) {
          const data = await res.json();
          if (data.brands && data.products) {
            setBrandsData(data.brands);
            setProductsData(data.products);
            setInsightsData(data.insights || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch from backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => getFilteredProducts(filters, productsData), [filters, productsData]);

  const activeBrands = useMemo(() => {
    const brandIds = filters.selectedBrands.length > 0
      ? filters.selectedBrands
      : brandsData.map(b => b.id);
    return brandsData.filter(b => brandIds.includes(b.id));
  }, [filters.selectedBrands, brandsData]);

  const brandStatsMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof getBrandStats>> = {};
    for (const brand of activeBrands) {
      map[brand.id] = getBrandStats(brand.id, productsData);
    }
    return map;
  }, [activeBrands, productsData]);

  const globalStats = useMemo(() => {
    const fp = filteredProducts;
    return {
      totalBrands: new Set(fp.map(p => p.brandId)).size,
      totalProducts: fp.length,
      totalReviews: fp.reduce((s, p) => s + p.reviewCount, 0),
      avgSentiment: fp.length > 0 ? Math.round(fp.reduce((s, p) => s + p.sentimentScore, 0) / fp.length) : 0,
      avgPrice: fp.length > 0 ? Math.round(fp.reduce((s, p) => s + p.price, 0) / fp.length) : 0,
      avgDiscount: fp.length > 0 ? Math.round(fp.reduce((s, p) => s + p.discount, 0) / fp.length) : 0,
    };
  }, [filteredProducts]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl font-semibold text-gray-600 animate-pulse">Loading Intelligence Dashboard...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        filters={filters}
        setFilters={setFilters}
        view={view}
        setView={setView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        brandsData={brandsData}
        productsData={productsData}
      />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-16'}`}>
        <div className="p-6 max-w-[1600px] mx-auto">
          {view === 'overview' && (
            <OverviewView
              globalStats={globalStats}
              activeBrands={activeBrands}
              brandStatsMap={brandStatsMap}
              filteredProducts={filteredProducts}
            />
          )}
          {view === 'comparison' && (
            <ComparisonView
              activeBrands={activeBrands}
              brandStatsMap={brandStatsMap}
              filteredProducts={filteredProducts}
            />
          )}
          {view === 'products' && (
            <ProductsView filteredProducts={filteredProducts} brandsData={brandsData} />
          )}
          {view === 'insights' && (
            <InsightsView activeBrands={activeBrands} insightsData={insightsData} />
          )}
        </div>
      </main>
    </div>
  );
}
