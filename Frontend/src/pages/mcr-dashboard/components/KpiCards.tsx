// MCR file header: Frontend\src\pages\mcr-dashboard\components\KpiCards.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import AnimatedNumber from './AnimatedNumber';
import useReplayOnView from './useReplayOnView';
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
    accent: '#3b82f6',
    bg: 'from-blue-50 to-white',
    border: 'border-blue-100',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  {
    key: 'safeguardingCompletionRate',
    label: 'Safeguarding',
    sub: 'Completion rate',
    icon: 'ri-shield-check-line',
    accent: '#f43f5e',
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
    accent: '#8b5cf6',
    bg: 'from-violet-50 to-white',
    border: 'border-violet-100',
    iconBg: 'bg-violet-500',
    textColor: 'text-violet-600',
  },
] as const;

export default function KpiCards({ kpis, isLoading }: KpiCardsProps) {
  const { ref, replayKey } = useReplayOnView({ threshold: 0.2 });
  const isActive = replayKey > 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/85 rounded-[24px] border border-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] animate-pulse">
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
  const qaScoreDisplayed = Number(kpis.averageQaScore.toFixed(1));
  const qaScorePct = Math.min(100, Math.max(0, Math.round((qaScoreDisplayed / 5) * 100)));
  const safeguardingScoreDisplayed = Math.round((kpis.safeguardingCompletionRate / 20) * 10) / 10;
  const satisfactionScoreDisplayed = Number(kpis.averageSatisfaction.toFixed(1));
  const satisfactionPct = Math.min(100, Math.max(0, Math.round((satisfactionScoreDisplayed / 5) * 100)));

  const getValue = (key: string): { value: number; decimals: number; suffix: string; badgeValue: number | null; badgeSuffix: string } => {
    switch (key) {
      case 'totalMcrs':
        return { value: kpis.totalMcrs, decimals: 0, suffix: '', badgeValue: null, badgeSuffix: '' };
      case 'green':
        return { value: kpis.ragDistribution.green, decimals: 0, suffix: '', badgeValue: greenPct, badgeSuffix: '%' };
      case 'averageQaScore':
        return { value: qaScoreDisplayed, decimals: 1, suffix: '/5.0', badgeValue: qaScorePct, badgeSuffix: '%' };
      case 'safeguardingCompletionRate':
        return {
          value: safeguardingScoreDisplayed,
          decimals: 1,
          suffix: '/5.0',
          badgeValue: kpis.safeguardingCompletionRate,
          badgeSuffix: '%',
        };
      case 'averageSatisfaction':
        return { value: satisfactionScoreDisplayed, decimals: 1, suffix: '/5.0', badgeValue: satisfactionPct, badgeSuffix: '%' };
      default:
        return { value: 0, decimals: 0, suffix: '', badgeValue: null, badgeSuffix: '' };
    }
  };

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        {cards.map((card, index) => {
        const { value, decimals, suffix, badgeValue, badgeSuffix } = getValue(card.key);
        const isPercent = card.key === 'safeguardingCompletionRate';
        const progressPercent = card.key === 'safeguardingCompletionRate'
          ? kpis.safeguardingCompletionRate
          : card.key === 'averageSatisfaction'
          ? satisfactionPct
          : null;

        return (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-[26px] border ${card.border} bg-gradient-to-br ${card.bg} p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,23,42,0.10)]`}
            style={{ transitionDelay: `${index * 90}ms` }}
          >
            <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"></div>
            <div
              className={`absolute -top-5 -right-5 h-24 w-24 rounded-full transition-transform duration-[1400ms] ${
                isActive ? 'scale-100 rotate-0' : 'scale-75 rotate-[-18deg]'
              } opacity-[0.08]`}
              style={{ backgroundColor: card.accent }}
            ></div>
            <div
              className={`absolute right-6 top-6 h-16 w-16 rounded-full blur-2xl opacity-20 transition-all duration-1000 ${
                isActive ? 'scale-100' : 'scale-75'
              }`}
              style={{ backgroundColor: card.accent }}
            ></div>

            <div className="mb-5 flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconBg} shadow-sm`}>
                <i className={`${card.icon} text-white text-base`}></i>
              </div>
              {badgeValue !== null && (
                <span className={`rounded-full border ${card.border} bg-white/85 px-2.5 py-1 text-sm font-bold ${card.textColor}`}>
                  <AnimatedNumber value={badgeValue} decimals={0} durationMs={950} replayKey={replayKey} isActive={isActive} />
                  {badgeSuffix}
                </span>
              )}
            </div>

            <div className="mb-2 flex items-baseline gap-1.5">
              <AnimatedNumber
                value={value}
                decimals={decimals}
                replayKey={replayKey}
                isActive={isActive}
                className="text-[30px] font-black tracking-tight text-slate-900"
              />
              {suffix && <span className="text-sm font-semibold text-slate-400">{suffix}</span>}
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
            <p className="mt-1 text-sm text-slate-600">{card.sub}</p>

            {isPercent && progressPercent !== null && (
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${isActive ? progressPercent : 0}%`, backgroundColor: card.accent }}
                ></div>
              </div>
            )}
          </div>
        );
        })}
    </div>
  );
}
