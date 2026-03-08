import { useState } from 'react';
import type { ReviewsFilters, FilterOptions } from '../../../types/mcr';

interface ReviewsFiltersProps {
  filters: ReviewsFilters;
  filterOptions?: FilterOptions;
  onFilterChange: (filters: Partial<ReviewsFilters>) => void;
  onReset: () => void;
  isLoading: boolean;
}

export default function ReviewsFilters({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
  isLoading,
}: ReviewsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasActiveFilters = Object.keys(filters).some(
    key => key !== 'page' && key !== 'pageSize' && filters[key as keyof ReviewsFilters]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <i className="ri-filter-3-line text-teal-600"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Filter Reviews</h3>
            {hasActiveFilters && (
              <p className="text-xs text-teal-600">Active filters applied</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-1"></i>
              Reset All
            </button>
          )}
          <i
            className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-xl text-gray-400 transition-transform`}
          ></i>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-6 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date Range From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Date Range To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange({ dateTo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Coach */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Coach
              </label>
              <select
                value={filters.coachId || ''}
                onChange={(e) => onFilterChange({ coachId: e.target.value || undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="">All Coaches</option>
                {filterOptions?.coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Programme */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Programme
              </label>
              <select
                value={filters.programmeId || ''}
                onChange={(e) => onFilterChange({ programmeId: e.target.value || undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="">All Programmes</option>
                {filterOptions?.programmes.map((programme) => (
                  <option key={programme.id} value={programme.id}>
                    {programme.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Group
              </label>
              <select
                value={filters.groupId || ''}
                onChange={(e) => onFilterChange({ groupId: e.target.value || undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="">All Groups</option>
                {filterOptions?.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* RAG Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                RAG Status
              </label>
              <select
                value={filters.ragStatus || ''}
                onChange={(e) => onFilterChange({ ragStatus: e.target.value as any || undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="">All Statuses</option>
                <option value="Green">Green</option>
                <option value="Amber">Amber</option>
                <option value="Red">Red</option>
              </select>
            </div>

            {/* Qualitative Rating */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Qualitative Rating
              </label>
              <select
                value={filters.qualitativeRating || ''}
                onChange={(e) => onFilterChange({ qualitativeRating: e.target.value as any || undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="">All Ratings</option>
                <option value="Outstanding">Outstanding</option>
                <option value="Good">Good</option>
                <option value="Requires Improvement">Requires Improvement</option>
                <option value="Inadequate">Inadequate</option>
              </select>
            </div>

            {/* Safeguarding Flagged */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Safeguarding
              </label>
              <select
                value={filters.safeguardingFlagged === undefined ? '' : filters.safeguardingFlagged.toString()}
                onChange={(e) => onFilterChange({ 
                  safeguardingFlagged: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="">All</option>
                <option value="true">Flagged Only</option>
                <option value="false">Not Flagged</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by learner name, coach name, or programme..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}