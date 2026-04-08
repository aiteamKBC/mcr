import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { addCommunicationLog } from '../../../utils/mcrApiClient';

interface CommunicationModalProps {
  reviewId: string;
  coachName: string;
  onClose: () => void;
}

type RecipientType = 'Employer' | 'Learner' | 'QA';

export default function CommunicationModal({ reviewId, coachName, onClose }: CommunicationModalProps) {
  const queryClient = useQueryClient();
  const [recipientType, setRecipientType] = useState<RecipientType>('Employer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sentBy = coachName.trim() || 'Coach';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addCommunicationLog(reviewId, {
        recipientType,
        notes: notes.trim(),
        sentBy,
      });
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
      await Swal.fire({
        icon: 'success',
        title: 'Communication sent',
        text: `Review #${reviewId}: notification sent to ${recipientType}.`,
        confirmButtonColor: '#0d9488',
      });

      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || '')
          : '';
      await Swal.fire({
        icon: 'error',
        title: 'Could not send',
        text: message || 'Please check email settings and try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <i className="ri-mail-send-line text-xl text-indigo-600"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mark as Communicated</h3>
              <p className="text-xs text-gray-500">Add communication log entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-gray-500"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Employer', 'Learner', 'QA'] as RecipientType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRecipientType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    recipientType === type
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Add any relevant notes about this communication..."
              required
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Sent By</div>
            <div className="text-sm font-medium text-gray-900">{sentBy}</div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i>
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

