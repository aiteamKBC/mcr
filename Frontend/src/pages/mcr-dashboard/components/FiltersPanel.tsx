import type { DashboardFilters, FilterOptions } from '../../../types/mcr';

interface FiltersPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onClose: () => void;
  filterOptions?: FilterOptions;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export default function FiltersPanel({
  filters,
  onFiltersChange,
  onClose,
  filterOptions,
  activeFiltersCount,
  onClearFilters,
}: FiltersPanelProps) {
  const handleFilterChange = (key: keyof DashboardFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <i className="ri-filter-3-line text-indigo-600 text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
            <p className="text-sm text-slate-600">Refine your dashboard view</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-slate-600 text-xl"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date From */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Date From</label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Date To</label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Coach */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Coach</label>
          <select
            value={filters.coachId || ''}
            onChange={(e) => handleFilterChange('coachId', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Programme</label>
          <select
            value={filters.programmeId || ''}
            onChange={(e) => handleFilterChange('programmeId', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Group</label>
          <select
            value={filters.groupId || ''}
            onChange={(e) => handleFilterChange('groupId', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">RAG Status</label>
          <select
            value={filters.ragStatus || ''}
            onChange={(e) => handleFilterChange('ragStatus', e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Green">Green</option>
            <option value="Amber">Amber</option>
            <option value="Red">Red</option>
          </select>
        </div>

        {/* Qualitative Rating */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Qualitative Rating</label>
          <select
            value={filters.qualitativeRating || ''}
            onChange={(e) => handleFilterChange('qualitativeRating', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All Ratings</option>
            <option value="Outstanding">Outstanding</option>
            <option value="Good">Good</option>
            <option value="Requires Improvement">Requires Improvement</option>
            <option value="Inadequate">Inadequate</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <i className="ri-information-line"></i>
            <span>
              <strong>{activeFiltersCount}</strong> {activeFiltersCount === 1 ? 'filter' : 'filters'} applied
            </span>
          </div>
        </div>
      )}
    </div>
  );
}