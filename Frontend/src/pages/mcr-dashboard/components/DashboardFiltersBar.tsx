// MCR file header: Frontend\src\pages\mcr-dashboard\components\DashboardFiltersBar.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useState } from 'react';
import DatePickerInput from '../../../components/DatePickerInput';
import DropdownSelect from '../../../components/DropdownSelect';
import { ReportDashboardFilters } from '../../../types/reports';

interface DashboardFiltersBarProps {
  filters: ReportDashboardFilters;
  onFiltersChange: (filters: ReportDashboardFilters) => void;
  modelOptions: string[];
  promptVersionOptions: string[];
}

export default function DashboardFiltersBar({
  filters,
  onFiltersChange,
  modelOptions,
  promptVersionOptions,
}: DashboardFiltersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof ReportDashboardFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((v) => v && v !== 'all').length;
  };

  const activeCount = getActiveFilterCount();
  const selectButtonClassName =
    'w-full px-3 py-2 pr-11 text-left text-sm border border-indigo-200 bg-white rounded-md shadow-[0_10px_25px_rgba(99,102,241,0.08)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-300 transition-all cursor-pointer';
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
  ];
  const modelSelectOptions = [
    { value: 'all', label: 'All Models' },
    ...modelOptions.map((model) => ({ value: model, label: model })),
  ];
  const promptSelectOptions = [
    { value: 'all', label: 'All Versions' },
    ...promptVersionOptions.map((version) => ({ value: version, label: version })),
  ];
  const ragOptions = [
    { value: 'all', label: 'All RAG' },
    { value: 'Green', label: 'Green' },
    { value: 'Amber', label: 'Amber' },
    { value: 'Red', label: 'Red' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            <i className={`ri-filter-3-line text-lg`}></i>
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
            <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-gray-400`}></i>
          </button>
        </div>
        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line"></i>
            Reset All
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
            <DatePickerInput
              value={filters.dateFrom || ''}
              onChange={(nextValue) => handleFilterChange('dateFrom', nextValue)}
              buttonClassName="w-full px-3 py-2 text-sm border border-indigo-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-[0_10px_25px_rgba(99,102,241,0.08)]"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
            <DatePickerInput
              value={filters.dateTo || ''}
              onChange={(nextValue) => handleFilterChange('dateTo', nextValue)}
              buttonClassName="w-full px-3 py-2 text-sm border border-indigo-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-[0_10px_25px_rgba(99,102,241,0.08)]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <DropdownSelect
              value={filters.status || 'all'}
              onChange={(nextValue) => handleFilterChange('status', nextValue)}
              options={statusOptions}
              buttonClassName={selectButtonClassName}
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
            <DropdownSelect
              value={filters.model || 'all'}
              onChange={(nextValue) => handleFilterChange('model', nextValue)}
              options={modelSelectOptions}
              buttonClassName={selectButtonClassName}
            />
          </div>

          {/* Prompt Version */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Prompt Version</label>
            <DropdownSelect
              value={filters.prompt_version || 'all'}
              onChange={(nextValue) => handleFilterChange('prompt_version', nextValue)}
              options={promptSelectOptions}
              buttonClassName={selectButtonClassName}
            />
          </div>

          {/* RAG Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">RAG Status</label>
            <DropdownSelect
              value={filters.rag || 'all'}
              onChange={(nextValue) => handleFilterChange('rag', nextValue)}
              options={ragOptions}
              buttonClassName={selectButtonClassName}
            />
          </div>

          {/* Booking ID Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search Booking ID</label>
            <div className="relative">
              <input
                type="text"
                value={filters.booking_id || ''}
                onChange={(e) => handleFilterChange('booking_id', e.target.value)}
                placeholder="Enter booking ID..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && activeCount > 0 && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {filters.dateFrom && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              From: {filters.dateFrom}
              <button
                onClick={() => handleFilterChange('dateFrom', '')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              To: {filters.dateTo}
              <button
                onClick={() => handleFilterChange('dateTo', '')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.status && filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.model && filters.model !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              Model: {filters.model}
              <button
                onClick={() => handleFilterChange('model', '')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.prompt_version && filters.prompt_version !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              Prompt: {filters.prompt_version}
              <button
                onClick={() => handleFilterChange('prompt_version', '')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.rag && filters.rag !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              RAG: {filters.rag}
              <button
                onClick={() => handleFilterChange('rag', '')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.booking_id && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
              Booking: {filters.booking_id}
              <button
                onClick={() => handleFilterChange('booking_id', '')}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
