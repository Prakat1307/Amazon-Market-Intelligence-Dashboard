import { useState, useMemo } from 'react';
import type { Product, BrandProfile } from '../types';
import { ASPECT_LABELS } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter,
  ZAxis, CartesianGrid, Cell, Legend,
} from 'recharts';
import {
  ArrowUpDown,
  Star,
  IndianRupee,

  TrendingUp,
  MessageSquare,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ComparisonViewProps {
  activeBrands: BrandProfile[];
  brandStatsMap: Record<string, any>;
  filteredProducts: Product[];
}

type SortField = 'avgPrice' | 'avgDiscount' | 'avgRating' | 'totalReviews' | 'avgSentiment';
type SortDir = 'asc' | 'desc';

export default function ComparisonView({ activeBrands, brandStatsMap, filteredProducts }: ComparisonViewProps) {
  const [sortField, setSortField] = useState<SortField>('avgSentiment');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedAspect, setSelectedAspect] = useState<string>('all');

  const comparisonData = useMemo(() =>
    activeBrands.map(b => ({
      brand: b,
      stats: brandStatsMap[b.id],
    })).filter(d => d.stats !== null),
    [activeBrands, brandStatsMap]
  );

  const sortedData = useMemo(() => {
    return [...comparisonData].sort((a, b) => {
      const aVal = a.stats[sortField] ?? 0;
      const bVal = b.stats[sortField] ?? 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [comparisonData, sortField, sortDir]);

  const scatterData = useMemo(() =>
    filteredProducts.map(p => {
      const brand = activeBrands.find(b => b.id === p.brandId);
      return {
        x: p.price,
        y: p.sentimentScore,
        z: p.reviewCount,
        brand: brand?.name ?? '',
        color: brand?.color ?? '#888',
        title: p.title,
        rating: p.rating,
      };
    }),
    [filteredProducts, activeBrands]
  );

  const aspectChartData = useMemo(() => {
    if (selectedAspect === 'all') {
      const aspects = Object.keys(ASPECT_LABELS);
      return aspects.map(aspect => {
        const entry: Record<string, string | number> = { aspect: ASPECT_LABELS[aspect] };
        activeBrands.forEach(b => {
          const brandProducts = filteredProducts.filter(p => p.brandId === b.id);
          const avg = brandProducts.length > 0
            ? Math.round(brandProducts.reduce((s, p) => s + (p.aspects[aspect] ?? 0), 0) / brandProducts.length)
            : 0;
          entry[b.name] = avg;
        });
        return entry;
      });
    }
    const entry: Record<string, string | number> = { aspect: ASPECT_LABELS[selectedAspect] || selectedAspect };
    activeBrands.forEach(b => {
      const brandProducts = filteredProducts.filter(p => p.brandId === b.id);
      const avg = brandProducts.length > 0
        ? Math.round(brandProducts.reduce((s, p) => s + (p.aspects[selectedAspect] ?? 0), 0) / brandProducts.length)
        : 0;
      entry[b.name] = avg;
    });
    return [entry];
  }, [activeBrands, filteredProducts, selectedAspect]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getWinner = (field: SortField) => {
    if (comparisonData.length === 0) return null;
    const winner = [...comparisonData].sort((a, b) => {
      if (field === 'avgDiscount') return b.stats[field] - a.stats[field];
      if (field === 'avgPrice') return a.stats[field] - b.stats[field];
      return b.stats[field] - a.stats[field];
    })[0];
    return winner?.brand.name ?? null;
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition ${
        sortField === field ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {label}
      {sortField === field ? (
        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      ) : (
        <ArrowUpDown size={10} className="opacity-40" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Brand Comparison</h2>
        <p className="text-sm text-gray-500 mt-1">Side-by-side competitive benchmarking across key metrics</p>
      </div>


      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3">Brand</th>
                <th className="text-center px-3 py-3"><SortButton field="avgPrice" label="Avg Price" /></th>
                <th className="text-center px-3 py-3"><SortButton field="avgDiscount" label="Avg Discount" /></th>
                <th className="text-center px-3 py-3"><SortButton field="avgRating" label="Avg Rating" /></th>
                <th className="text-center px-3 py-3"><SortButton field="totalReviews" label="Total Reviews" /></th>
                <th className="text-center px-3 py-3"><SortButton field="avgSentiment" label="Sentiment" /></th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-600">Sentiment/₹</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(({ brand, stats }, idx) => {
                const isTopSentiment = stats.avgSentiment === Math.max(...comparisonData.map(d => d.stats.avgSentiment));
                const isTopRating = stats.avgRating === Math.max(...comparisonData.map(d => d.stats.avgRating));
                const isBestValue = stats.sentimentPerRupee === Math.max(...comparisonData.map(d => d.stats.sentimentPerRupee));
                return (
                  <tr key={brand.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${idx === 0 ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: brand.color }}>
                          {brand.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{brand.name}</p>
                          <p className="text-[10px] text-gray-400">{brand.positioning}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">₹{stats.avgPrice.toLocaleString()}</span>
                      <p className="text-[10px] text-gray-400">₹{stats.priceMin.toLocaleString()} — ₹{stats.priceMax.toLocaleString()}</p>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-sm font-semibold text-amber-600">{stats.avgDiscount}%</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-gray-900">{stats.avgRating}</span>
                        {isTopRating && <Trophy size={10} className="text-amber-500" />}
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">{(stats.totalReviews / 1000).toFixed(1)}K</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stats.avgSentiment}%`,
                              backgroundColor: stats.avgSentiment >= 75 ? '#10B981' : stats.avgSentiment >= 60 ? '#3B82F6' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold" style={{ color: stats.avgSentiment >= 75 ? '#10B981' : stats.avgSentiment >= 60 ? '#3B82F6' : '#EF4444' }}>
                          {stats.avgSentiment}
                        </span>
                        {isTopSentiment && <Trophy size={10} className="text-amber-500" />}
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">{stats.sentimentPerRupee}</span>
                        {isBestValue && <Trophy size={10} className="text-emerald-500" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Price vs Sentiment (Bubble = Reviews)</h3>
          <p className="text-[10px] text-gray-400 mb-3">Brands in the top-left quadrant offer the best value</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="x"
                type="number"
                name="Price"
                tick={{ fontSize: 10 }}
                tickFormatter={v => `₹${(v / 1000).toFixed(1)}K`}
                label={{ value: 'Price (₹)', position: 'insideBottom', offset: -5, fontSize: 10 }}
              />
              <YAxis
                dataKey="y"
                type="number"
                name="Sentiment"
                domain={[30, 100]}
                tick={{ fontSize: 10 }}
                label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }}
              />
              <ZAxis dataKey="z" range={[50, 800]} name="Reviews" />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                formatter={((value: any, name: any) => {
                  if (name === 'Price') return [`₹${Number(value).toLocaleString()}`, name];
                  if (name === 'Sentiment') return [value, name];
                  return [Number(value).toLocaleString(), name];
                }) as any}
                labelFormatter={() => ''}
              />
              <Scatter data={scatterData} fillOpacity={0.7}>
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3">
            {activeBrands.map(b => (
              <span key={b.id} className="flex items-center gap-1 text-[10px] text-gray-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                {b.name}
              </span>
            ))}
          </div>
        </div>


        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Aspect-Level Sentiment</h3>
            <select
              value={selectedAspect}
              onChange={e => setSelectedAspect(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Aspects</option>
              {Object.entries(ASPECT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aspectChartData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="aspect" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              {activeBrands.map(b => (
                <Bar key={b.id} dataKey={b.name} fill={b.color} radius={[0, 4, 4, 0]} barSize={12} />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
          <Trophy size={14} className="text-amber-500" /> Winner Highlights
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WinnerCard label="Highest Sentiment" winner={getWinner('avgSentiment') ?? '-'} metric="sentiment" />
          <WinnerCard label="Best Rating" winner={getWinner('avgRating') ?? '-'} metric="rating" />
          <WinnerCard label="Most Reviews" winner={getWinner('totalReviews') ?? '-'} metric="reviews" />
          <WinnerCard label="Best Value (Sentiment/₹)" winner={
            comparisonData.length > 0
              ? [...comparisonData].sort((a, b) => b.stats.sentimentPerRupee - a.stats.sentimentPerRupee)[0]?.brand.name ?? '-'
              : '-'
          } metric="value" />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeBrands.map(brand => (
          <div key={brand.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brand.color }}>
                {brand.name.charAt(0)}
              </div>
              <h4 className="text-sm font-bold text-gray-900">{brand.name}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-1.5">Top Pros</p>
                {brand.topPros.slice(0, 4).map((pro, i) => (
                  <p key={i} className="text-xs text-gray-600 mb-1 flex items-start gap-1">
                    <span className="text-emerald-500 mt-0.5">+</span> {pro}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-red-600 uppercase mb-1.5">Top Cons</p>
                {brand.topCons.slice(0, 4).map((con, i) => (
                  <p key={i} className="text-xs text-gray-600 mb-1 flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">−</span> {con}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WinnerCard({ label, winner, metric }: { label: string; winner: string; metric: string }) {
  const icons: Record<string, React.ReactNode> = {
    sentiment: <TrendingUp size={16} className="text-emerald-600" />,
    rating: <Star size={16} className="text-amber-500" />,
    reviews: <MessageSquare size={16} className="text-blue-600" />,
    value: <IndianRupee size={16} className="text-purple-600" />,
  };
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-3 text-center">
      <div className="flex justify-center mb-2">{icons[metric]}</div>
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900">{winner}</p>
    </div>
  );
}
