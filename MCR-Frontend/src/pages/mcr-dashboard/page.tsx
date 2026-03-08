
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashboardMetrics, getFilterOptions } from '../../utils/mcrApiClient';
import type { DashboardFilters } from '../../types/mcr';
import KpiCards from './components/KpiCards';
import RagDistributionChart from './components/RagDistributionChart';
import DailyVolumeBarChart from './components/DailyVolumeBarChart';
import QaIndicatorsTrendChart from './components/QaIndicatorsTrendChart';
import RecentActivityList from './components/RecentActivityList';
import FiltersPanel from './components/FiltersPanel';

export default function MCRDashboardPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['mcr-dashboard-metrics', filters],
    queryFn: () => getDashboardMetrics(filters),
    staleTime: 30000,
  });

  const { data: filterOptions } = useQuery({
    queryKey: ['mcr-filter-options'],
    queryFn: getFilterOptions,
    staleTime: 300000,
  });

  const handleClearFilters = () => setFilters({});

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof DashboardFilters] !== undefined
  ).length;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                  <i className="ri-dashboard-3-line text-white text-base"></i>
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 tracking-tight">MCR Dashboard</span>
                  <span className="hidden lg:inline text-xs text-slate-400 ml-2 font-normal">Monthly Coach Review Analytics</span>
                </div>
              </div>
              {/* Nav pills */}
              <nav className="hidden lg:flex items-center gap-1 ml-4">
                <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">Overview</span>
                <button
                  onClick={() => navigate('/mcr/reviews')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reviews
                </button>
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <span className="hidden xl:block text-xs text-slate-400 mr-2">{dateLabel}</span>
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  showFiltersPanel
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <i className="ri-equalizer-line text-base"></i>
                Filters
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
              >
                <i className={`ri-refresh-line text-base ${isLoading ? 'animate-spin' : ''}`}></i>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => navigate('/mcr/reviews')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                <i className="ri-file-list-3-line text-base"></i>
                All Reviews
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Body ── */}
      <main className="max-w-[1800px] mx-auto px-8 py-7">

        {/* Error Banner */}
        {isError && (
          <div className="flex items-start gap-4 bg-rose-50 border border-rose-200 rounded-xl p-5 mb-6">
            <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-error-warning-line text-rose-600 text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-900">Failed to load dashboard data</p>
              <p className="text-xs text-rose-600 mt-0.5">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFiltersPanel && (
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFiltersPanel(false)}
            filterOptions={filterOptions}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* KPI Cards */}
        <KpiCards kpis={dashboardData?.kpis} isLoading={isLoading} />

        {/* Charts Row — RAG donut (narrow) + Volume bar (wide) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          <div className="lg:col-span-2">
            <RagDistributionChart
              data={dashboardData?.kpis.ragDistribution}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-3">
            <DailyVolumeBarChart
              data={dashboardData?.charts.volumeOverTime}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* QA Indicators — full width */}
        <div className="mb-5">
          <QaIndicatorsTrendChart
            data={dashboardData?.charts.qaIndicatorsTrends}
            isLoading={isLoading}
          />
        </div>

        {/* Recent Activity — full width */}
        <RecentActivityList
          activities={dashboardData?.recentActivity}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
