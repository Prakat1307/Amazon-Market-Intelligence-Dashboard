import { useState } from 'react';
import type { BrandProfile } from '../types';

import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Brain,
  ArrowRight,
} from 'lucide-react';

interface InsightsViewProps {
  activeBrands: BrandProfile[];
  insightsData: any[];
}

export default function InsightsView({ activeBrands, insightsData }: InsightsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredInsights = typeFilter === 'all'
    ? insightsData
    : insightsData.filter(i => i.type === typeFilter);

  const typeIcons: Record<string, React.ReactNode> = {
    insight: <Lightbulb size={14} className="text-blue-600" />,
    warning: <AlertTriangle size={14} className="text-amber-600" />,
    opportunity: <TrendingUp size={14} className="text-emerald-600" />,
    recommendation: <Target size={14} className="text-purple-600" />,
  };

  const typeLabels: Record<string, string> = {
    insight: 'Insight',
    warning: 'Warning',
    opportunity: 'Opportunity',
    recommendation: 'Recommendation',
  };

  const typeColors: Record<string, string> = {
    insight: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    opportunity: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    recommendation: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const severityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain size={24} className="text-blue-600" />
            Agent Insights
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            AI-generated non-obvious conclusions from competitive intelligence data
          </p>
        </div>
      </div>


      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-1">How These Insights Were Generated</h3>
            <p className="text-xs text-blue-100 leading-relaxed max-w-3xl">
              These insights are generated through multi-layered analysis combining sentiment scoring,
              pricing pattern analysis, aspect-level breakdowns, trust signal evaluation, and cross-brand
              benchmarking. Each insight is backed by data from 72 products and 50,000+ reviews across
              6 brands on Amazon India. The methodology uses weighted sentiment scoring (positive themes
              weighted by frequency, negative themes weighted by severity), price-band normalization
              (adjusting expectations by price tier), and anomaly detection (flagging rating-sentiment
              divergence and suspicious review patterns).
            </p>
          </div>
        </div>
      </div>


      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-gray-500">Filter by type:</span>
        {(['all', 'insight', 'warning', 'opportunity', 'recommendation'] as const).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              typeFilter === type
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : typeLabels[type]}
          </button>
        ))}
        <span className="ml-auto text-gray-400">{filteredInsights.length} insights</span>
      </div>


      <div className="space-y-3">
        {filteredInsights.map((insight, idx) => {
          const isExpanded = expandedId === insight.id;
          const relatedBrandObjects = insight.relatedBrands
            .map(id => activeBrands.find(b => b.id === id))
            .filter(Boolean) as BrandProfile[];

          return (
            <div
              key={insight.id}
              className={`bg-white rounded-xl border transition-all ${
                isExpanded ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {typeIcons[insight.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeColors[insight.type]}`}>
                        {typeLabels[insight.type]}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${severityColors[insight.severity]}`}>
                        {insight.severity} priority
                      </span>
                      <span className="text-[10px] text-gray-400">#{idx + 1}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 pr-4">{insight.title}</h4>
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="pl-7">
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-gray-400 font-medium">Related brands:</span>
                      {relatedBrandObjects.map(brand => (
                        <span
                          key={brand.id}
                          className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-gray-50"
                          style={{ borderLeft: `3px solid ${brand.color}` }}
                        >
                          {brand.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>


      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-1.5">
          <Zap size={14} className="text-amber-500" /> Key Takeaways
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-1">Best Value Brand</p>
            <p className="text-sm font-bold text-gray-900">Safari</p>
            <p className="text-xs text-gray-500 mt-1">Highest sentiment-per-rupee ratio with strong build quality</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-[10px] font-semibold text-amber-600 uppercase mb-1">Biggest Risk</p>
            <p className="text-sm font-bold text-gray-900">Aristocrat</p>
            <p className="text-xs text-gray-500 mt-1">Aggressive discounting masks durability and quality concerns</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-[10px] font-semibold text-blue-600 uppercase mb-1">Brand to Watch</p>
            <p className="text-sm font-bold text-gray-900">Nasher Miles</p>
            <p className="text-xs text-gray-500 mt-1">Fastest-growing challenger with modern design-first approach</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="text-[10px] font-semibold text-purple-600 uppercase mb-1">Premium Play</p>
            <p className="text-sm font-bold text-gray-900">American Tourister</p>
            <p className="text-xs text-gray-500 mt-1">Strong premium positioning, but sentiment gap vs. mid-range is narrow</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <p className="text-[10px] font-semibold text-red-600 uppercase mb-1">Erosion Risk</p>
            <p className="text-sm font-bold text-gray-900">VIP</p>
            <p className="text-xs text-gray-500 mt-1">Heritage trust fading among younger buyers due to design deficit</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-[10px] font-semibold text-gray-600 uppercase mb-1">Market Opportunity</p>
            <p className="text-sm font-bold text-gray-900">Wheels & Zippers</p>
            <p className="text-xs text-gray-500 mt-1">Top complaint categories — solving these could be a key differentiator</p>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-1.5">
          <ArrowRight size={14} className="text-blue-600" /> Value-for-Money Analysis
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Sentiment adjusted by price band — which brands deliver the most customer satisfaction per rupee?
        </p>
        <div className="space-y-3">
          {activeBrands
            .slice()
            .sort((a, b) => (b.aspectSentiment.valueForMoney) - (a.aspectSentiment.valueForMoney))
            .map((brand) => {
              const ratio = brand.aspectSentiment.valueForMoney;
              const maxRatio = Math.max(...activeBrands.map(b => b.aspectSentiment.valueForMoney));
              return (
                <div key={brand.id} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-28 flex-shrink-0">{brand.name}</span>
                  <div className="flex-1 h-6 bg-gray-50 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{
                        width: `${(ratio / maxRatio) * 100}%`,
                        backgroundColor: brand.color,
                        opacity: 0.85,
                      }}
                    >
                      <span className="text-[10px] font-bold text-white">{ratio}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right">VFM Score</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
