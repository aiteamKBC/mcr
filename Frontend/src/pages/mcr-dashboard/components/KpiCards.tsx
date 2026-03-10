
import type { DashboardKpis } from '../../../types/mcr';

interface KpiCardsProps {
  kpis?: DashboardKpis;
  isLoading?: boolean;
}

const cards = [
  {
    key: 'totalMcrs',
    label: 'Total MCRs',
    sub: 'All monthly reviews',
    icon: 'ri-file-list-3-line',
    accent: '#6366f1',
    bg: 'from-indigo-50 to-white',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-500',
    textColor: 'text-indigo-600',
  },
  {
    key: 'green',
    label: 'Green Ratings',
    sub: 'Outstanding performance',
    icon: 'ri-checkbox-circle-line',
    accent: '#10b981',
    bg: 'from-emerald-50 to-white',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-600',
  },
  {
    key: 'averageQaScore',
    label: 'Avg QA Score',
    sub: 'Quality assessment',
    icon: 'ri-star-line',
    accent: '#f59e0b',
    bg: 'from-amber-50 to-white',
    border: 'border-amber-100',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-600',
  },
  {
    key: 'safeguardingCompletionRate',
    label: 'Safeguarding',
    sub: 'Completion rate',
    icon: 'ri-shield-check-line',
    accent: '#ef4444',
    bg: 'from-rose-50 to-white',
    border: 'border-rose-100',
    iconBg: 'bg-rose-500',
    textColor: 'text-rose-600',
  },
  {
    key: 'averageSatisfaction',
    label: 'Satisfaction',
    sub: 'Learner feedback (APTEM)',
    icon: 'ri-emotion-happy-line',
    accent: '#14b8a6',
    bg: 'from-teal-50 to-white',
    border: 'border-teal-100',
    iconBg: 'bg-teal-500',
    textColor: 'text-teal-600',
  },
];

export default function KpiCards({ kpis, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>
              <div className="h-4 w-12 bg-slate-100 rounded-full"></div>
            </div>
            <div className="h-8 bg-slate-100 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const total = kpis.ragDistribution.green + kpis.ragDistribution.amber + kpis.ragDistribution.red;
  const greenPct = total > 0 ? Math.round((kpis.ragDistribution.green / total) * 100) : 0;

  const getValue = (key: string) => {
    switch (key) {
      case 'totalMcrs': return { main: kpis.totalMcrs.toString(), suffix: '', badge: null };
      case 'green': return { main: kpis.ragDistribution.green.toString(), suffix: '', badge: `${greenPct}%` };
      case 'averageQaScore': return { main: kpis.averageQaScore.toFixed(1), suffix: '/5.0', badge: null };
      case 'safeguardingCompletionRate': return { main: kpis.safeguardingCompletionRate.toString(), suffix: '%', badge: null };
      case 'averageSatisfaction': return { main: kpis.averageSatisfaction.toFixed(1), suffix: '/5.0', badge: null };
      default: return { main: '—', suffix: '', badge: null };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
      {cards.map((card) => {
        const { main, suffix, badge } = getValue(card.key);
        const isPercent = card.key === 'safeguardingCompletionRate';

        return (
          <div
            key={card.key}
            className={`relative bg-gradient-to-br ${card.bg} rounded-xl border ${card.border} p-5 overflow-hidden group hover:shadow-md transition-all duration-200`}
          >
            {/* Decorative circle */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.07]"
              style={{ backgroundColor: card.accent }}
            ></div>

            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                <i className={`${card.icon} text-white text-base`}></i>
              </div>
              {badge && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.textColor} bg-white/80 border ${card.border}`}>
                  {badge}
                </span>
              )}
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{main}</span>
              {suffix && <span className="text-sm font-medium text-slate-400">{suffix}</span>}
            </div>

            {/* Label */}
            <p className="text-xs font-semibold text-slate-600">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>

            {/* Progress bar for percentage metrics */}
            {isPercent && (
              <div className="mt-3 h-1 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${main}%`, backgroundColor: card.accent }}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
