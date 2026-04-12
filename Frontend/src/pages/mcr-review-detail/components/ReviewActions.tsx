// MCR file header: Frontend\src\pages\mcr-review-detail\components\ReviewActions.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


interface ReviewActionsProps {
  reviewId: string;
}

export default function ReviewActions({ reviewId }: ReviewActionsProps) {
  const handlePrint = () => {
    window.REACT_APP_NAVIGATE(`/mcr/reviews/${reviewId}/print`);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Quick Actions</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-printer-line text-sm"></i>
              Print Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


