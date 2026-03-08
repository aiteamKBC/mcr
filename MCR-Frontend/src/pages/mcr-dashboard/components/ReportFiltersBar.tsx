
import { useState } from 'react';
import type { ReportDashboardFilters, ReportStatus } from '../../../types/reports';

interface ReportFiltersBarProps {
  filters: ReportDashboardFilters;
  models: string[];
  promptVersions: string[];
  onChange: (f: Partial<ReportDashboardFilters>) => void;
  onReset: () => void;
}

export default function ReportFiltersBar({
  filters,
  models,
  promptVersions,
  onChange,
  onReset,
}: ReportFiltersBarProps) {
  const [open, setOpen] = useState(true);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <i className="ri-filter-3-line text-teal-600"></i>
          <span className="text-sm font-semibold text-gray-800">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-1"></i>Reset
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className={`ri-arrow-${open ? 'up' : 'down'}-s-line text-base`}></i>
          </button>
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onChange({ status: (e.target.value as ReportStatus) || undefined })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
            <select
              value={filters.model || ''}
              onChange={(e) => onChange({ model: e.target.value || undefined })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              <option value="">All Models</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Prompt Version */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prompt Version</label>
            <select
              value={filters.prompt_version || ''}
              onChange={(e) => onChange({ prompt_version: e.target.value || undefined })}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              <option value="">All Versions</option>
              {promptVersions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
