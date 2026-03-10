import { useState } from 'react';
import RagBadge from '../../../components/RagBadge';
import type { McrReview } from '../../../types/mcr';

interface ReviewsTableProps {
  reviews: McrReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ReviewsTable({
  reviews,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
}: ReviewsTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const handleViewDetails = (id: string) => {
    window.REACT_APP_NAVIGATE(`/mcr/reviews/${id}`);
  };

  const handleExport = (id: string) => {
    // Will call API endpoint later
    console.log('Export review:', id);
    alert('Export functionality will be implemented with backend');
  };

  const handleCommunicationLog = (id: string) => {
    // Will open modal later
    console.log('Open communication log:', id);
    alert('Communication log modal will be implemented');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Reviews List</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} reviews
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-download-line mr-2"></i>
          Export All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                Learner
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                Coach
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                Programme
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                Group
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                Duration
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                RAG
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                Rating
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                Flags
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                Satisfaction
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                Communicated
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <tr
                key={review.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(review.id)}
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(review.date)}
                  </div>
                  <div className="text-xs text-gray-500">{formatTime(review.date)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {review.learner.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {review.learner.name}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{review.coach.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{review.programme.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-600">{review.group.name}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
                    <i className="ri-time-line text-gray-400"></i>
                    {review.totalDurationMin} min
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <RagBadge status={review.ragStatus} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      review.qualitativeRating === 'Outstanding'
                        ? 'bg-green-100 text-green-700'
                        : review.qualitativeRating === 'Good'
                        ? 'bg-blue-100 text-blue-700'
                        : review.qualitativeRating === 'Requires Improvement'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {review.qualitativeRating}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
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
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {review.satisfactionScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">/5</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        review.communicatedToEmployer ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                      title={review.communicatedToEmployer ? 'Employer notified' : 'Employer not notified'}
                    >
                      <i
                        className={`ri-briefcase-line text-xs ${
                          review.communicatedToEmployer ? 'text-green-600' : 'text-gray-400'
                        }`}
                      ></i>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        review.communicatedToLearner ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                      title={review.communicatedToLearner ? 'Learner notified' : 'Learner not notified'}
                    >
                      <i
                        className={`ri-user-line text-xs ${
                          review.communicatedToLearner ? 'text-green-600' : 'text-gray-400'
                        }`}
                      ></i>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        review.communicatedToQA ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                      title={review.communicatedToQA ? 'QA notified' : 'QA not notified'}
                    >
                      <i
                        className={`ri-shield-check-line text-xs ${
                          review.communicatedToQA ? 'text-green-600' : 'text-gray-400'
                        }`}
                      ></i>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpen(actionMenuOpen === review.id ? null : review.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(review.id);
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <i className="ri-eye-line text-teal-600"></i>
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport(review.id);
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <i className="ri-download-line text-blue-600"></i>
                            Export Report
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCommunicationLog(review.id);
                              setActionMenuOpen(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <i className="ri-message-3-line text-purple-600"></i>
                            Communication Log
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">No Reviews Found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}

      {/* Pagination */}
      {reviews.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
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
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
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
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
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