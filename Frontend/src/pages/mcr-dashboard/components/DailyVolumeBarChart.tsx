// MCR file header: Frontend\src\pages\mcr-dashboard\components\DailyVolumeBarChart.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnimatedNumber from './AnimatedNumber';
import useReplayOnView from './useReplayOnView';

interface DailyVolumeBarChartProps {
  data?: Array<{ period: string; count: number }>;
  isLoading?: boolean;
}

export default function DailyVolumeBarChart({ data, isLoading }: DailyVolumeBarChartProps) {
  const { ref, replayKey } = useReplayOnView({ threshold: 0.3 });
  const isActive = replayKey > 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-full">
        <div className="h-4 bg-slate-100 rounded w-2/5 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-1/3 mb-6"></div>
        <div className="h-40 bg-slate-50 rounded-xl"></div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count));
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const avgCount = totalCount / data.length;
  const peakCount = maxCount;

  const lastMonth = data[data.length - 1].count;
  const prevMonth = data.length >= 2 ? data[data.length - 2].count : lastMonth;
  const momChange = lastMonth - prevMonth;
  const momPct = prevMonth > 0 ? (momChange / prevMonth) * 100 : 0;
  const trending = momChange >= 0;
  const yMax = Math.ceil(maxCount / 5) * 5 || 10;

  const chartData = data.map((item, index) => {
    const isPeak = item.count === maxCount;
    const isLatest = index === data.length - 1;

    return {
      ...item,
      fill: isPeak ? 'url(#volume-peak)' : isLatest ? 'url(#volume-latest)' : 'url(#volume-default)',
    };
  });

  const animatedChartData = isActive
    ? chartData
    : chartData.map((item) => ({
        ...item,
        count: 0,
      }));

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-full hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-all duration-700"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">MCR Volume Over Time</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly review activity</p>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          trending ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'
        }`}>
          <i className={`${trending ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-xs`}></i>
          <AnimatedNumber value={Math.abs(momPct)} decimals={1} durationMs={900} replayKey={replayKey} isActive={isActive} />
          %
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height={196}>
          <BarChart data={animatedChartData} margin={{ top: 16, right: 10, left: -12, bottom: 4 }} barCategoryGap="30%">
            <defs>
              <linearGradient id="volume-default" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="volume-peak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="volume-latest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 6" />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, yMax]}
              tickCount={5}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(99,102,241,0.06)' }}
              contentStyle={{
                border: '1px solid rgba(226,232,240,0.9)',
                borderRadius: '14px',
                boxShadow: '0 16px 40px rgba(15,23,42,0.12)',
                backgroundColor: 'rgba(255,255,255,0.98)',
              }}
              formatter={(value: number) => [`${value} reviews`, 'Volume']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar
              key={`volume-bar-${replayKey}`}
              dataKey="count"
              radius={[8, 8, 4, 4]}
              maxBarSize={44}
              isAnimationActive={isActive}
              animationBegin={150}
              animationDuration={1050}
              animationEasing="ease-out"
            >
              {animatedChartData.map((entry) => (
                <Cell key={entry.period} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                offset={8}
                className="text-[11px] font-extrabold fill-slate-500"
                formatter={(value: number) => (value > 0 ? value : '')}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-emerald-50/70 rounded-xl p-3 text-center border border-emerald-100">
          <AnimatedNumber value={totalCount} replayKey={replayKey} isActive={isActive} className="text-lg font-extrabold text-emerald-800" />
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
          <AnimatedNumber value={peakCount} replayKey={replayKey} isActive={isActive} className="text-lg font-extrabold text-emerald-700" />
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Peak</p>
        </div>
        <div className="bg-indigo-50/70 rounded-xl p-3 text-center border border-indigo-100">
          <AnimatedNumber value={avgCount} decimals={1} replayKey={replayKey} isActive={isActive} className="text-lg font-extrabold text-indigo-700" />
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Avg / mo</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span>
            Peak month
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block"></span>
            Latest
          </span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trending ? 'text-emerald-600' : 'text-rose-500'}`}>
          <i className={trending ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}></i>
          <AnimatedNumber value={Math.abs(momChange)} replayKey={replayKey} durationMs={900} isActive={isActive} />
          <span>vs prev month</span>
        </div>
      </div>
    </div>
  );
}
