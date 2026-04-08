
import { useState } from 'react';
import DatePickerInput from '../../../components/DatePickerInput';
import DropdownSelect from '../../../components/DropdownSelect';
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
  const selectButtonClassName =
    'w-full px-3 py-2 pr-11 text-left text-xs border border-indigo-200 bg-white rounded-lg shadow-[0_10px_24px_rgba(99,102,241,0.08)] focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all hover:border-indigo-300 cursor-pointer';
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
  ];
  const modelSelectOptions = [
    { value: '', label: 'All Models' },
    ...models.map((model) => ({ value: model, label: model })),
  ];
  const promptSelectOptions = [
    { value: '', label: 'All Versions' },
    ...promptVersions.map((version) => ({ value: version, label: version })),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <i className="ri-filter-3-line text-indigo-600"></i>
          <span className="text-sm font-semibold text-gray-800">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
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
            <DatePickerInput
              value={filters.dateFrom || ''}
              onChange={(nextValue) => onChange({ dateFrom: nextValue || undefined })}
              buttonClassName="w-full px-3 py-2 text-xs border border-indigo-200 bg-white rounded-lg shadow-[0_10px_24px_rgba(99,102,241,0.08)] focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <DatePickerInput
              value={filters.dateTo || ''}
              onChange={(nextValue) => onChange({ dateTo: nextValue || undefined })}
              buttonClassName="w-full px-3 py-2 text-xs border border-indigo-200 bg-white rounded-lg shadow-[0_10px_24px_rgba(99,102,241,0.08)] focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <DropdownSelect
              value={filters.status || ''}
              onChange={(nextValue) => onChange({ status: (nextValue as ReportStatus) || undefined })}
              options={statusOptions}
              buttonClassName={selectButtonClassName}
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
            <DropdownSelect
              value={filters.model || ''}
              onChange={(nextValue) => onChange({ model: nextValue || undefined })}
              options={modelSelectOptions}
              buttonClassName={selectButtonClassName}
            />
          </div>

          {/* Prompt Version */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prompt Version</label>
            <DropdownSelect
              value={filters.prompt_version || ''}
              onChange={(nextValue) => onChange({ prompt_version: nextValue || undefined })}
              options={promptSelectOptions}
              buttonClassName={selectButtonClassName}
            />
          </div>
        </div>
      )}
    </div>
  );
}

