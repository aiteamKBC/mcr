import { useState } from 'react';
import type { McrReview } from '../../../types/mcr';

interface SafeguardingTabProps {
  review: McrReview;
}

type BinarySafeguardingStatus = 'Met' | 'Not Met';

const normalizeSafeguardingStatus = (value: string): BinarySafeguardingStatus =>
  value === 'Met' ? 'Met' : 'Not Met';

const statusConfig: Record<BinarySafeguardingStatus, { bg: string; text: string; border: string; bar: string; icon: string }> = {
  Met:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-400', icon: 'ri-checkbox-circle-fill' },
  'Not Met': { bg: 'bg-red-50',   text: 'text-red-700',     border: 'border-red-200',     bar: 'bg-red-400',     icon: 'ri-close-circle-fill' },
};

export default function SafeguardingTab({ review }: SafeguardingTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const checklist = review.safeguardingChecklist ?? [];
  const satisfaction = review.satisfaction ?? { score0to5: 0, comments: '' };

  const metCount = checklist.filter((i) => normalizeSafeguardingStatus(i.status) === 'Met').length;
  const notMetCount = checklist.filter((i) => normalizeSafeguardingStatus(i.status) === 'Not Met').length;
  const completionPct = checklist.length > 0 ? Math.round((metCount / checklist.length) * 100) : 0;

  const overallStatus: BinarySafeguardingStatus = notMetCount > 0 ? 'Not Met' : 'Met';

  const osc = statusConfig[overallStatus];

  return (
    <div className="space-y-5">

      <div className={`rounded-xl border ${osc.border} ${osc.bg} px-6 py-5 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/80 shadow-sm flex items-center justify-center">
            <i className={`${osc.icon} text-2xl ${osc.text}`}></i>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Overall Safeguarding</p>
            <p className={`text-lg font-bold ${osc.text}`}>{overallStatus}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {[
            { label: 'Completion', value: `${completionPct}%`, color: 'text-gray-800' },
            { label: 'Met', value: `${metCount}`, color: 'text-emerald-700' },
            { label: 'Not Met', value: `${notMetCount}`, color: 'text-red-700' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {review.safeguardingFlagged && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <i className="ri-alarm-warning-fill text-xl text-red-500 flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="text-sm font-semibold text-red-800">Safeguarding Concern Flagged</p>
            <p className="text-xs text-red-600 mt-0.5">
              This review has been flagged. Appropriate escalation procedures have been initiated.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <i className="ri-shield-check-line text-teal-500"></i>
          <h3 className="text-sm font-bold text-gray-900">8-Point Safeguarding Checklist</h3>
          <span className="ml-auto text-xs text-gray-400">{checklist.length} checks</span>
        </div>

        <div className="divide-y divide-gray-50">
          {checklist.map((item, idx) => {
            const normalizedStatus = normalizeSafeguardingStatus(item.status);
            const sc = statusConfig[normalizedStatus];
            const isOpen = expanded === item.key;
            const barPct = normalizedStatus === 'Met' ? 100 : 20;

            return (
              <div key={item.key} className="px-6 py-4">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : item.key)}
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${sc.bar}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap flex-shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                    <i className={`${sc.icon} text-xs`}></i>
                    {normalizedStatus}
                  </div>
                  <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-gray-400 text-base flex-shrink-0`}></i>
                </div>

                {isOpen && item.notes && (
                  <div className="mt-3 ml-11 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg">
              <i className="ri-star-fill text-amber-500"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Learner Satisfaction (APTEM)</h3>
              <p className="text-xs text-gray-400">Learner's overall satisfaction score</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-gray-900">{satisfaction.score0to5.toFixed(1)}</span>
            <span className="text-sm text-gray-400"> / 5.0</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={`text-xl ${
                star <= Math.round(satisfaction.score0to5)
                  ? 'ri-star-fill text-amber-400'
                  : 'ri-star-line text-gray-200'
              }`}
            ></i>
          ))}
          <span className="ml-2 text-xs text-gray-400 font-medium">
            {satisfaction.score0to5 >= 4.5 ? 'Excellent' :
             satisfaction.score0to5 >= 4.0 ? 'Very Good' :
             satisfaction.score0to5 >= 3.0 ? 'Good' : 'Needs Attention'}
          </span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
            style={{ width: `${(satisfaction.score0to5 / 5) * 100}%` }}
          />
        </div>

        {satisfaction.comments && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Learner Feedback</p>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{satisfaction.comments}"</p>
          </div>
        )}
      </div>

    </div>
  );
}
