import StatusDonutChart from './StatusDonutChart';
import DailyVolumeBarChart from './DailyVolumeBarChart';
import RagDistributionChart from './RagDistributionChart';
import ModelPerformanceChart from './ModelPerformanceChart';
import type { ReportRecord } from '../../../types/reports';

interface ChartsSectionProps {
  reports: ReportRecord[];
  isLoading?: boolean;
}

export default function ChartsSection({ reports, isLoading }: ChartsSectionProps) {
  const volumeByMonth = reports.reduce<Record<string, number>>((acc, report) => {
    const createdAt = new Date(report.created_at);
    if (Number.isNaN(createdAt.getTime())) return acc;

    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const dailyVolumeData = Object.entries(volumeByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return {
        period: date.toLocaleString('en-US', { month: 'short' }),
        count,
      };
    });

  const ragData = reports.reduce(
    (acc, report) => {
      const rag = report.summary_json?.overall_rating?.rag?.toLowerCase();
      if (rag === 'green') acc.green += 1;
      if (rag === 'amber') acc.amber += 1;
      if (rag === 'red') acc.red += 1;
      return acc;
    },
    { green: 0, amber: 0, red: 0 }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-80 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Status Donut + Daily Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDonutChart reports={reports} />
        <DailyVolumeBarChart data={dailyVolumeData} />
      </div>

      {/* Bottom Row: RAG Distribution + Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RagDistributionChart data={ragData} />
        <ModelPerformanceChart reports={reports} />
      </div>
    </div>
  );
}
