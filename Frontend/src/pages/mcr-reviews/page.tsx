import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReviews, getFilterOptions } from '../../utils/mcrApiClient';
import ReviewsTable from './components/ReviewsTable';
import ReviewsFilters from './components/ReviewsFilters';
import type { ReviewsFilters as ReviewsFiltersType } from '../../types/mcr';

export default function McrReviews() {
  const [filters, setFilters] = useState<ReviewsFiltersType>({
    page: 1,
    pageSize: 10,
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-3-line text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">MCR Reviews</h1>
                <p className="text-xs text-gray-500">Monthly Coach Review Records</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.REACT_APP_NAVIGATE('/mcr/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-dashboard-line mr-2"></i>
                Dashboard
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <i className="ri-notification-3-line text-xl"></i>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <i className="ri-settings-3-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
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
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading reviews...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
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
          />
        )}
      </div>
    </div>
  );
}