import { useState } from 'react';
import type { McrReview } from '../../../types/mcr';

interface MeetingStructureTabProps {
  review: McrReview;
}

const getVarianceColor = (v: number) =>
  v > 0 ? 'text-red-600' : v < 0 ? 'text-sky-600' : 'text-emerald-600';

const getBarColor = (v: number) =>
  v > 0 ? 'bg-red-400' : v < 0 ? 'bg-sky-400' : 'bg-emerald-400';

const getStatusBg = (v: number) =>
  v > 0 ? 'bg-red-50 border-red-100' : v < 0 ? 'bg-sky-50 border-sky-100' : 'bg-emerald-50 border-emerald-100';

export default function MeetingStructureTab({ review }: MeetingStructureTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalPlanned = review.meetingSections.reduce((s, x) => s + x.plannedMin, 0);
  const totalVariance = review.totalDurationMin - totalPlanned;
  const variancePct = totalPlanned > 0 ? ((totalVariance / totalPlanned) * 100).toFixed(1) : '0.0';

  const sectionStats = review.meetingSections.map((section) => {
    const variance = section.actualMin - section.plannedMin;
    const pct = section.plannedMin > 0 ? (variance / section.plannedMin) * 100 : 0;
    return { section, variance, pct };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Planned Duration', value: `${totalPlanned} min`, icon: 'ri-calendar-check-line', color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Actual Duration', value: `${review.totalDurationMin} min`, icon: 'ri-time-line', color: 'text-teal-700', bg: 'bg-teal-50' },
          {
            label: 'Total Variance',
            value: `${totalVariance > 0 ? '+' : ''}${totalVariance} min (${totalVariance > 0 ? '+' : ''}${variancePct}%)`,
            icon: totalVariance > 0 ? 'ri-arrow-up-line' : totalVariance < 0 ? 'ri-arrow-down-line' : 'ri-check-line',
            color: getVarianceColor(totalVariance),
            bg: totalVariance > 0 ? 'bg-red-50' : totalVariance < 0 ? 'bg-sky-50' : 'bg-emerald-50',
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border border-gray-100 ${kpi.bg} px-5 py-4 flex items-center gap-3`}>
            <div className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm flex-shrink-0">
              <i className={`${kpi.icon} text-base ${kpi.color}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{kpi.label}</p>
              <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <i className="ri-list-ordered text-teal-500"></i>
          <h3 className="text-sm font-bold text-gray-900">Meeting Timeline</h3>
          <span className="ml-auto text-xs text-gray-400">{review.meetingSections.length} sections</span>
        </div>

        <div className="divide-y divide-gray-50">
          {sectionStats.map(({ section, variance, pct }, idx) => {
            const pctText = pct.toFixed(1);
            const isOpen = expanded === section.sectionKey;
            const fillPct = section.plannedMin > 0 ? Math.min(100, (section.actualMin / section.plannedMin) * 100) : 0;

            return (
              <div key={section.sectionKey} className="px-6 py-4">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : section.sectionKey)}
                >
                  <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-teal-600">{idx + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{section.sectionName}</p>
                    <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(variance)}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-5 flex-shrink-0 text-right">
                    <div>
                      <p className="text-[10px] text-gray-400">Planned</p>
                      <p className="text-xs font-semibold text-gray-600">{section.plannedMin} min</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Actual</p>
                      <p className="text-xs font-semibold text-gray-800">{section.actualMin} min</p>
                    </div>
                    <div className={`min-w-[64px] px-2.5 py-1 rounded-lg border text-xs font-bold text-center ${getStatusBg(variance)} ${getVarianceColor(variance)}`}>
                      {variance > 0 ? '+' : ''}{variance} min
                    </div>
                    <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-gray-400 text-base`}></i>
                  </div>
                </div>

                {isOpen && section.notes && (
                  <div className="mt-3 ml-11 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{section.notes}</p>
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
