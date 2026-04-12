// MCR file header: Frontend\src\pages\mcr-dashboard\components\RagDistributionChart.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import AnimatedNumber from './AnimatedNumber';
import useReplayOnView from './useReplayOnView';

interface RagDistributionChartProps {
  data?: { green: number; amber: number; red: number };
  isLoading?: boolean;
}

const SEGMENTS = [
  {
    key: 'green',
    label: 'Green',
    color: '#10b981',
    glow: '#34d399',
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50/80',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
  },
  {
    key: 'amber',
    label: 'Amber',
    color: '#f59e0b',
    glow: '#fbbf24',
    bg: 'bg-amber-500',
    light: 'bg-amber-50/80',
    border: 'border-amber-100',
    text: 'text-amber-700',
  },
  {
    key: 'red',
    label: 'Red',
    color: '#ef4444',
    glow: '#fb7185',
    bg: 'bg-rose-500',
    light: 'bg-rose-50/80',
    border: 'border-rose-100',
    text: 'text-rose-700',
  },
] as const;

export default function RagDistributionChart({ data, isLoading }: RagDistributionChartProps) {
  const { ref, replayKey } = useReplayOnView({ threshold: 0.35 });
  const isActive = replayKey > 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6 animate-pulse h-full">
        <div className="h-5 bg-slate-100 rounded w-2/5 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-1/3 mb-8"></div>
        <div className="flex justify-center mb-8">
          <div className="w-44 h-44 bg-slate-100 rounded-full"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const total = data.green + data.amber + data.red;
  const segments = SEGMENTS.map((segment) => {
    const count = data[segment.key];
    const pct = total > 0 ? (count / total) * 100 : 0;

    return {
      ...segment,
      count,
      pct,
    };
  });

  const animatedSegments = isActive
    ? segments
    : segments.map((seg) => ({
        ...seg,
        count: 0,
        pct: 0,
      }));

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col h-full hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-all duration-700"
    >
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">RAG Status Distribution</h3>
        <p className="text-xs text-slate-400 mt-0.5">Quality ratings breakdown - {total} total</p>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative h-44 w-44">
          <div className="absolute inset-5 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.98)_0%,_rgba(255,255,255,0.92)_72%,_rgba(226,232,240,0.6)_100%)] shadow-[inset_0_1px_10px_rgba(148,163,184,0.08)]" />
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {segments.map((seg) => (
                  <linearGradient key={seg.key} id={`rag-${seg.key}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={seg.glow} />
                    <stop offset="100%" stopColor={seg.color} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                key={`rag-pie-${replayKey}`}
                data={animatedSegments}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={86}
                paddingAngle={3}
                cornerRadius={10}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={2}
                isAnimationActive={isActive}
                animationBegin={120}
                animationDuration={1100}
                animationEasing="ease-out"
              >
                {animatedSegments.map((seg) => (
                  <Cell key={seg.key} fill={`url(#rag-${seg.key})`} />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                contentStyle={{
                  border: '1px solid rgba(226,232,240,0.9)',
                  borderRadius: '14px',
                  boxShadow: '0 16px 40px rgba(15,23,42,0.12)',
                  backgroundColor: 'rgba(255,255,255,0.98)',
                }}
                formatter={(value: number, _name, item) => {
                  const percentage = typeof item?.payload?.pct === 'number' ? item.payload.pct : 0;
                  return [`${value} MCRs`, `${percentage.toFixed(1)}%`];
                }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? 'Status'}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedNumber
              value={total}
              replayKey={replayKey}
              isActive={isActive}
              className="text-3xl font-extrabold text-slate-900 leading-none"
            />
            <span className="text-xs text-slate-400 mt-1 font-medium">MCRs</span>
          </div>
        </div>
      </div>

      <div className="flex h-2.5 rounded-full overflow-hidden mb-5 gap-1 bg-slate-100/80 p-[2px]">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${isActive ? seg.pct : 0}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>

      <div className="space-y-2 mt-auto">
        {segments.map((seg, index) => (
          <div
            key={seg.key}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${seg.light} border ${seg.border} transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]`}
            style={{ transitionDelay: `${140 + index * 90}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${seg.bg} flex-shrink-0`}></span>
              <span className="text-xs font-semibold text-slate-700">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedNumber
                value={seg.count}
                replayKey={replayKey}
                isActive={isActive}
                className={`text-sm font-extrabold ${seg.text}`}
              />
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full bg-white/70 ${seg.text}`}>
                <AnimatedNumber value={seg.pct} decimals={1} replayKey={replayKey} isActive={isActive} />
                %
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
