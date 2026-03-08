
interface RagDistributionChartProps {
  data?: { green: number; amber: number; red: number };
  isLoading?: boolean;
}

const CIRCUMFERENCE = 2 * Math.PI * 38;

export default function RagDistributionChart({ data, isLoading }: RagDistributionChartProps) {
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
  const gPct = total > 0 ? (data.green / total) * 100 : 0;
  const aPct = total > 0 ? (data.amber / total) * 100 : 0;
  const rPct = total > 0 ? (data.red  / total) * 100 : 0;

  // Donut segments (strokeDasharray / strokeDashoffset)
  const gLen = (gPct / 100) * CIRCUMFERENCE;
  const aLen = (aPct / 100) * CIRCUMFERENCE;
  const rLen = (rPct / 100) * CIRCUMFERENCE;
  const gap  = 3;

  const segments = [
    { len: gLen, offset: 0,                    color: '#10b981', label: 'Green',  count: data.green, pct: gPct, bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
    { len: aLen, offset: gLen + gap,            color: '#f59e0b', label: 'Amber',  count: data.amber, pct: aPct, bg: 'bg-amber-500',   light: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-700'   },
    { len: rLen, offset: gLen + aLen + gap * 2, color: '#ef4444', label: 'Red',    count: data.red,   pct: rPct, bg: 'bg-rose-500',    light: 'bg-rose-50',    border: 'border-rose-100',    text: 'text-rose-700'    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">RAG Status Distribution</h3>
        <p className="text-xs text-slate-400 mt-0.5">Quality ratings breakdown · {total} total</p>
      </div>

      {/* Donut */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
            {/* Track */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="50" cy="50" r="38"
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(seg.len - gap, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-seg.offset}
                className="transition-all duration-700"
              />
            ))}
          </svg>
          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-slate-900 leading-none">{total}</span>
            <span className="text-xs text-slate-400 mt-1 font-medium">MCRs</span>
          </div>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-5 gap-0.5">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>

      {/* Legend rows */}
      <div className="space-y-2 mt-auto">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${seg.light} border ${seg.border}`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${seg.bg} flex-shrink-0`}></span>
              <span className="text-xs font-semibold text-slate-700">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-extrabold ${seg.text}`}>{seg.count}</span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full bg-white/70 ${seg.text}`}>
                {seg.pct.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
