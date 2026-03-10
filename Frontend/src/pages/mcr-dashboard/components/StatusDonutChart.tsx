import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ReportRecord } from '../../../types/reports';

interface StatusDonutChartProps {
  reports: ReportRecord[];
}

const STATUS_COLORS = {
  completed: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  processing: '#8b5cf6',
};

const STATUS_LABELS = {
  completed: 'Completed',
  failed: 'Failed',
  pending: 'Pending',
  processing: 'Processing',
};

export default function StatusDonutChart({ reports }: StatusDonutChartProps) {
  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count,
    status,
  }));

  const total = reports.length;

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${entry.value} (${percent}%)`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <i className="ri-pie-chart-line text-indigo-600"></i>
        </div>
        <h3 className="text-base font-semibold text-gray-900">Status Distribution</h3>
      </div>

      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <i className="ri-pie-chart-line text-4xl mb-2"></i>
            <p className="text-sm">No data available</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell 
                  key={entry.status} 
                  fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px'
              }}
              formatter={(value: number) => [`${value} reports`, 'Count']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Reports</span>
          <span className="font-semibold text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
}