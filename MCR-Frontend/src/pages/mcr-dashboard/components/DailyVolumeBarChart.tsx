
interface DailyVolumeBarChartProps {
  data?: Array<{ period: string; count: number }>;
  isLoading?: boolean;
}

const CHART_H = 140;
const CHART_W = 100; // viewBox units (percentage-based)
const PADDING = { top: 16, right: 4, bottom: 28, left: 28 };

export default function DailyVolumeBarChart({ data, isLoading }: DailyVolumeBarChartProps) {
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

  // SVG chart dimensions
  const svgW = 500;
  const svgH = CHART_H + PADDING.top + PADDING.bottom;
  const plotW = svgW - PADDING.left - PADDING.right;
  const plotH = CHART_H;

  const gridLines = 4;
  const yMax = Math.ceil(maxCount / 5) * 5 || 10;

  const barCount = data.length;
  const barGroupW = plotW / barCount;
  const barW = Math.min(barGroupW * 0.55, 36);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">MCR Volume Over Time</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly review activity</p>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          trending ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'
        }`}>
          <i className={`${trending ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} text-xs`}></i>
          {Math.abs(momPct).toFixed(1)}%
        </div>
      </div>

      {/* SVG Chart */}
      <div className="flex-1 w-full">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          style={{ height: `${svgH}px` }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[...Array(gridLines + 1)].map((_, i) => {
            const y = PADDING.top + plotH - (i / gridLines) * plotH;
            const val = Math.round((i / gridLines) * yMax);
            return (
              <g key={i}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={svgW - PADDING.right}
                  y2={y}
                  stroke={i === 0 ? '#cbd5e1' : '#f1f5f9'}
                  strokeWidth={i === 0 ? 1.5 : 1}
                />
                <text
                  x={PADDING.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                  fontFamily="Inter, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barH = yMax > 0 ? (item.count / yMax) * plotH : 0;
            const x = PADDING.left + index * barGroupW + (barGroupW - barW) / 2;
            const y = PADDING.top + plotH - barH;
            const isPeak = item.count === maxCount;
            const isLast = index === data.length - 1;

            const fillStart = isPeak ? '#10b981' : isLast ? '#6366f1' : '#94a3b8';
            const fillEnd   = isPeak ? '#34d399' : isLast ? '#818cf8' : '#cbd5e1';
            const gradId    = `grad-${index}`;

            return (
              <g key={index} className="group">
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={fillEnd} />
                    <stop offset="100%" stopColor={fillStart} />
                  </linearGradient>
                </defs>

                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(barH, 2)}
                  rx={5}
                  ry={5}
                  fill={`url(#${gradId})`}
                  opacity={0.92}
                />

                {/* Value label above bar */}
                {item.count > 0 && (
                  <text
                    x={x + barW / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill={isPeak ? '#059669' : isLast ? '#4f46e5' : '#64748b'}
                    fontFamily="Inter, sans-serif"
                  >
                    {item.count}
                  </text>
                )}

                {/* X-axis label */}
                <text
                  x={x + barW / 2}
                  y={PADDING.top + plotH + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#94a3b8"
                  fontFamily="Inter, sans-serif"
                >
                  {item.period}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-extrabold text-slate-800">{totalCount}</p>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
          <p className="text-lg font-extrabold text-emerald-700">{peakCount}</p>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Peak</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
          <p className="text-lg font-extrabold text-slate-700">{avgCount.toFixed(1)}</p>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Avg / mo</p>
        </div>
      </div>

      {/* Footer */}
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
          {Math.abs(momChange)} vs prev month
        </div>
      </div>
    </div>
  );
}
