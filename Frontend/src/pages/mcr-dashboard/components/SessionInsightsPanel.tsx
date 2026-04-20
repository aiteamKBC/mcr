// MCR file header: Frontend\src\pages\mcr-dashboard\components\SessionInsightsPanel.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.

import type { DashboardSessionStats } from '../../../types/mcr';
import useReplayOnView from './useReplayOnView';

interface SessionInsightsPanelProps {
  sessionStats?: DashboardSessionStats;
  isLoading?: boolean;
}

const formatMinutes = (value: number): string => `${value.toFixed(2)} min`;

export default function SessionInsightsPanel({ sessionStats, isLoading }: SessionInsightsPanelProps) {
  const { ref } = useReplayOnView({ threshold: 0.15 });

  if (isLoading) {
    return (
      <div className="mb-6 rounded-[30px] border border-white/75 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] animate-pulse">
        <div className="mb-6 h-6 w-64 rounded bg-slate-200"></div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.9fr]">
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-24 rounded-2xl bg-slate-100"></div>
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-slate-100"></div>
        </div>
      </div>
    );
  }

  if (!sessionStats) return null;

  return (
    <section
      ref={ref}
      className="mb-6 rounded-[30px] border border-white/75 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
    >
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Session Duration Insights</h3>
          <p className="mt-1 text-sm text-slate-600">
            Average MCR time per coach, overall average, and sessions missing transcript evidence in the summary.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.9fr]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[24px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">Overall Avg</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              {formatMinutes(sessionStats.overallAvgMinutes)}
            </p>
            <p className="mt-2 text-sm text-slate-600">Weighted average across {sessionStats.totalSessions} sessions.</p>
          </div>

          <div className="rounded-[24px] border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Missing Transcript</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              {sessionStats.sessionsWithoutTranscript.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-slate-600">Sessions whose summary has no transcript evidence entries.</p>
          </div>

          <div className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Tracked Coaches</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              {sessionStats.coachStats.length.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-slate-600">Unique coaches included in the visible session window.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
          <div className="grid grid-cols-[minmax(0,1.4fr)_100px_120px_140px] gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span>Coach</span>
            <span className="text-right">Sessions</span>
            <span className="text-right">Avg Time</span>
            <span className="text-right">No Transcript</span>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {sessionStats.coachStats.length > 0 ? (
              sessionStats.coachStats.map((row) => (
                <div
                  key={row.coachName}
                  className="grid grid-cols-[minmax(0,1.4fr)_100px_120px_140px] gap-3 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{row.coachName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Total {Math.round((row.totalDurationSeconds / 3600) * 100) / 100} h tracked
                    </p>
                  </div>
                  <div className="text-right font-semibold text-slate-700">{row.sessionCount}</div>
                  <div className="text-right font-semibold text-slate-900">{formatMinutes(row.avgMinutes)}</div>
                  <div className="text-right">
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                      {row.missingTranscriptSessions}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No session stats available for the current filters.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
