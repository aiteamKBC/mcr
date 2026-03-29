import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReviews, getFilterOptions } from '../../utils/mcrApiClient';
import { exportReviewsListToCsv } from '../../utils/reviewsExport';
import ReviewsTable from './components/ReviewsTable';
import ReviewsFilters from './components/ReviewsFilters';
import type { ReviewsFilters as ReviewsFiltersType } from '../../types/mcr';

export default function McrReviews() {
  const [filters, setFilters] = useState<ReviewsFiltersType>({
    page: 1,
    pageSize: 10,
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: getFilterOptions,
  });

  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => getReviews(filters),
  });

  const handleFilterChange = (newFilters: Partial<ReviewsFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 10 });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExportAll = async () => {
    if (!reviewsData || reviewsData.total === 0 || isExporting) return;
    setIsExporting(true);
    try {
      const exportPageSize = Math.max(reviewsData.total, 1);
      const { data: allRows } = await getReviews({ ...filters, page: 1, pageSize: exportPageSize });
      exportReviewsListToCsv(allRows);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.10),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.08),_transparent_22%),linear-gradient(180deg,_#f7f7ff_0%,_#f8fafc_40%,_#f8fafc_100%)]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 border-b border-white/70 bg-white/78 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
        <div className="max-w-[1380px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-blue-400 shadow-[0_12px_24px_rgba(79,70,229,0.24)]">
                <i className="ri-file-list-3-line text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">MCR Reviews</h1>
                <p className="text-xs text-gray-500">Monthly Coach Review Records</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/mcr/dashboard')}
                className="rounded-xl border border-white/80 bg-white/85 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-white cursor-pointer whitespace-nowrap"
              >
                <i className="ri-dashboard-line mr-2"></i>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1380px] mx-auto px-6 py-8">
        {/* Filters Panel */}
        <ReviewsFilters
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isLoading={filtersLoading}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full border-[3px] border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
              <p className="text-sm text-gray-500">Loading reviews...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50/90 p-6 text-center shadow-[0_10px_30px_rgba(244,63,94,0.08)]">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-3xl text-red-500"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reviews</h3>
            <p className="text-sm text-gray-600">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        )}

        {/* Reviews Table */}
        {!isLoading && !error && reviewsData && (
          <ReviewsTable
            reviews={reviewsData.data}
            total={reviewsData.total}
            page={reviewsData.page}
            pageSize={reviewsData.pageSize}
            totalPages={reviewsData.totalPages}
            onPageChange={handlePageChange}
            onExportAll={handleExportAll}
            isExporting={isExporting}
          />
        )}
      </div>
    </div>
  );
}

