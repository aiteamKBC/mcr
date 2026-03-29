
import type { EntityRef, McrReview } from '../../../types/mcr';
import RagBadge from '../../../components/RagBadge';
import { formatReviewMeetingForHeader } from '../../../utils/meetingDisplay';

interface ReviewHeaderProps {
  review: McrReview;
}

const qualitativeConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Outstanding:          { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Strong:               { bg: 'bg-indigo-50',     text: 'text-indigo-700',    dot: 'bg-indigo-500' },
  'Requires Improvement': { bg: 'bg-amber-50',  text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Cause for Concern':  { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500' },
};

export default function ReviewHeader({ review }: ReviewHeaderProps) {
  const qConfig = qualitativeConfig[review.qualitativeRating] ?? {
    bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400',
  };

  const displayName = (value: EntityRef): string => (typeof value === 'string' ? value : value.name);
  const learnerName = displayName(review.learner);
  const coachName = displayName(review.coach);
  const programmeName = displayName(review.programme);
  const groupName = displayName(review.group);

  const initials = learnerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-violet-500 to-blue-400" />

      <div className="p-6">
        {/* â”€â”€ Main row â”€â”€ */}
        <div className="flex items-start justify-between gap-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-lg font-bold tracking-wide">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{learnerName}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="ri-user-star-line text-indigo-500"></i>
                  {coachName}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="ri-calendar-event-line text-indigo-500"></i>
                  {formatReviewMeetingForHeader(review)}
                </span>
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <RagBadge status={review.ragStatus} size="lg" />
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${qConfig.bg} ${qConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${qConfig.dot}`}></span>
              {review.qualitativeRating}
            </div>
          </div>
        </div>

        {/* â”€â”€ Divider â”€â”€ */}
        <div className="border-t border-gray-100 my-5" />

        {/* â”€â”€ Info grid â”€â”€ */}
        <div className="grid grid-cols-3 gap-4">
          {/* Programme */}
          <div className="group">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Programme</p>
            <p className="text-sm font-semibold text-gray-800 leading-snug">{programmeName}</p>
          </div>

          {/* Group */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Group</p>
            <p className="text-sm font-semibold text-gray-800">{groupName}</p>
          </div>

          {/* Duration */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Duration</p>
            <div className="flex items-center gap-1.5">
              <i className="ri-time-line text-indigo-500 text-sm"></i>
              <p className="text-sm font-semibold text-gray-800">{review.totalDurationMin} min</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

