import { useNavigate } from 'react-router-dom';
import type { RecentActivity } from '../../../types/mcr';

interface RecentActivityListProps {
  activities?: RecentActivity[];
  isLoading?: boolean;
}

export default function RecentActivityList({ activities, isLoading }: RecentActivityListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-inbox-line text-slate-400 text-3xl"></i>
          </div>
          <p className="text-sm text-slate-600">No recent activity to display</p>
        </div>
      </div>
    );
  }

  const getRagBadgeStyles = (status: string) => {
    switch (status) {
      case 'Green':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Amber':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Red':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRagIcon = (status: string) => {
    switch (status) {
      case 'Green':
        return 'ri-checkbox-circle-fill';
      case 'Amber':
        return 'ri-error-warning-fill';
      case 'Red':
        return 'ri-close-circle-fill';
      default:
        return 'ri-question-fill';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="rounded-[30px] border border-white/75 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <p className="mt-1 text-sm text-slate-600">Latest MCR updates and completions</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50">
          <i className="ri-time-line text-indigo-600 text-xl"></i>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.reviewId}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-indigo-100/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f5f9ff_100%)] p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
            onClick={() => navigate(`/mcr/reviews/${activity.reviewId}`)}
          >
            {/* RAG Status Icon */}
            <div className={`h-12 w-12 flex-shrink-0 rounded-2xl border flex items-center justify-center ${getRagBadgeStyles(activity.ragStatus)}`}>
              <i className={`${getRagIcon(activity.ragStatus)} text-xl`}></i>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">{activity.learnerName}</h4>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getRagBadgeStyles(activity.ragStatus)}`}>
                  {activity.ragStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <i className="ri-user-line"></i>
                  {activity.coachName}
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 truncate">
                  <i className="ri-book-line"></i>
                  {activity.programmeName}
                </span>
              </div>
            </div>

            {/* Time & Action */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-600">{formatTimeAgo(activity.updatedAt)}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 transition-all duration-300 ease-out group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_10px_24px_rgba(59,130,246,0.22)]">
                <i className="ri-arrow-right-line"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <button
          onClick={() => navigate('/mcr/reviews')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 font-medium text-indigo-700 transition-colors hover:from-indigo-600 hover:to-blue-500 hover:text-white cursor-pointer whitespace-nowrap"
        >
          <span>View All Reviews</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>
  );
}

