import { ReportDashboardKpis } from '../../../types/reports';

interface DashboardKpiCardsProps {
  kpis: ReportDashboardKpis;
  isLoading?: boolean;
}

export default function DashboardKpiCards({ kpis, isLoading }: DashboardKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const getTrendIcon = (trend?: number) => {
    if (!trend || trend === 0) return null;
    return trend > 0 ? (
      <span className="text-green-600 text-xs flex items-center gap-1">
        <i className="ri-arrow-up-line"></i>
        {Math.abs(trend)}%
      </span>
    ) : (
      <span className="text-red-600 text-xs flex items-center gap-1">
        <i className="ri-arrow-down-line"></i>
        {Math.abs(trend)}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Total Reports</span>
          {getTrendIcon(kpis.totalTrend)}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.total.toLocaleString()}</div>
        <div className="text-xs text-gray-500">All generated reports</div>
      </div>

      {/* Success Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Success Rate</span>
          {getTrendIcon(kpis.successRateTrend)}
        </div>
        <div className="text-3xl font-bold text-green-600 mb-2">{kpis.successRate.toFixed(1)}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${kpis.successRate}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">{kpis.completed} completed reports</div>
      </div>

      {/* Failed Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Failed Reports</span>
          {getTrendIcon(kpis.failedTrend)}
        </div>
        <div className="text-3xl font-bold text-red-600 mb-1">{kpis.failed.toLocaleString()}</div>
        <div className="text-xs text-red-600 font-medium mb-1">{kpis.failureRate.toFixed(1)}% failure rate</div>
        <div className="text-xs text-gray-500">Requires attention</div>
      </div>

      {/* In Queue */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">In Queue</span>
        </div>
        <div className="text-3xl font-bold text-amber-600 mb-1">{kpis.inQueue.toLocaleString()}</div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {kpis.pending} pending
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            {kpis.processing} processing
          </span>
        </div>
      </div>

      {/* RAG Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">RAG Distribution</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-2xl font-bold text-gray-900">{kpis.ragGreen}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-2xl font-bold text-gray-900">{kpis.ragAmber}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-2xl font-bold text-gray-900">{kpis.ragRed}</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">Overall rating breakdown</div>
      </div>

      {/* Avg QA Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Avg QA Score</span>
          {getTrendIcon(kpis.avgQaScoreTrend)}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl font-bold text-gray-900">{kpis.avgQaScore.toFixed(2)}</span>
          <span className="text-lg text-gray-400">/5.0</span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <i
              key={i}
              className={`ri-star-${i < Math.round(kpis.avgQaScore) ? 'fill' : 'line'} text-amber-400 text-sm`}
            ></i>
          ))}
        </div>
        <div className="text-xs text-gray-500">Average quality rating</div>
      </div>
    </div>
  );
}