import { useState } from 'react';
import CommunicationModal from './CommunicationModal';

interface ReviewActionsProps {
  reviewId: string;
}

export default function ReviewActions({ reviewId }: ReviewActionsProps) {
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);

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
            <button
              onClick={() => setShowCommunicationModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <i className="ri-mail-send-line text-sm"></i>
              Mark Communicated
            </button>
          </div>
        </div>
      </div>

      {showCommunicationModal && (
        <CommunicationModal
          reviewId={reviewId}
          onClose={() => setShowCommunicationModal(false)}
        />
      )}
    </>
  );
}

