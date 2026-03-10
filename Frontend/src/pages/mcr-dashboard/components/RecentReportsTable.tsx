import { useState } from 'react';
import { ReportRecord } from '../../../types/reports';
import RagBadge from '../../../components/RagBadge';

interface RecentReportsTableProps {
  reports: ReportRecord[];
  isLoading?: boolean;
}

type SortField = 'created_at' | 'status' | 'rag';
type SortDirection = 'asc' | 'desc';

export default function RecentReportsTable({ reports, isLoading }: RecentReportsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [selectedHtml, setSelectedHtml] = useState('');

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortField === 'created_at') {
      aVal = new Date(a.created_at).getTime();
      bVal = new Date(b.created_at).getTime();
    } else if (sortField === 'status') {
      aVal = a.status;
      bVal = b.status;
    } else if (sortField === 'rag') {
      aVal = a.summary_json?.overall_rating?.rag || '';
      bVal = b.summary_json?.overall_rating?.rag || '';
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedReports.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReports = sortedReports.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      failed: 'bg-rose-50 text-rose-700 border-rose-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      processing: 'bg-violet-50 text-violet-700 border-violet-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAvgQaRating = (report: ReportRecord) => {
    if (!report.summary_json?.qa || report.summary_json.qa.length === 0) return null;
    const ratings = report.summary_json.qa.map(q => q.rating_1_to_5).filter(r => r > 0);
    if (ratings.length === 0) return null;
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return avg.toFixed(1);
  };

  const openHtmlModal = (html: string) => {
    setSelectedHtml(html);
    setHtmlModalOpen(true);
  };

  const closeHtmlModal = () => {
    setHtmlModalOpen(false);
    setSelectedHtml('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <i className="ri-file-list-3-line text-6xl text-gray-300"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
        <p className="text-sm text-gray-500">Try adjusting your filters to see more results</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedReports.length)} of {sortedReports.length}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Booking ID
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1.5">
                    Status
                    <i className={`ri-arrow-${sortField === 'status' && sortDirection === 'asc' ? 'up' : 'down'}-s-line text-sm ${sortField === 'status' ? 'text-teal-600' : 'text-gray-400'}`}></i>
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rag')}
                >
                  <div className="flex items-center gap-1.5">
                    RAG
                    <i className={`ri-arrow-${sortField === 'rag' && sortDirection === 'asc' ? 'up' : 'down'}-s-line text-sm ${sortField === 'rag' ? 'text-teal-600' : 'text-gray-400'}`}></i>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Coach
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Duration Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Avg QA Rating
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1.5">
                    Created At
                    <i className={`ri-arrow-${sortField === 'created_at' && sortDirection === 'asc' ? 'up' : 'down'}-s-line text-sm ${sortField === 'created_at' ? 'text-teal-600' : 'text-gray-400'}`}></i>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedReports.map((report) => {
                const isExpanded = expandedRows.has(report.id);
                const avgQa = getAvgQaRating(report);
                const durationScore = report.summary_json?.duration_score_1_to_5;

                return (
                  <>
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(report.id)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <i className={`ri-arrow-${isExpanded ? 'down' : 'right'}-s-line text-lg text-gray-600`}></i>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {report.booking_id || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-4 py-3">
                        {report.summary_json?.overall_rating?.rag ? (
                          <RagBadge status={report.summary_json.overall_rating.rag} />
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {report.summary_json?.coach || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {report.summary_json?.learner || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {durationScore ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`ri-star-${i < durationScore ? 'fill' : 'line'} text-sm ${i < durationScore ? 'text-amber-400' : 'text-gray-300'}`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">{durationScore}/5</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {avgQa ? (
                          <div className="flex items-center gap-1.5">
                            <i className="ri-star-fill text-sm text-amber-400"></i>
                            <span className="text-sm font-medium text-gray-700">{avgQa}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(report.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => report.report_html && openHtmlModal(report.report_html)}
                          disabled={!report.report_html}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                            report.report_html
                              ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 cursor-pointer'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <i className="ri-file-text-line mr-1"></i>
                          View HTML
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={12} className="bg-gray-50 px-4 py-6">
                          <div className="max-w-6xl mx-auto space-y-6">
                            {/* Executive Summary */}
                            {report.summary_json?.executive_summary && (
                              <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <i className="ri-file-text-line text-teal-600"></i>
                                  Executive Summary
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {report.summary_json.executive_summary}
                                </p>
                              </div>
                            )}

                            {/* Strengths */}
                            {report.summary_json?.strengths && report.summary_json.strengths.length > 0 && (
                              <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <i className="ri-thumb-up-line text-emerald-600"></i>
                                  Strengths
                                </h4>
                                <ul className="space-y-2">
                                  {report.summary_json.strengths.map((strength, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                                      <i className="ri-checkbox-circle-fill text-emerald-500 mt-0.5 flex-shrink-0"></i>
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Priority Actions */}
                            {report.summary_json?.priority_actions && report.summary_json.priority_actions.length > 0 && (
                              <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <i className="ri-task-line text-violet-600"></i>
                                  Priority Actions
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Owner</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Due Date</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {report.summary_json.priority_actions.map((action, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-3 py-2.5 text-gray-900 font-medium">{action.owner}</td>
                                          <td className="px-3 py-2.5 text-gray-700">{action.action}</td>
                                          <td className="px-3 py-2.5 text-gray-600">{action.due}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* QA Metrics */}
                            {report.summary_json?.qa && report.summary_json.qa.length > 0 && (
                              <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <i className="ri-bar-chart-box-line text-blue-600"></i>
                                  QA Metrics
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Metric</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Result</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Rating</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">RAG</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {report.summary_json.qa.map((qa, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-3 py-2.5 text-gray-900 font-medium">{qa.metric}</td>
                                          <td className="px-3 py-2.5 text-gray-700">{qa.result}</td>
                                          <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-1">
                                              {[...Array(5)].map((_, i) => (
                                                <i
                                                  key={i}
                                                  className={`ri-star-${i < qa.rating_1_to_5 ? 'fill' : 'line'} text-xs ${i < qa.rating_1_to_5 ? 'text-amber-400' : 'text-gray-300'}`}
                                                ></i>
                                              ))}
                                              <span className="text-xs text-gray-600 ml-1">{qa.rating_1_to_5}/5</span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <RagBadge status={qa.rag} />
                                          </td>
                                          <td className="px-3 py-2.5 text-gray-600 max-w-md">
                                            {qa.notes}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Error Details */}
                            {report.status === 'failed' && report.error && (
                              <div className="bg-rose-50 rounded-lg border border-rose-200 p-5">
                                <h4 className="text-sm font-semibold text-rose-900 mb-3 flex items-center gap-2">
                                  <i className="ri-error-warning-line text-rose-600"></i>
                                  Error Details
                                </h4>
                                <p className="text-sm text-rose-700 font-mono bg-white rounded px-3 py-2 border border-rose-200">
                                  {report.error}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <i className="ri-arrow-left-s-line mr-1"></i>
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-teal-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="text-gray-400 px-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Next
              <i className="ri-arrow-right-s-line ml-1"></i>
            </button>
          </div>
        )}
      </div>

      {/* HTML Modal */}
      {htmlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Report HTML Preview</h3>
              <button
                onClick={closeHtmlModal}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <iframe
                srcDoc={selectedHtml}
                className="w-full h-full min-h-[600px] border border-gray-200 rounded-lg"
                title="Report HTML"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}