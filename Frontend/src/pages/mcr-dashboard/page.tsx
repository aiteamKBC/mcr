
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    if (!showFiltersPanel) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showFiltersPanel]);

  const handleFiltersToggle = () => {
    setShowFiltersPanel((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.10),_transparent_20%),linear-gradient(180deg,_#f7f7ff_0%,_#f8fafc_42%,_#f8fafc_100%)]">
      {/* â”€â”€ Top Navigation Bar â”€â”€ */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/78 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
        <div className="max-w-[1820px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[72px] gap-4">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-violet-500 to-blue-400 rounded-2xl flex items-center justify-center shadow-[0_12px_24px_rgba(79,70,229,0.28)]">
                  <i className="ri-dashboard-3-line text-white text-base"></i>
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 tracking-tight">MCR Dashboard</span>
                  <span className="hidden lg:inline text-xs text-slate-400 ml-2 font-normal">Monthly Coach Review Analytics</span>
                </div>
              </div>
              {/* Nav pills */}
              <nav className="hidden lg:flex items-center gap-1 ml-4">
                <span className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200 shadow-sm">Overview</span>
                <button
                  onClick={() => navigate('/mcr/reviews')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-white rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reviews
                </button>
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <span className="hidden xl:block text-xs text-slate-400 mr-2">{dateLabel}</span>
              <div className="relative">
                <button
                  onClick={handleFiltersToggle}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    showFiltersPanel
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                      : 'bg-white/85 border-white/80 text-slate-600 hover:border-slate-200 hover:bg-white shadow-sm'
                  }`}
                >
                  <i className="ri-equalizer-line text-base"></i>
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                  <i className={`ri-arrow-${showFiltersPanel ? 'up' : 'down'}-s-line text-base`}></i>
                </button>
              </div>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3.5 py-2 bg-white/85 border border-white/80 text-slate-600 hover:border-slate-200 hover:bg-white rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 shadow-sm"
              >
                <i className={`ri-refresh-line text-base ${isLoading ? 'animate-spin' : ''}`}></i>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => navigate('/mcr/reviews')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shadow-[0_14px_30px_rgba(79,70,229,0.24)] hover:-translate-y-0.5"
              >
                <i className="ri-file-list-3-line text-base"></i>
                All Reviews
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* â”€â”€ Page Body â”€â”€ */}
      <main className="max-w-[1820px] mx-auto px-6 lg:px-8 py-8">

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

        {/* KPI Cards */}
        <KpiCards kpis={dashboardData?.kpis} isLoading={isLoading} />

        {/* Charts Row â€” RAG donut (narrow) + Volume bar (wide) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
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

        {/* QA Indicators â€” full width */}
        <div className="mb-6">
          <QaIndicatorsTrendChart
            data={dashboardData?.charts.qaIndicatorsTrends}
            isLoading={isLoading}
          />
        </div>

        {/* Recent Activity â€” full width */}
        <RecentActivityList
          activities={dashboardData?.recentActivity}
          isLoading={isLoading}
        />
      </main>
      {showFiltersPanel && createPortal(
        <div
          className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(15,23,42,0.24)] backdrop-blur-[3px]"
          onClick={() => setShowFiltersPanel(false)}
        >
          <div className="mx-auto flex min-h-full w-full max-w-[1800px] items-start justify-center px-6 pb-6 pt-24">
            <div
              className="w-full max-w-[1680px]"
              onClick={(event) => event.stopPropagation()}
            >
              <FiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFiltersPanel(false)}
                filterOptions={filterOptions}
                activeFiltersCount={activeFiltersCount}
                onClearFilters={handleClearFilters}
                variant="fullscreen"
                className="mb-0"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

