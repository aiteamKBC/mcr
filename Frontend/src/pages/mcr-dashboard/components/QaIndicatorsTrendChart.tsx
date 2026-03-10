
import { useState } from 'react';

interface QaIndicatorsTrendChartProps {
  data?: Array<{
    period: string;
    duration: number;
    welcomeStudent: number;
    presentationQuality: number;
    feedbackQuality: number;
    ksbVerified: number;
    epaTopics: number;
    satisfaction: number;
    safeguarding: number;
  }>;
  isLoading?: boolean;
}

const indicators = [
  { key: 'duration',            label: 'Duration',                        icon: 'ri-time-line',         color: '#6366f1', bg: 'bg-indigo-50',  text: 'text-indigo-600'  },
  { key: 'welcomeStudent',      label: 'Welcome Student',                 icon: 'ri-user-smile-line',   color: '#8b5cf6', bg: 'bg-violet-50',  text: 'text-violet-600'  },
  { key: 'presentationQuality', label: 'Learner Presentation Quality',    icon: 'ri-slideshow-line',    color: '#ec4899', bg: 'bg-pink-50',    text: 'text-pink-600'    },
  { key: 'feedbackQuality',     label: 'Coach Feedback Quality',          icon: 'ri-chat-check-line',   color: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-600'   },
  { key: 'ksbVerified',         label: 'KSB Verified "Evidence"',         icon: 'ri-shield-check-line', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'epaTopics',           label: 'EPA Topics Relevant KSB Covered', icon: 'ri-book-open-line',    color: '#14b8a6', bg: 'bg-teal-50',    text: 'text-teal-600'    },
  { key: 'satisfaction',        label: 'Satisfaction - APTEM',            icon: 'ri-star-line',         color: '#06b6d4', bg: 'bg-cyan-50',    text: 'text-cyan-600'    },
  { key: 'safeguarding',        label: 'Safeguarding - APTEM',            icon: 'ri-heart-pulse-line',  color: '#ef4444', bg: 'bg-rose-50',    text: 'text-rose-600'    },
];

function getRag(score: number) {
  if (score >= 4.5) return { label: 'Outstanding', color: 'text-emerald-700', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700' };
  if (score >= 3.5) return { label: 'Strong',       color: 'text-teal-700',   dot: 'bg-teal-500',    pill: 'bg-teal-50 text-teal-700'       };
  if (score >= 2.5) return { label: 'Developing',   color: 'text-amber-700',  dot: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-700'     };
  return                   { label: 'Concern',       color: 'text-rose-700',   dot: 'bg-rose-500',    pill: 'bg-rose-50 text-rose-700'       };
}

export default function QaIndicatorsTrendChart({ data, isLoading }: QaIndicatorsTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  // Determine which period to show — default to last
  const activePeriod = selectedPeriod ?? data[data.length - 1].period;
  const activeIdx    = data.findIndex((d) => d.period === activePeriod);
  const latest       = data[activeIdx];
  const prev         = activeIdx > 0 ? data[activeIdx - 1] : null;

  const avg = indicators.reduce((sum, ind) => sum + (latest[ind.key as keyof typeof latest] as number), 0) / indicators.length;
  const rag = getRag(avg);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">QA Indicators</h3>
          <p className="text-xs text-slate-400 mt-0.5">8 quality metrics · scored out of 5.0</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">Overall Avg</p>
            <p className="text-xl font-bold text-slate-900">{avg.toFixed(1)}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${rag.pill}`}>
            <span className={`w-2 h-2 rounded-full ${rag.dot}`}></span>
            <span className={`text-xs font-semibold ${rag.color}`}>{rag.label}</span>
          </div>
        </div>
      </div>

      {/* ── Month Tabs ── */}
      <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-slate-400 font-medium mr-1">Period:</span>
        {data.map((d) => {
          const isActive = d.period === activePeriod;
          return (
            <button
              key={d.period}
              onClick={() => setSelectedPeriod(d.period)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {d.period}
            </button>
          );
        })}
      </div>

      {/* ── Indicator Rows ── */}
      <div className="divide-y divide-slate-50">
        {indicators.map((ind) => {
          const score   = latest[ind.key as keyof typeof latest] as number;
          const prevVal = prev ? (prev[ind.key as keyof typeof prev] as number) : null;
          const delta   = prevVal !== null ? +(score - prevVal).toFixed(1) : null;
          const pct     = (score / 5) * 100;
          const r       = getRag(score);

          return (
            <div key={ind.key} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50/60 transition-colors">

              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg ${ind.bg} flex items-center justify-center flex-shrink-0`}>
                <i className={`${ind.icon} ${ind.text} text-sm`}></i>
              </div>

              {/* Label */}
              <div className="w-64 flex-shrink-0">
                <p className="text-sm font-medium text-slate-700 whitespace-nowrap">{ind.label}</p>
              </div>

              {/* Progress bar */}
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: ind.color }}
                ></div>
              </div>

              {/* Score */}
              <div className="w-10 text-right flex-shrink-0">
                <span className="text-sm font-bold text-slate-900">{score.toFixed(1)}</span>
              </div>

              {/* Delta vs previous month */}
              <div className="w-16 flex items-center justify-end gap-1 flex-shrink-0">
                {delta === null ? (
                  <span className="text-xs text-slate-300 font-medium">—</span>
                ) : delta > 0 ? (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                    <i className="ri-arrow-up-s-line text-sm"></i>+{delta}
                  </span>
                ) : delta < 0 ? (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-rose-500">
                    <i className="ri-arrow-down-s-line text-sm"></i>{delta}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 font-medium">—</span>
                )}
              </div>

              {/* RAG pill */}
              <div className="w-28 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${r.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`}></span>
                  {r.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-400">
          <i className="ri-information-line mr-1"></i>
          Scores rated 1–5
          {prev ? ` · Δ vs ${prev.period}` : ' · No previous period to compare'}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Outstanding ≥4.5</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500"></span>Strong ≥3.5</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Developing ≥2.5</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Concern</span>
        </div>
      </div>
    </div>
  );
}


