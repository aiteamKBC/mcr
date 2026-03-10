import { useState } from 'react';
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
              <span className="bg-teal-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
            <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-gray-400`}></i>
          </button>
        </div>
        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
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
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
            <select
              value={filters.model || 'all'}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Models</option>
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Version */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Prompt Version</label>
            <select
              value={filters.prompt_version || 'all'}
              onChange={(e) => handleFilterChange('prompt_version', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Versions</option>
              {promptVersionOptions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>

          {/* RAG Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">RAG Status</label>
            <select
              value={filters.rag || 'all'}
              onChange={(e) => handleFilterChange('rag', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All RAG</option>
              <option value="Green">Green</option>
              <option value="Amber">Amber</option>
              <option value="Red">Red</option>
            </select>
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
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
              From: {filters.dateFrom}
              <button
                onClick={() => handleFilterChange('dateFrom', '')}
                className="hover:text-teal-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
              To: {filters.dateTo}
              <button
                onClick={() => handleFilterChange('dateTo', '')}
                className="hover:text-teal-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.status && filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="hover:text-teal-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.model && filters.model !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
              Model: {filters.model}
              <button
                onClick={() => handleFilterChange('model', '')}
                className="hover:text-teal-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.prompt_version && filters.prompt_version !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
              Prompt: {filters.prompt_version}
              <button
                onClick={() => handleFilterChange('prompt_version', '')}
                className="hover:text-teal-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.rag && filters.rag !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
              RAG: {filters.rag}
              <button
                onClick={() => handleFilterChange('rag', '')}
                className="hover:text-teal-900 cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          )}
          {filters.booking_id && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
              Booking: {filters.booking_id}
              <button
                onClick={() => handleFilterChange('booking_id', '')}
                className="hover:text-teal-900 cursor-pointer"
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