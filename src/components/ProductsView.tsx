import { useState, useMemo } from 'react';
import type { Product } from '../types';
import { ASPECT_LABELS } from '../types';

import {
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  ThumbsUp,
  AlertTriangle,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductsViewProps {
  filteredProducts: Product[];
  brandsData: any[];
}

type ProductSortField = 'price' | 'discount' | 'rating' | 'reviewCount' | 'sentimentScore';

export default function ProductsView({ filteredProducts, brandsData }: ProductsViewProps) {
  const [sortField, setSortField] = useState<ProductSortField>('sentimentScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return filteredProducts;
    const q = searchQuery.toLowerCase();
    return filteredProducts.filter(p =>
      p.title.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q)
    );
  }, [filteredProducts, searchQuery]);

  const sorted = useMemo(() => {
    return [...searched].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [searched, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getBrandColor = (brandId: string) => {
    return brandsData.find(b => b.id === brandId)?.color ?? '#888';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 65) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Drilldown</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} products match current filters</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search products..."
            className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>


      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium">Sort by:</span>
        {([
          ['sentimentScore', 'Sentiment'],
          ['rating', 'Rating'],
          ['price', 'Price'],
          ['discount', 'Discount'],
          ['reviewCount', 'Reviews'],
        ] as [ProductSortField, string][]).map(([field, label]) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition ${
              sortField === field ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
            }`}
          >
            {label}
            {sortField === field ? (
              sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
            ) : null}
          </button>
        ))}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginated.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: getBrandColor(product.brandId) }}
                >
                  {product.brandName.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400">{product.brandName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    color: getSentimentColor(product.sentimentScore),
                    backgroundColor: `${getSentimentColor(product.sentimentScore)}15`,
                  }}
                >
                  {product.sentimentScore}
                </span>
              </div>
            </div>

            <h4 className="text-xs font-medium text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition">
              {product.title}
            </h4>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              <span className="text-xs text-gray-400 line-through">₹{product.listPrice.toLocaleString()}</span>
              <span className="text-xs font-semibold text-emerald-600">-{product.discount}%</span>
            </div>

            <div className="flex items-center gap-4 text-xs mb-3">
              <span className="flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold">{product.rating}</span>
              </span>
              <span className="text-gray-400">{product.reviewCount.toLocaleString()} reviews</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                product.category === 'hard' ? 'bg-blue-50 text-blue-600' :
                product.category === 'soft' ? 'bg-purple-50 text-purple-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {product.category}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 text-[10px] font-medium">
                {product.size}
              </span>
            </div>


            <div className="space-y-1.5">
              {['durability', 'wheels', 'valueForMoney'].map(aspect => (
                <div key={aspect} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-16">{ASPECT_LABELS[aspect]}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${product.aspects[aspect]}%`,
                        backgroundColor: getSentimentColor(product.aspects[aspect]),
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 w-6 text-right">{product.aspects[aspect]}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-gray-400" />
                <span className="text-[10px] text-gray-400">{product.trust.verifiedPurchasePercent}% verified</span>
              </div>
              <span className="text-[10px] text-blue-600 font-medium group-hover:underline">View details →</span>
            </div>
          </div>
        ))}
      </div>


      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-medium ${
                page === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}


      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          brandColor={getBrandColor(selectedProduct.brandId)}
        />
      )}
    </div>
  );
}

function ProductDetailModal({ product, onClose, brandColor }: { product: Product; onClose: () => void; brandColor: string }) {
  const getSentimentColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 65) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >

        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-start justify-between rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: brandColor }}>
                {product.brandName.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-500">{product.brandName}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                product.category === 'hard' ? 'bg-blue-50 text-blue-600' :
                product.category === 'soft' ? 'bg-purple-50 text-purple-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {product.category}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 text-[10px] font-medium">{product.size}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">{product.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Price</p>
              <p className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 line-through">₹{product.listPrice.toLocaleString()}</span>
                <span className="text-xs font-semibold text-emerald-600">-{product.discount}%</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Rating & Reviews</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-gray-900">{product.rating}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={14}
                      className={i <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{product.reviewCount.toLocaleString()} reviews</p>
            </div>
          </div>


          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Overall Sentiment Score</p>
              <span
                className="text-lg font-bold"
                style={{ color: getSentimentColor(product.sentimentScore) }}
              >
                {product.sentimentScore}/100
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${product.sentimentScore}%`,
                  backgroundColor: getSentimentColor(product.sentimentScore),
                }}
              />
            </div>
          </div>


          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-[10px] text-blue-600 uppercase font-medium mb-1.5">Review Synthesis</p>
            <p className="text-xs text-gray-700 leading-relaxed">{product.reviewSynthesis}</p>
          </div>


          <div>
            <p className="text-xs font-semibold text-gray-900 mb-3">Aspect-Level Sentiment</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ASPECT_LABELS).map(([key, label]) => {
                const score = product.aspects[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-2.5">
                    <span className="text-[10px] text-gray-500 w-16">{label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${score}%`,
                          backgroundColor: getSentimentColor(score),
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold w-6 text-right" style={{ color: getSentimentColor(score) }}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                <ThumbsUp size={10} /> Top Praise
              </p>
              {product.topPraise.map((p, i) => (
                <p key={i} className="text-xs text-gray-600 mb-1.5 flex items-start gap-1">
                  <span className="text-emerald-500 mt-0.5">+</span> {p}
                </p>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-red-600 uppercase mb-2 flex items-center gap-1">
                <AlertTriangle size={10} /> Top Complaints
              </p>
              {product.topComplaints.map((c, i) => (
                <p key={i} className="text-xs text-gray-600 mb-1.5 flex items-start gap-1">
                  <span className="text-red-500 mt-0.5">−</span> {c}
                </p>
              ))}
            </div>
          </div>


          <div>
            <p className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <Shield size={12} className="text-gray-500" /> Review Trust Signals
            </p>
            <div className="grid grid-cols-2 gap-3">
              <TrustMetric label="Verified Purchases" value={product.trust.verifiedPurchasePercent} suffix="%" />
              <TrustMetric label="Review Recency" value={product.trust.reviewRecencyScore} suffix="/100" />
              <TrustMetric label="Suspicious Repetition" value={product.trust.suspiciousRepetition} suffix="%" warn />
              <TrustMetric label="Rating Skew" value={product.trust.ratingSkew} suffix="/100" warn />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustMetric({ label, value, suffix, warn }: { label: string; value: number; suffix: string; warn?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className={`text-sm font-bold ${warn && value > 10 ? 'text-amber-600' : 'text-gray-900'}`}>
        {value}{suffix}
      </p>
    </div>
  );
}
