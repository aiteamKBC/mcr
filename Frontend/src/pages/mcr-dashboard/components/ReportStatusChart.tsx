
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { ReportRecord } from '../../../types/reports';

interface ReportStatusChartProps {
  records: ReportRecord[];
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  processing: '#6366f1',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  failed: 'Failed',
  pending: 'Pending',
  processing: 'Processing',
};

export default function ReportStatusChart({ records }: ReportStatusChartProps) {
  const statusCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    status,
  }));

  const byDate = records.reduce<Record<string, { completed: number; failed: number; pending: number; processing: number }>>((acc, r) => {
    const date = r.created_at.slice(0, 10);
    if (!acc[date]) acc[date] = { completed: 0, failed: 0, pending: 0, processing: 0 };
    acc[date][r.status] = (acc[date][r.status] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      ...counts,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Status Pie */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
            <i className="ri-pie-chart-2-line text-teal-600"></i>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Status Breakdown</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(value: number, name: string) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-2">
          {pieData.map((entry) => (
            <div key={entry.status} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] || '#94a3b8' }}
                ></span>
                <span className="text-gray-600">{entry.name}</span>
              </div>
              <span className="font-semibold text-gray-800">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Volume Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
            <i className="ri-bar-chart-grouped-line text-violet-600"></i>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Daily Report Volume (Last 7 Days)</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#f3f4f6" />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#f3f4f6" allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="processing" name="Processing" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
