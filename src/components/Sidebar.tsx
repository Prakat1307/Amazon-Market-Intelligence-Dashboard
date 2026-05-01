import { useState } from 'react';
import type { FilterState, ViewType } from '../types';

import {
  LayoutDashboard,
  GitCompareArrows,
  Package,
  Lightbulb,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
} from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  view: ViewType;
  setView: (v: ViewType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  brandsData: any[];
  productsData: any[];
}

const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'comparison', label: 'Compare', icon: <GitCompareArrows size={18} /> },
  { id: 'products', label: 'Products', icon: <Package size={18} /> },
  { id: 'insights', label: 'Agent Insights', icon: <Lightbulb size={18} /> },
];

export default function Sidebar({ filters, setFilters, view, setView, sidebarOpen, setSidebarOpen, brandsData, productsData }: SidebarProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);

  const toggleBrand = (id: string) => {
    setFilters(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(id)
        ? prev.selectedBrands.filter(b => b !== id)
        : [...prev.selectedBrands, id],
    }));
  };

  const clearFilters = () => {
    setFilters({
      selectedBrands: [],
      priceRange: [0, 15000],
      minRating: 0,
      minSentiment: 0,
      category: 'all',
      size: 'all',
    });
  };

  const hasActiveFilters =
    filters.selectedBrands.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 15000 ||
    filters.minRating > 0 ||
    filters.minSentiment > 0 ||
    filters.category !== 'all' ||
    filters.size !== 'all';

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 flex flex-col ${
        sidebarOpen ? 'w-72' : 'w-16'
      }`}
    >

      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">LQ</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">LuggageIQ</h1>
              <p className="text-[10px] text-gray-400">Amazon India Intel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>


      <nav className="p-2 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              view === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>


      {sidebarOpen && (
        <>
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <Filter size={12} />
                Filters
              </span>
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">

              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Brands</label>
                <div className="space-y-1.5">
                  {brandsData.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => toggleBrand(brand.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.selectedBrands.includes(brand.id)
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: brand.color }}
                      />
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>


              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Price Range: ₹{filters.priceRange[0].toLocaleString()} — ₹{filters.priceRange[1].toLocaleString()}
                </label>
                <input
                  type="range"
                  min={0}
                  max={15000}
                  step={500}
                  value={filters.priceRange[1]}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Number(e.target.value)] }))
                  }
                  className="w-full accent-blue-600"
                />
              </div>


              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Minimum Rating: {filters.minRating > 0 ? `≥ ${filters.minRating}` : 'Any'}
                </label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={filters.minRating}
                  onChange={e => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>


              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Min Sentiment: {filters.minSentiment > 0 ? `≥ ${filters.minSentiment}` : 'Any'}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={filters.minSentiment}
                  onChange={e => setFilters(prev => ({ ...prev, minSentiment: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                  <span>Poor</span>
                  <span>Avg</span>
                  <span>Exc</span>
                </div>
              </div>


              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Category</label>
                <select
                  value={filters.category}
                  onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="hard">Hard Shell</option>
                  <option value="soft">Soft Shell</option>
                  <option value="duffle">Duffle</option>
                </select>
              </div>


              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">Size</label>
                <select
                  value={filters.size}
                  onChange={e => setFilters(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sizes</option>
                  <option value="carry-on">Carry-On (≤56cm)</option>
                  <option value="medium">Medium (57-70cm)</option>
                  <option value="large">Large (71cm+)</option>
                </select>
              </div>


              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                >
                  <X size={12} />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </>
      )}


      {sidebarOpen && (
        <div className="p-4 border-t border-gray-100 space-y-3">
          <button
            onClick={() => {
              const csvRows = [
                ['id', 'brandId', 'brandName', 'title', 'price', 'listPrice', 'discount', 'rating', 'reviewCount', 'category', 'size', 'sentimentScore', 'topComplaints', 'topPraise', 'reviewSynthesis', 'wheels', 'handle', 'material', 'zipper', 'size_aspect', 'durability', 'lock', 'design', 'valueForMoney', 'weight', 'suspiciousRepetition', 'ratingSkew', 'verifiedPurchasePercent', 'reviewRecencyScore'].join(','),
                ...productsData.map(p =>
                  [
                    p.id, p.brandId, p.brandName, `"${p.title}"`, p.price, p.listPrice, p.discount, p.rating, p.reviewCount, p.category, p.size, p.sentimentScore,
                    `"${p.topComplaints.join('; ')}"`, `"${p.topPraise.join('; ')}"`, `"${p.reviewSynthesis}"`,
                    p.aspects.wheels, p.aspects.handle, p.aspects.material, p.aspects.zipper, p.aspects.size, p.aspects.durability, p.aspects.lock, p.aspects.design, p.aspects.valueForMoney, p.aspects.weight,
                    p.trust.suspiciousRepetition, p.trust.ratingSkew, p.trust.verifiedPurchasePercent, p.trust.reviewRecencyScore,
                  ].join(',')
                ),
              ].join('\n');
              const blob = new Blob([csvRows], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'luggageiq_dataset.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <Download size={12} />
            Export Dataset (CSV)
          </button>
          <p className="text-[10px] text-gray-400 text-center">
            Data sourced from Amazon India<br />
            72 products · 50K+ reviews · Jan 2025
          </p>
        </div>
      )}
    </aside>
  );
}
