
import { format } from 'date-fns';
import type { McrReview } from '../../../types/mcr';
import RagBadge from '../../../components/RagBadge';

interface ReviewHeaderProps {
  review: McrReview;
}

const qualitativeConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Outstanding:          { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Strong:               { bg: 'bg-teal-50',     text: 'text-teal-700',    dot: 'bg-teal-500' },
  'Requires Improvement': { bg: 'bg-amber-50',  text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Cause for Concern':  { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500' },
};

export default function ReviewHeader({ review }: ReviewHeaderProps) {
  const qConfig = qualitativeConfig[review.qualitativeRating] ?? {
    bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400',
  };

  const initials = review.learner
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-400" />

      <div className="p-6">
        {/* ── Main row ── */}
        <div className="flex items-start justify-between gap-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-lg font-bold tracking-wide">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{review.learner}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="ri-user-star-line text-teal-500"></i>
                  {review.coach}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="ri-calendar-event-line text-teal-500"></i>
                  {format(new Date(review.date), 'dd MMM yyyy, HH:mm')}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <i className="ri-hashtag text-teal-500"></i>
                  {review.id}
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

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 my-5" />

        {/* ── Info grid ── */}
        <div className="grid grid-cols-4 gap-4">
          {/* Programme */}
          <div className="group">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Programme</p>
            <p className="text-sm font-semibold text-gray-800 leading-snug">{review.programme}</p>
          </div>

          {/* Group */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Group</p>
            <p className="text-sm font-semibold text-gray-800">{review.group}</p>
          </div>

          {/* Duration */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Duration</p>
            <div className="flex items-center gap-1.5">
              <i className="ri-time-line text-teal-500 text-sm"></i>
              <p className="text-sm font-semibold text-gray-800">{review.totalDurationMin} min</p>
            </div>
          </div>

          {/* Meeting link */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Meeting Link</p>
            {review.meetingLink ? (
              <a
                href={review.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
              >
                <i className="ri-video-chat-line text-sm"></i>
                Join Meeting
                <i className="ri-external-link-line text-xs"></i>
              </a>
            ) : (
              <p className="text-sm text-gray-400">Not available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
