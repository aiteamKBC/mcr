// MCR file header: Frontend\src\pages\mcr-dashboard\components\FiltersPanel.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import DatePickerInput from '../../../components/DatePickerInput';
import DropdownSelect from '../../../components/DropdownSelect';
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
  const selectButtonClassName = isFullscreen
    ? `${inputClassName} cursor-pointer pr-12 text-left hover:border-indigo-300 hover:bg-white shadow-[0_10px_30px_rgba(99,102,241,0.08)]`
    : `${inputClassName} cursor-pointer pr-11 text-left hover:border-indigo-300 hover:bg-white shadow-[0_10px_25px_rgba(99,102,241,0.08)]`;
  const labelClassName = isFullscreen
    ? 'block text-sm font-semibold text-slate-700 mb-2.5'
    : 'block text-sm font-semibold text-slate-700 mb-2';
  const closeButtonClassName = isFullscreen
    ? 'w-11 h-11 flex items-center justify-center bg-white/80 border border-indigo-100 hover:bg-white rounded-2xl transition-colors cursor-pointer'
    : 'w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors cursor-pointer';
  const clearButtonClassName = isFullscreen
    ? 'px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap'
    : 'px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap';
  const coachOptions = filterOptions?.coaches.map((coach) => ({
    value: coach.id,
    label: coach.name,
  })) ?? [];
  const programmeOptions = filterOptions?.programmes.map((programme) => ({
    value: programme.id,
    label: programme.name,
  })) ?? [];
  const groupOptions = filterOptions?.groups.map((group) => ({
    value: group.id,
    label: group.name,
  })) ?? [];
  const ragOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Green', label: 'Green' },
    { value: 'Amber', label: 'Amber' },
    { value: 'Red', label: 'Red' },
  ];
  const qualitativeRatingOptions = [
    { value: '', label: 'All Ratings' },
    { value: 'Outstanding', label: 'Outstanding' },
    { value: 'Good', label: 'Good' },
    { value: 'Requires Improvement', label: 'Requires Improvement' },
    { value: 'Inadequate', label: 'Inadequate' },
  ];

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
          <DatePickerInput
            value={filters.dateFrom || ''}
            onChange={(nextValue) => handleFilterChange('dateFrom', nextValue)}
            buttonClassName={inputClassName}
          />
        </div>

        {/* Date To */}
        <div>
          <label className={labelClassName}>Date To</label>
          <DatePickerInput
            value={filters.dateTo || ''}
            onChange={(nextValue) => handleFilterChange('dateTo', nextValue)}
            buttonClassName={inputClassName}
          />
        </div>

        {/* Coach */}
        <div>
          <label className={labelClassName}>Coach</label>
          <DropdownSelect
            value={filters.coachId || ''}
            onChange={(nextValue) => handleFilterChange('coachId', nextValue)}
            options={[{ value: '', label: 'All Coaches' }, ...coachOptions]}
            buttonClassName={selectButtonClassName}
          />
        </div>

        {/* Programme */}
        <div>
          <label className={labelClassName}>Programme</label>
          <DropdownSelect
            value={filters.programmeId || ''}
            onChange={(nextValue) => handleFilterChange('programmeId', nextValue)}
            options={[{ value: '', label: 'All Programmes' }, ...programmeOptions]}
            buttonClassName={selectButtonClassName}
          />
        </div>

        {/* Group */}
        <div>
          <label className={labelClassName}>Group</label>
          <DropdownSelect
            value={filters.groupId || ''}
            onChange={(nextValue) => handleFilterChange('groupId', nextValue)}
            options={[{ value: '', label: 'All Groups' }, ...groupOptions]}
            buttonClassName={selectButtonClassName}
          />
        </div>

        {/* RAG Status */}
        <div>
          <label className={labelClassName}>RAG Status</label>
          <DropdownSelect
            value={filters.ragStatus || ''}
            onChange={(nextValue) => handleFilterChange('ragStatus', nextValue as any)}
            options={ragOptions}
            buttonClassName={selectButtonClassName}
          />
        </div>

        {/* Qualitative Rating */}
        <div className={isFullscreen ? 'xl:col-span-3' : ''}>
          <label className={labelClassName}>Qualitative Rating</label>
          <DropdownSelect
            value={filters.qualitativeRating || ''}
            onChange={(nextValue) => handleFilterChange('qualitativeRating', nextValue)}
            options={qualitativeRatingOptions}
            buttonClassName={selectButtonClassName}
          />
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

