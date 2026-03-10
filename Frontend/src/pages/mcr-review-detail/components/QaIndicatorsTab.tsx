
import { useState } from 'react';
import type { McrReview } from '../../../types/mcr';

interface QaIndicatorsTabProps {
  review: McrReview;
}

const INDICATOR_LABELS: Record<string, string> = {
  qa_duration:     'Duration',
  qa_welcome:      'Welcome Student',
  qa_presentation: 'Learner Presentation Quality',
  qa_feedback:     'Coach Feedback Quality',
  qa_ksb_evidence: 'KSB Verified "Evidence"',
  qa_epa_topics:   'EPA Topics Relevant KSB Covered',
  qa_satisfaction: 'Satisfaction - APTEM',
  qa_safeguarding: 'Safeguarding - APTEM',
};

const statusConfig = {
  Met:             { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-400', dot: 'bg-emerald-500' },
  'Partially Met': { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   bar: 'bg-amber-400',   dot: 'bg-amber-500' },
  'Not Met':       { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     bar: 'bg-red-400',     dot: 'bg-red-500' },
};

export default function QaIndicatorsTab({ review }: QaIndicatorsTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const indicators = (review.qaIndicators ?? []).filter(
    (ind) => Object.keys(INDICATOR_LABELS).includes(ind.indicatorKey)
  );

  const overallScore =
    indicators.length > 0
      ? indicators.reduce((s, i) => s + i.score0to5, 0) / indicators.length
      : 0;

  const metCount     = indicators.filter((i) => i.status === 'Met').length;
  const partialCount = indicators.filter((i) => i.status === 'Partially Met').length;
  const notMetCount  = indicators.filter((i) => i.status === 'Not Met').length;

  const getOverallLabel = (score: number) => {
    if (score >= 4.5) return { label: 'Outstanding', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 4.0) return { label: 'Strong',       color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200' };
    if (score >= 3.0) return { label: 'Requires Improvement', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'Cause for Concern', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const overall = getOverallLabel(overallScore);

  return (
    <div className="space-y-5">

      {/* ── Overall Score Banner ── */}
      <div className={`rounded-xl border ${overall.border} ${overall.bg} px-6 py-5 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/80 shadow-sm flex flex-col items-center justify-center">
            <span className={`text-xl font-black ${overall.color}`}>{overallScore.toFixed(1)}</span>
            <span className="text-[9px] text-gray-400 font-semibold">/ 5.0</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Overall QA Score</p>
            <p className={`text-lg font-bold ${overall.color}`}>{overall.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {[
            { label: 'Met',           count: metCount,     color: 'text-emerald-700', bg: 'bg-emerald-100' },
            { label: 'Partial',       count: partialCount, color: 'text-amber-700',   bg: 'bg-amber-100' },
            { label: 'Not Met',       count: notMetCount,  color: 'text-red-700',     bg: 'bg-red-100' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
              <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Indicator Cards ── */}
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {indicators.map((ind, idx) => {
          const label = INDICATOR_LABELS[ind.indicatorKey] ?? ind.indicatorName;
          const sc = statusConfig[ind.status] ?? statusConfig['Met'];
          const fillPct = (ind.score0to5 / 5) * 100;
          const isOpen = expanded === ind.indicatorKey;

          return (
            <div key={ind.indicatorKey} className="px-6 py-4">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : ind.indicatorKey)}
              >
                {/* Index */}
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${sc.bar}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className={`text-base font-black ${sc.text}`}>{ind.score0to5.toFixed(1)}</span>
                    <span className="text-xs text-gray-400"> / 5</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap ${sc.bg} ${sc.text} ${sc.border}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${sc.dot}`}></span>
                    {ind.status}
                  </div>
                  <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-gray-400 text-base`}></i>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="mt-3 ml-11 space-y-2">
                  {ind.comments && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Commentary</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{ind.comments}</p>
                    </div>
                  )}
                  {ind.evidenceUrls && ind.evidenceUrls.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-medium">Evidence:</span>
                      {ind.evidenceUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-external-link-line text-xs"></i>
                          Evidence {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Score Distribution ── */}
      <div className="bg-white rounded-xl border border-gray-100 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Score Distribution</p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Highest',  value: Math.max(...indicators.map((i) => i.score0to5)).toFixed(1), color: 'text-emerald-700' },
            { label: 'Lowest',   value: Math.min(...indicators.map((i) => i.score0to5)).toFixed(1), color: 'text-red-600' },
            { label: 'Average',  value: overallScore.toFixed(2), color: 'text-teal-700' },
            { label: 'Indicators', value: `${indicators.length}`, color: 'text-gray-700' },
          ].map((s) => (
            <div key={s.label} className="text-center bg-gray-50 rounded-lg py-3 border border-gray-100">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


