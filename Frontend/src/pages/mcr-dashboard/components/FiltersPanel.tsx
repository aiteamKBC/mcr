import type { DashboardFilters, FilterOptions } from '../../../types/mcr';

interface FiltersPanelProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onClose: () => void;
  filterOptions?: FilterOptions;
  activeFiltersCount: number;
  onClearFilters: () => void;
  variant?: 'default' | 'fullscreen';
  className?: string;
}

export default function FiltersPanel({
  filters,
  onFiltersChange,
  onClose,
  filterOptions,
  activeFiltersCount,
  onClearFilters,
  variant = 'default',
  className = '',
}: FiltersPanelProps) {
  const handleFilterChange = (key: keyof DashboardFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const isFullscreen = variant === 'fullscreen';
  const panelClassName = isFullscreen
    ? 'rounded-[28px] border border-indigo-100 bg-[linear-gradient(180deg,#f8f7ff_0%,#eef2ff_100%)] p-7 shadow-[0_32px_90px_rgba(15,23,42,0.20)]'
    : 'rounded-xl border border-slate-200 bg-white p-6 shadow-lg';
  const accentBoxClassName = isFullscreen
    ? 'w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-sm'
    : 'w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center';
  const accentIconClassName = isFullscreen
    ? 'ri-filter-3-line text-white text-xl'
    : 'ri-filter-3-line text-indigo-600 text-xl';
  const inputClassName = isFullscreen
    ? 'w-full px-4 py-3 border border-indigo-200 bg-white/85 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all'
    : 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  const labelClassName = isFullscreen
    ? 'block text-sm font-semibold text-slate-700 mb-2.5'
    : 'block text-sm font-semibold text-slate-700 mb-2';
  const closeButtonClassName = isFullscreen
    ? 'w-11 h-11 flex items-center justify-center bg-white/80 border border-indigo-100 hover:bg-white rounded-2xl transition-colors cursor-pointer'
    : 'w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors cursor-pointer';
  const clearButtonClassName = isFullscreen
    ? 'px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap'
    : 'px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap';

  return (
    <div className={`${panelClassName} ${className}`}>
      <div className={`flex items-center justify-between ${isFullscreen ? 'mb-7' : 'mb-6'}`}>
        <div className="flex items-center gap-3">
          <div className={accentBoxClassName}>
            <i className={accentIconClassName}></i>
          </div>
          <div>
            <h3 className={`${isFullscreen ? 'text-2xl' : 'text-lg'} font-bold text-slate-900`}>Filters</h3>
            <p className={`${isFullscreen ? 'text-base text-slate-600' : 'text-sm text-slate-600'}`}>
              Refine your dashboard view
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className={clearButtonClassName}
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className={closeButtonClassName}
          >
            <i className="ri-close-line text-slate-600 text-xl"></i>
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-white/70 px-5 py-4 text-sm text-slate-600">
          Use the filters below to narrow dashboard results by date, ownership, programme, and review quality.
        </div>
      )}

      <div className={`grid grid-cols-1 ${isFullscreen ? 'md:grid-cols-2 xl:grid-cols-3 gap-5' : 'md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
        {/* Date From */}
        <div>
          <label className={labelClassName}>Date From</label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className={inputClassName}
          />
        </div>

        {/* Date To */}
        <div>
          <label className={labelClassName}>Date To</label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className={inputClassName}
          />
        </div>

        {/* Coach */}
        <div>
          <label className={labelClassName}>Coach</label>
          <select
            value={filters.coachId || ''}
            onChange={(e) => handleFilterChange('coachId', e.target.value)}
            className={`${inputClassName} cursor-pointer`}
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
          <label className={labelClassName}>Programme</label>
          <select
            value={filters.programmeId || ''}
            onChange={(e) => handleFilterChange('programmeId', e.target.value)}
            className={`${inputClassName} cursor-pointer`}
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
          <label className={labelClassName}>Group</label>
          <select
            value={filters.groupId || ''}
            onChange={(e) => handleFilterChange('groupId', e.target.value)}
            className={`${inputClassName} cursor-pointer`}
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
          <label className={labelClassName}>RAG Status</label>
          <select
            value={filters.ragStatus || ''}
            onChange={(e) => handleFilterChange('ragStatus', e.target.value as any)}
            className={`${inputClassName} cursor-pointer`}
          >
            <option value="">All Statuses</option>
            <option value="Green">Green</option>
            <option value="Amber">Amber</option>
            <option value="Red">Red</option>
          </select>
        </div>

        {/* Qualitative Rating */}
        <div className={isFullscreen ? 'xl:col-span-3' : ''}>
          <label className={labelClassName}>Qualitative Rating</label>
          <select
            value={filters.qualitativeRating || ''}
            onChange={(e) => handleFilterChange('qualitativeRating', e.target.value)}
            className={`${inputClassName} cursor-pointer`}
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
        <div className={`border-t border-slate-200 ${isFullscreen ? 'mt-7 pt-5' : 'mt-6 pt-4'}`}>
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

