
import type { ReportDashboardKpis } from '../../../types/reports';

interface ReportKpiCardsProps {
  kpis: ReportDashboardKpis;
}

export default function ReportKpiCards({ kpis }: ReportKpiCardsProps) {
  const successRateColor =
    kpis.successRate >= 90
      ? 'text-emerald-600'
      : kpis.successRate >= 70
      ? 'text-amber-600'
      : 'text-red-600';

  const successBarColor =
    kpis.successRate >= 90
      ? 'bg-emerald-500'
      : kpis.successRate >= 70
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Reports */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
            <i className="ri-file-text-line text-lg text-teal-600"></i>
          </div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total</span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.total}</div>
        <div className="text-sm text-gray-500">Reports Generated</div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            {kpis.completed} done
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            {kpis.pending + kpis.processing} in progress
          </span>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <i className="ri-checkbox-circle-line text-lg text-emerald-600"></i>
          </div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Rate</span>
        </div>
        <div className={`text-3xl font-bold mb-1 ${successRateColor}`}>
          {kpis.successRate.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500">Success Rate</div>
        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`${successBarColor} h-1.5 rounded-full transition-all duration-700`}
            style={{ width: `${kpis.successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Failed */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <i className="ri-error-warning-line text-lg text-red-500"></i>
          </div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Errors</span>
        </div>
        <div className="text-3xl font-bold text-red-500 mb-1">{kpis.failed}</div>
        <div className="text-sm text-gray-500">Failed Reports</div>
        <div className="mt-3 flex items-center gap-1 text-xs">
          {kpis.failed === 0 ? (
            <span className="text-emerald-600 font-medium">All clear — no failures</span>
          ) : (
            <span className="text-red-500 font-medium">
              {((kpis.failed / kpis.total) * 100).toFixed(1)}% failure rate
            </span>
          )}
        </div>
      </div>

      {/* Avg Token Usage */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
            <i className="ri-cpu-line text-lg text-violet-600"></i>
          </div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Usage</span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {(kpis.avgOutputChars / 1000).toFixed(1)}k
        </div>
        <div className="text-sm text-gray-500">Avg Output Chars</div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span>In: {(kpis.avgInputChars / 1000).toFixed(1)}k avg</span>
          <span className="text-gray-300">|</span>
          <span>Out: {(kpis.avgOutputChars / 1000).toFixed(1)}k avg</span>
        </div>
      </div>
    </div>
  );
}
