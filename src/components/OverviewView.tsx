import { useMemo } from 'react';
import type { Product } from '../types';
import type { BrandProfile } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import {
  TrendingUp,
  Star,
  MessageSquare,
  Tag,
  IndianRupee,
  Percent,
  ShoppingBag,
  AlertTriangle,
  ThumbsUp,
} from 'lucide-react';

interface OverviewViewProps {
  globalStats: {
    totalBrands: number;
    totalProducts: number;
    totalReviews: number;
    avgSentiment: number;
    avgPrice: number;
    avgDiscount: number;
  };
  activeBrands: BrandProfile[];
  brandStatsMap: Record<string, any>;
  filteredProducts: Product[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  excellent: '#10B981',
  good: '#3B82F6',
  average: '#F59E0B',
  poor: '#EF4444',
};

function getSentimentLabel(score: number) {
  if (score >= 80) return { label: 'Excellent', color: SENTIMENT_COLORS.excellent };
  if (score >= 65) return { label: 'Good', color: SENTIMENT_COLORS.good };
  if (score >= 50) return { label: 'Average', color: SENTIMENT_COLORS.average };
  return { label: 'Poor', color: SENTIMENT_COLORS.poor };
}

export default function OverviewView({ globalStats, activeBrands, brandStatsMap, filteredProducts }: OverviewViewProps) {
  const priceData = useMemo(() =>
    activeBrands.map(b => ({
      name: b.name,
      avgPrice: brandStatsMap[b.id]?.avgPrice ?? 0,
      avgDiscount: brandStatsMap[b.id]?.avgDiscount ?? 0,
    })),
    [activeBrands, brandStatsMap]
  );

  const sentimentDistribution = useMemo(() => {
    const dist = { excellent: 0, good: 0, average: 0, poor: 0 };
    filteredProducts.forEach(p => {
      if (p.sentimentScore >= 80) dist.excellent++;
      else if (p.sentimentScore >= 65) dist.good++;
      else if (p.sentimentScore >= 50) dist.average++;
      else dist.poor++;
    });
    return [
      { name: 'Excellent (80+)', value: dist.excellent, color: SENTIMENT_COLORS.excellent },
      { name: 'Good (65-79)', value: dist.good, color: SENTIMENT_COLORS.good },
      { name: 'Average (50-64)', value: dist.average, color: SENTIMENT_COLORS.average },
      { name: 'Poor (<50)', value: dist.poor, color: SENTIMENT_COLORS.poor },
    ].filter(d => d.value > 0);
  }, [filteredProducts]);

  const radarData = useMemo(() => {
    const aspects = ['wheels', 'handle', 'material', 'durability', 'design', 'valueForMoney'];
    return aspects.map(aspect => {
      const entry: Record<string, string | number> = { aspect: aspect.charAt(0).toUpperCase() + aspect.slice(1) };
      activeBrands.forEach(b => {
        entry[b.name] = b.aspectSentiment[aspect] ?? 0;
      });
      return entry;
    });
  }, [activeBrands]);

  const topComplaintsAll = useMemo(() => {
    const complaints: Record<string, number> = {};
    filteredProducts.forEach(p => {
      p.topComplaints.forEach(c => {
        complaints[c] = (complaints[c] || 0) + 1;
      });
    });
    return Object.entries(complaints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredProducts]);

  const topPraiseAll = useMemo(() => {
    const praises: Record<string, number> = {};
    filteredProducts.forEach(p => {
      p.topPraise.forEach(c => {
        praises[c] = (praises[c] || 0) + 1;
      });
    });
    return Object.entries(praises)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredProducts]);

  const sentimentInfo = getSentimentLabel(globalStats.avgSentiment);

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          Competitive intelligence for {globalStats.totalBrands} luggage brands on Amazon India
        </p>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          icon={<ShoppingBag size={18} className="text-blue-600" />}
          label="Brands Tracked"
          value={globalStats.totalBrands.toString()}
          trend={null}
        />
        <KPICard
          icon={<Tag size={18} className="text-purple-600" />}
          label="Products Analyzed"
          value={globalStats.totalProducts.toString()}
          trend={null}
        />
        <KPICard
          icon={<MessageSquare size={18} className="text-amber-600" />}
          label="Total Reviews"
          value={`${(globalStats.totalReviews / 1000).toFixed(1)}K`}
          trend={null}
        />
        <KPICard
          icon={<TrendingUp size={18} style={{ color: sentimentInfo.color }} />}
          label="Avg Sentiment"
          value={`${globalStats.avgSentiment}/100`}
          trend={sentimentInfo.label}
          trendColor={sentimentInfo.color}
        />
        <KPICard
          icon={<IndianRupee size={18} className="text-emerald-600" />}
          label="Avg Price"
          value={`₹${globalStats.avgPrice.toLocaleString()}`}
          trend={null}
        />
        <KPICard
          icon={<Percent size={18} className="text-red-600" />}
          label="Avg Discount"
          value={`${globalStats.avgDiscount}%`}
          trend={null}
        />
      </div>


      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Market Positioning — Price Spread by Brand</h3>
          <div className="flex items-center gap-4 text-[10px] text-gray-400">

            <span className="text-gray-300">|</span>
            <span>← Budget</span>
            <span className="text-gray-300">|</span>
            <span>Premium →</span>
          </div>
        </div>
        <div className="space-y-3">
          {activeBrands
            .map(b => ({ brand: b, stats: brandStatsMap[b.id] }))
            .filter(d => d.stats)
            .sort((a, b) => b.stats.avgPrice - a.stats.avgPrice)
            .map(({ brand, stats }) => {
              const globalMax = 12000;
              const leftPct = (stats.priceMin / globalMax) * 100;
              const rightPct = ((globalMax - stats.priceMax) / globalMax) * 100;
              const avgPct = (stats.avgPrice / globalMax) * 100;
              return (
                <div key={brand.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-32 flex-shrink-0">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: brand.color }}>
                      {brand.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{brand.name}</span>
                  </div>

                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    stats.avgPrice >= 5000 ? 'bg-purple-50 text-purple-600' :
                    stats.avgPrice >= 3000 ? 'bg-blue-50 text-blue-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {stats.avgPrice >= 5000 ? 'Premium' : stats.avgPrice >= 3000 ? 'Mid-Range' : 'Budget'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Average Price & Discount by Brand</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priceData} barGap={8}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={((value: any, name: any) =>
                  name === 'avgPrice' ? [`₹${Number(value).toLocaleString()}`, 'Avg Price'] : [`${value}%`, 'Avg Discount']
                ) as any}
              />
              <Bar yAxisId="left" dataKey="avgPrice" fill="#3B82F6" radius={[4, 4, 0, 0]} name="avgPrice" />
              <Bar yAxisId="right" dataKey="avgDiscount" fill="#F59E0B" radius={[4, 4, 0, 0]} name="avgDiscount" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" /> Avg Selling Price
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500" /> Avg Discount %
            </span>
          </div>
        </div>


        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sentimentDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                stroke="none"
              >
                {sentimentDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={((value: any) => [`${value} products`, 'Count']) as any} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {sentimentDistribution.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold text-gray-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Aspect-Level Sentiment Comparison</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="aspect" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              {activeBrands.map(b => (
                <Radar
                  key={b.id}
                  name={b.name}
                  dataKey={b.name}
                  stroke={b.color}
                  fill={b.color}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>


        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <ThumbsUp size={14} className="text-emerald-600" /> Top Customer Praise
            </h3>
            <div className="space-y-2.5">
              {topPraiseAll.map(([text, count], i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{text}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(count / (topPraiseAll[0]?.[1] || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 mt-0.5">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-red-600" /> Top Customer Complaints
            </h3>
            <div className="space-y-2.5">
              {topComplaintsAll.map(([text, count], i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-red-600 mt-0.5 w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{text}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(count / (topComplaintsAll[0]?.[1] || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 mt-0.5">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Brand Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeBrands.map(brand => {
            const stats = brandStatsMap[brand.id];
            if (!stats) return null;
            return (
              <div key={brand.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brand.color }}>
                    {brand.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{brand.name}</h4>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {brand.positioning}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{brand.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">₹{stats.avgPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Avg Price</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{stats.avgDiscount}%</p>
                    <p className="text-[10px] text-gray-400">Avg Discount</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: getSentimentLabel(stats.avgSentiment).color }}>
                      {stats.avgSentiment}
                    </p>
                    <p className="text-[10px] text-gray-400">Sentiment</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-gray-700">{stats.avgRating}</span>
                  <span className="text-[10px] text-gray-400 ml-1">({stats.totalReviews.toLocaleString()} reviews)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  trend,
  trendColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string | null;
  trendColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-2">
        <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ color: trendColor, backgroundColor: `${trendColor}15` }}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
