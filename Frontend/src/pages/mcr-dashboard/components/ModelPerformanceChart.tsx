import type { ReportRecord } from '../../../types/reports';

interface ModelPerformanceChartProps {
  reports: ReportRecord[];
}

interface ModelStats {
  model: string;
  count: number;
  successRate: number;
  avgOutputChars: number;
  avgQaScore: number;
}

export default function ModelPerformanceChart({ reports }: ModelPerformanceChartProps) {
  // Group reports by model
  const modelGroups = reports.reduce((acc, report) => {
    const model = report.model || 'Unknown';
    if (!acc[model]) {
      acc[model] = [];
    }
    acc[model].push(report);
    return acc;
  }, {} as Record<string, ReportRecord[]>);

  // Calculate stats for each model
  const modelStats: ModelStats[] = Object.entries(modelGroups).map(([model, modelReports]) => {
    const completedCount = modelReports.filter(r => r.status === 'completed').length;
    const successRate = modelReports.length > 0 ? (completedCount / modelReports.length) * 100 : 0;
    
    const avgOutputChars = modelReports.length > 0
      ? modelReports.reduce((sum, r) => sum + (r.output_chars || 0), 0) / modelReports.length
      : 0;

    // Calculate average QA score from summary_json
    const qaScores: number[] = [];
    modelReports.forEach(report => {
      if (report.summary_json && typeof report.summary_json === 'object' && 'qa' in report.summary_json) {
        const qa = (report.summary_json as any).qa;
        if (Array.isArray(qa)) {
          qa.forEach((item: any) => {
            if (item.rating_1_to_5 && typeof item.rating_1_to_5 === 'number') {
              qaScores.push(item.rating_1_to_5);
            }
          });
        }
      }
    });

    const avgQaScore = qaScores.length > 0
      ? qaScores.reduce((sum, score) => sum + score, 0) / qaScores.length
      : 0;

    return {
      model,
      count: modelReports.length,
      successRate,
      avgOutputChars,
      avgQaScore,
    };
  }).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...modelStats.map(s => s.count), 1);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-600 bg-emerald-50';
    if (rate >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getSuccessRateBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-500';
    if (rate >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <i className="ri-cpu-line text-violet-600"></i>
          </div>
          <h3 className="text-base font-semibold text-gray-900">Model Performance Comparison</h3>
        </div>
        <div className="text-xs text-gray-500">
          {modelStats.length} {modelStats.length === 1 ? 'model' : 'models'}
        </div>
      </div>

      {modelStats.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <i className="ri-cpu-line text-4xl mb-2"></i>
            <p className="text-sm">No model data available</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {modelStats.map((stat) => (
            <div key={stat.model} className="border border-gray-200 rounded-lg p-4 hover:border-violet-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{stat.model}</h4>
                    <span className="text-xs text-gray-500">({stat.count} reports)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                      <div 
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${(stat.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${getSuccessRateColor(stat.successRate)}`}>
                  {stat.successRate.toFixed(1)}% Success
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Success Rate</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getSuccessRateBarColor(stat.successRate)}`}
                        style={{ width: `${stat.successRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{stat.successRate.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Avg Output</div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-file-text-line text-blue-600 text-sm"></i>
                    <span className="text-sm font-semibold text-gray-900">
                      {stat.avgOutputChars.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-gray-500">chars</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Avg QA Score</div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i 
                          key={star}
                          className={`${
                            star <= Math.round(stat.avgQaScore) 
                              ? 'ri-star-fill text-amber-400' 
                              : 'ri-star-line text-gray-300'
                          } text-xs`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {stat.avgQaScore > 0 ? stat.avgQaScore.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}