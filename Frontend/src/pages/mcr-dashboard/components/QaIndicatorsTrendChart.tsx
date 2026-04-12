// MCR file header: Frontend\src\pages\mcr-dashboard\components\QaIndicatorsTrendChart.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useEffect, useState } from 'react';
import AnimatedNumber from './AnimatedNumber';
import useReplayOnView from './useReplayOnView';

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
  { key: 'presentationQuality', label: 'Learner Presentation Quality',    icon: 'ri-slideshow-line',    color: '#3b82f6', bg: 'bg-blue-50',    text: 'text-blue-600'    },
  { key: 'feedbackQuality',     label: 'Coach Feedback Quality',          icon: 'ri-chat-check-line',   color: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-600'   },
  { key: 'ksbVerified',         label: 'KSB Verified "Evidence"',         icon: 'ri-shield-check-line', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'epaTopics',           label: 'EPA Topics Relevant KSB Covered', icon: 'ri-book-open-line',    color: '#6366f1', bg: 'bg-indigo-50',  text: 'text-indigo-600'  },
  { key: 'satisfaction',        label: 'Satisfaction - APTEM',            icon: 'ri-star-line',         color: '#8b5cf6', bg: 'bg-violet-50',  text: 'text-violet-600'  },
  { key: 'safeguarding',        label: 'Safeguarding - APTEM',            icon: 'ri-heart-pulse-line',  color: '#ef4444', bg: 'bg-rose-50',    text: 'text-rose-600'    },
];

function getRag(score: number) {
  if (score >= 4.5) return { label: 'Outstanding', color: 'text-emerald-700', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700' };
  if (score >= 3.5) return { label: 'Strong', color: 'text-indigo-700', dot: 'bg-indigo-500', pill: 'bg-indigo-50 text-indigo-700' };
  if (score >= 2.5) return { label: 'Developing', color: 'text-amber-700', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700' };
  return { label: 'Concern', color: 'text-rose-700', dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-700' };
}

function ReplayProgressBar({
  pct,
  color,
  replayKey,
  delayMs = 0,
  durationMs = 1200,
  isActive = true,
}: {
  pct: number;
  color: string;
  replayKey: number;
  delayMs?: number;
  durationMs?: number;
  isActive?: boolean;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setWidth(0);
      return;
    }

    if (typeof window === 'undefined') {
      setWidth(pct);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setWidth(pct);
      return;
    }

    setWidth(0);
    const timeoutId = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        setWidth(pct);
      });
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, isActive, pct, replayKey]);

  return (
    <div
      className="h-full rounded-full ease-out"
      style={{
        width: `${width}%`,
        backgroundColor: color,
        transitionProperty: 'width, opacity',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: width > 0 ? 1 : 0.7,
        boxShadow: width > 0 ? `0 0 0 1px ${color}22, 0 0 14px ${color}26` : 'none',
      }}
    ></div>
  );
}

export default function QaIndicatorsTrendChart({ data, isLoading }: QaIndicatorsTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const { ref, replayKey } = useReplayOnView({ threshold: 0.25 });
  const isActive = replayKey > 0;

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

  const activePeriod = selectedPeriod ?? data[data.length - 1].period;
  const activeIdx = data.findIndex((d) => d.period === activePeriod);
  const latest = data[activeIdx];
  const prev = activeIdx > 0 ? data[activeIdx - 1] : null;
  const animationKey = replayKey * 100 + Math.max(activeIdx, 0);

  const avg = indicators.reduce((sum, ind) => sum + (latest[ind.key as keyof typeof latest] as number), 0) / indicators.length;
  const rag = getRag(avg);

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow duration-500">
      <div ref={ref} className="pointer-events-none absolute inset-x-0 top-0 h-1" aria-hidden="true"></div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">QA Indicators</h3>
          <p className="text-xs text-slate-400 mt-0.5">8 quality metrics - scored out of 5.0</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">Overall Avg</p>
            <AnimatedNumber
              value={avg}
              decimals={1}
              replayKey={animationKey}
              isActive={isActive}
              className="text-xl font-bold text-slate-900"
            />
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-500 ${rag.pill}`}>
            <span className={`w-2 h-2 rounded-full ${rag.dot}`}></span>
            <span className={`text-xs font-semibold ${rag.color}`}>{rag.label}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-slate-400 font-medium mr-1">Period:</span>
        {data.map((d) => {
          const isActive = d.period === activePeriod;
          return (
            <button
              key={d.period}
              onClick={() => setSelectedPeriod(d.period)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-[0_10px_24px_rgba(99,102,241,0.22)] -translate-y-0.5'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {d.period}
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-slate-50">
        {indicators.map((ind, index) => {
          const score = latest[ind.key as keyof typeof latest] as number;
          const prevVal = prev ? (prev[ind.key as keyof typeof prev] as number) : null;
          const delta = prevVal !== null ? +(score - prevVal).toFixed(1) : null;
          const pct = (score / 5) * 100;
          const r = getRag(score);

          return (
            <div
              key={ind.key}
              className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50/60 transition-all duration-500"
              style={{ transitionDelay: `${80 + indicators.findIndex((item) => item.key === ind.key) * 70}ms` }}
            >
              <div className={`w-8 h-8 rounded-lg ${ind.bg} flex items-center justify-center flex-shrink-0 transition-transform duration-500`}>
                <i className={`${ind.icon} ${ind.text} text-sm`}></i>
              </div>

              <div className="w-64 flex-shrink-0">
                <p className="text-sm font-medium text-slate-700 whitespace-nowrap">{ind.label}</p>
              </div>

              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <ReplayProgressBar
                  pct={pct}
                  color={ind.color}
                  replayKey={animationKey}
                  isActive={isActive}
                  delayMs={180 + index * 110}
                  durationMs={1250}
                />
              </div>

              <div className="w-10 text-right flex-shrink-0">
                <AnimatedNumber
                  value={score}
                  decimals={1}
                  replayKey={animationKey}
                  isActive={isActive}
                  durationMs={850}
                  className="text-sm font-bold text-slate-900"
                />
              </div>

              <div className="w-16 flex items-center justify-end gap-1 flex-shrink-0">
                {delta !== null && delta > 0 ? (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                      <i className="ri-arrow-up-s-line text-sm"></i>
                      +<AnimatedNumber value={delta} decimals={1} replayKey={animationKey} durationMs={800} isActive={isActive} />
                    </span>
                  ) : delta !== null && delta < 0 ? (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-rose-500">
                      <i className="ri-arrow-down-s-line text-sm"></i>
                      <AnimatedNumber value={delta} decimals={1} replayKey={animationKey} durationMs={800} isActive={isActive} />
                    </span>
                  ) : (
                    <span aria-hidden="true"></span>
                  )}
              </div>

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

      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-400">
          <i className="ri-information-line mr-1"></i>
          Scores rated 1-5
          {prev ? ` | delta vs ${prev.period}` : ' | no previous period to compare'}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Outstanding {'>='} 4.5</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>Strong {'>='} 3.5</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Developing {'>='} 2.5</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Concern</span>
        </div>
      </div>
    </div>
  );
}
