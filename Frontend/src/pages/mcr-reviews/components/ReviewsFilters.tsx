import { useEffect, useRef, useState } from 'react';
import type { ReviewsFilters, FilterOptions } from '../../../types/mcr';

interface ReviewsFiltersProps {
  filters: ReviewsFilters;
  filterOptions?: FilterOptions;
  onFilterChange: (filters: Partial<ReviewsFilters>) => void;
  onReset: () => void;
  isLoading: boolean;
  variant?: 'inline' | 'fullscreen';
  onClose?: () => void;
}

export default function ReviewsFilters({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
  isLoading,
  variant = 'inline',
  onClose,
}: ReviewsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isFullscreen = variant === 'fullscreen';

  const hasActiveFilters = Object.keys(filters).some(
    key => key !== 'page' && key !== 'pageSize' && filters[key as keyof ReviewsFilters]
  );

  useEffect(() => {
    if (isFullscreen || !isExpanded) return;

    const frame = window.requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isExpanded]);

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const inputClassName =
    'w-full px-4 py-3 border border-indigo-200 bg-white/85 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all';
  const selectClassName = `${inputClassName} cursor-pointer`;

  const renderFiltersContent = () => (
    <>
      <div className="mb-5 rounded-2xl border border-indigo-100 bg-white/70 px-5 py-4 text-sm text-slate-600">
        Search by date, ownership, quality rating, safeguarding state, or free text.
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            Date From
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
            className={inputClassName}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            Date To
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFilterChange({ dateTo: e.target.value })}
            className={inputClassName}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            Coach
          </label>
          <select
            value={filters.coachId || ''}
            onChange={(e) => onFilterChange({ coachId: e.target.value || undefined })}
            className={selectClassName}
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

        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            Programme
          </label>
          <select
            value={filters.programmeId || ''}
            onChange={(e) => onFilterChange({ programmeId: e.target.value || undefined })}
            className={selectClassName}
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

        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            Group
          </label>
          <select
            value={filters.groupId || ''}
            onChange={(e) => onFilterChange({ groupId: e.target.value || undefined })}
            className={selectClassName}
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

        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            RAG Status
          </label>
          <select
            value={filters.ragStatus || ''}
            onChange={(e) => onFilterChange({ ragStatus: e.target.value as any || undefined })}
            className={selectClassName}
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="Green">Green</option>
            <option value="Amber">Amber</option>
            <option value="Red">Red</option>
          </select>
        </div>

        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            Qualitative Rating
          </label>
          <select
            value={filters.qualitativeRating || ''}
            onChange={(e) => onFilterChange({ qualitativeRating: e.target.value as any || undefined })}
            className={selectClassName}
            disabled={isLoading}
          >
            <option value="">All Ratings</option>
            <option value="Outstanding">Outstanding</option>
            <option value="Good">Good</option>
            <option value="Requires Improvement">Requires Improvement</option>
            <option value="Inadequate">Inadequate</option>
          </select>
        </div>

        <div>
          <label className="mb-2.5 block text-sm font-semibold text-slate-700">
            Safeguarding
          </label>
          <select
            value={filters.safeguardingFlagged === undefined ? '' : filters.safeguardingFlagged.toString()}
            onChange={(e) => onFilterChange({
              safeguardingFlagged: e.target.value === '' ? undefined : e.target.value === 'true',
            })}
            className={selectClassName}
            disabled={isLoading}
          >
            <option value="">All</option>
            <option value="true">Flagged Only</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500"></i>
        <input
          type="text"
          placeholder="Search by learner name, coach name, or programme..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
          className="w-full rounded-xl border border-indigo-200 bg-white/85 py-3 pl-11 pr-4 text-sm text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          disabled={isLoading}
        />
      </div>
    </>
  );

  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        className="rounded-[28px] border border-indigo-100 bg-[linear-gradient(180deg,#f8f7ff_0%,#eef2ff_100%)] p-7 shadow-[0_32px_90px_rgba(15,23,42,0.20)]"
      >
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 shadow-sm">
              <i className="ri-filter-3-line text-xl text-white"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Filter Reviews</h3>
              <p className="text-base text-slate-600">
                Refine your reviews list
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="whitespace-nowrap rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors cursor-pointer hover:bg-indigo-100"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-white/80 transition-colors cursor-pointer hover:bg-white"
            >
              <i className="ri-close-line text-xl text-slate-600"></i>
            </button>
          </div>
        </div>

        {renderFiltersContent()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mb-6 overflow-hidden rounded-[28px] border border-indigo-100 bg-[linear-gradient(180deg,#f7f7ff_0%,#eef2ff_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.10)] scroll-mt-24"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/35 transition-colors"
        onClick={handleToggleExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
            <i className="ri-filter-3-line text-lg text-white"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Filter Reviews</h3>
            {hasActiveFilters && (
              <p className="text-sm text-indigo-700">Active filters applied</p>
            )}
            {!hasActiveFilters && (
              <p className="text-sm text-slate-600">Refine the reviews list using the filters below</p>
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
              className="whitespace-nowrap rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors cursor-pointer hover:bg-indigo-100"
            >
              <i className="ri-refresh-line mr-1"></i>
              Reset All
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-white/80">
            <i
              className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-xl text-slate-500 transition-transform`}
            ></i>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="border-t border-indigo-100 px-5 pb-5 pt-2">
          {renderFiltersContent()}
        </div>
      )}
    </div>
  );
}

