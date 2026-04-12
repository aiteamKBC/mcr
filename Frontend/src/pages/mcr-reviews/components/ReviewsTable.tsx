// MCR file header: Frontend\src\pages\mcr-reviews\components\ReviewsTable.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useState } from 'react';
import RagBadge from '../../../components/RagBadge';
import type { EntityRef, McrReview } from '../../../types/mcr';
import { meetingListDateTimeLabels } from '../../../utils/meetingDisplay';

interface ReviewsTableProps {
  reviews: McrReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onExportAll: () => void | Promise<void>;
  isExporting?: boolean;
}

export default function ReviewsTable({
  reviews,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onExportAll,
  isExporting = false,
}: ReviewsTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const entityName = (value: EntityRef): string => (typeof value === 'string' ? value : value.name);

  const handleViewDetails = (id: string) => {
    window.REACT_APP_NAVIGATE(`/mcr/reviews/${id}`);
  };

  const handleExport = (id: string) => {
    window.REACT_APP_NAVIGATE(`/mcr/reviews/${id}/print`);
  };

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/75 bg-white/92 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(248,250,252,0.9)_100%)] px-6 py-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">Reviews List</h3>
          <p className="mt-1 text-xs text-slate-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} reviews
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void onExportAll();
          }}
          disabled={total === 0 || isExporting}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_28px_rgba(79,70,229,0.20)] transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-600 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Exporting...
            </>
          ) : (
            <>
              <i className="ri-download-line mr-2"></i>
              Export All
            </>
          )}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Learner
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Coach
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Programme
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Group
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Duration
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                RAG
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Rating
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Flags
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Satisfaction
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => {
              const { date: dateLabel } = meetingListDateTimeLabels(review);
              const learnerName = entityName(review.learner);
              const coachName = entityName(review.coach);
              const programmeName = entityName(review.programme);
              const groupName = entityName(review.group);
              return (
              <tr
                key={review.id}
                className="cursor-pointer transition-colors hover:bg-emerald-50/35"
                onClick={() => handleViewDetails(review.id)}
              >
                <td className="px-4 py-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {dateLabel}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm">
                      <span className="text-xs font-semibold text-white">
                        {learnerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {learnerName}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-slate-800">{coachName}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-slate-800">{programmeName}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-slate-500">{groupName}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                    <i className="ri-time-line text-slate-400"></i>
                    {review.totalDurationMin} min
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <RagBadge status={review.ragStatus} />
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      review.qualitativeRating === 'Outstanding'
                        ? 'bg-green-100 text-green-700'
                        : review.qualitativeRating === 'Good'
                        ? 'bg-indigo-100 text-indigo-700'
                        : review.qualitativeRating === 'Requires Improvement'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {review.qualitativeRating}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {review.safeguardingFlagged ? (
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center" title="Safeguarding Flagged">
                        <i className="ri-alert-line text-sm text-red-600"></i>
                      </div>
                    ) : review.satisfactionScore < 3 ? (
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center" title="Low Satisfaction">
                        <i className="ri-emotion-unhappy-line text-sm text-amber-600"></i>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center" title="No Concerns">
                        <i className="ri-checkbox-circle-line text-sm text-green-600"></i>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {review.satisfactionScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">/5</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpen(actionMenuOpen === review.id ? null : review.id);
                      }}
                      className="rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    >
                      <i className="ri-more-2-fill text-lg"></i>
                    </button>
                    {actionMenuOpen === review.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(null);
                          }}
                        ></div>
                        <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(review.id);
                              setActionMenuOpen(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                          >
                            <i className="ri-eye-line text-indigo-600"></i>
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport(review.id);
                              setActionMenuOpen(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                          >
                            <i className="ri-download-line text-indigo-600"></i>
                            Export Report
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <i className="ri-file-list-3-line text-3xl text-slate-400"></i>
          </div>
          <h3 className="mb-2 text-base font-semibold text-slate-900">No Reviews Found</h3>
          <p className="text-sm text-slate-500">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}

      {/* Pagination */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/65 px-6 py-4">
          <div className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-s-line mr-1"></i>
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              Next
              <i className="ri-arrow-right-s-line ml-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

