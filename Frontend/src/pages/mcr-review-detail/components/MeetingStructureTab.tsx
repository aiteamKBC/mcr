// MCR file header: Frontend\src\pages\mcr-review-detail\components\MeetingStructureTab.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useState } from 'react';
import type { McrReview } from '../../../types/mcr';
import useReplayOnView from '../../mcr-dashboard/components/useReplayOnView';
import ReplayProgressFill from './ReplayProgressFill';

interface MeetingStructureTabProps {
  review: McrReview;
}

const getVarianceColor = (v: number) =>
  v > 0 ? 'text-red-600' : v < 0 ? 'text-blue-600' : 'text-emerald-600';

const getBarColor = (v: number) =>
  v > 0 ? 'bg-red-400' : v < 0 ? 'bg-blue-400' : 'bg-emerald-400';

const getStatusBg = (v: number) =>
  v > 0 ? 'bg-red-50 border-red-100' : v < 0 ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100';

export default function MeetingStructureTab({ review }: MeetingStructureTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { ref, replayKey } = useReplayOnView({ threshold: 0.2 });
  const isActive = replayKey > 0;

  const totalPlanned = review.meetingSections.reduce((s, x) => s + x.plannedMin, 0);
  const totalVariance = review.totalDurationMin - totalPlanned;
  const variancePct = totalPlanned > 0 ? ((totalVariance / totalPlanned) * 100).toFixed(1) : '0.0';

  const sectionStats = review.meetingSections.map((section) => {
    const variance = section.actualMin - section.plannedMin;
    const pct = section.plannedMin > 0 ? (variance / section.plannedMin) * 100 : 0;
    return { section, variance, pct };
  });

  return (
    <div ref={ref} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            label: 'Planned Duration',
            value: `${totalPlanned} min`,
            icon: 'ri-calendar-check-line',
            color: 'text-slate-700',
            bg: 'bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]',
            border: 'border-slate-200/80',
          },
          {
            label: 'Actual Duration',
            value: `${review.totalDurationMin} min`,
            icon: 'ri-time-line',
            color: 'text-indigo-700',
            bg: 'bg-[linear-gradient(180deg,_rgba(238,242,255,0.95)_0%,_rgba(224,231,255,0.72)_100%)]',
            border: 'border-indigo-100/80',
          },
          {
            label: 'Total Variance',
            value: `${totalVariance > 0 ? '+' : ''}${totalVariance} min (${totalVariance > 0 ? '+' : ''}${variancePct}%)`,
            icon: totalVariance > 0 ? 'ri-arrow-up-line' : totalVariance < 0 ? 'ri-arrow-down-line' : 'ri-check-line',
            color: getVarianceColor(totalVariance),
            bg:
              totalVariance > 0
                ? 'bg-[linear-gradient(180deg,_rgba(254,242,242,0.95)_0%,_rgba(254,226,226,0.76)_100%)]'
                : totalVariance < 0
                ? 'bg-[linear-gradient(180deg,_rgba(239,246,255,0.96)_0%,_rgba(219,234,254,0.78)_100%)]'
                : 'bg-[linear-gradient(180deg,_rgba(236,253,245,0.96)_0%,_rgba(209,250,229,0.78)_100%)]',
            border: totalVariance > 0 ? 'border-red-100/80' : totalVariance < 0 ? 'border-blue-100/80' : 'border-emerald-100/80',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`flex items-center gap-3 rounded-2xl border ${kpi.border} ${kpi.bg} px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)]`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <i className={`${kpi.icon} text-base ${kpi.color}`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{kpi.label}</p>
              <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
          <i className="ri-list-ordered text-indigo-500"></i>
          <h3 className="text-sm font-bold text-slate-900">Meeting Timeline</h3>
          <span className="ml-auto text-xs text-slate-400">{review.meetingSections.length} sections</span>
        </div>

        <div className="divide-y divide-slate-50">
          {sectionStats.map(({ section, variance, pct }, idx) => {
            const pctText = pct.toFixed(1);
            const isOpen = expanded === section.sectionKey;
            const fillPct = section.plannedMin > 0 ? Math.min(100, (section.actualMin / section.plannedMin) * 100) : 0;

            return (
              <div key={section.sectionKey} className="px-4 py-4 sm:px-6">
                <div
                  className="grid cursor-pointer gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center"
                  onClick={() => setExpanded(isOpen ? null : section.sectionKey)}
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
                    <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-6 text-slate-800">{section.sectionName}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <ReplayProgressFill
                        pct={fillPct}
                        className={`h-full rounded-full ${getBarColor(variance)}`}
                        replayKey={replayKey}
                        isActive={isActive}
                        delayMs={140 + idx * 100}
                        durationMs={1250}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:justify-end lg:text-right">
                    <div className="min-w-[52px]">
                      <p className="text-[10px] text-slate-400">Planned</p>
                      <p className="text-xs font-semibold text-slate-600">{section.plannedMin} min</p>
                    </div>
                    <div className="min-w-[48px]">
                      <p className="text-[10px] text-slate-400">Actual</p>
                      <p className="text-xs font-semibold text-slate-800">{section.actualMin} min</p>
                    </div>
                    <div className={`min-w-[72px] rounded-xl border px-3 py-1.5 text-center text-xs font-bold ${getStatusBg(variance)} ${getVarianceColor(variance)}`}>
                      {variance > 0 ? '+' : ''}{variance} min
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                      <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-base`}></i>
                    </div>
                  </div>
                </div>

                {isOpen && section.notes && (
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 lg:ml-11">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
                    <p className="text-sm leading-relaxed text-slate-700">{section.notes}</p>
                    <p className={`text-xs font-medium mt-2 ${getVarianceColor(variance)}`}>
                      {variance > 0 ? `+${pctText}% over planned` : variance < 0 ? `${pctText}% under planned` : 'Exactly on time'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

