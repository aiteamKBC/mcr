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
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
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
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <p className="text-sm text-slate-600 mt-1">Latest MCR updates and completions</p>
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <i className="ri-time-line text-slate-600 text-xl"></i>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.reviewId}
            className="group flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
            onClick={() => navigate(`/mcr/reviews/${activity.reviewId}`)}
          >
            {/* RAG Status Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${getRagBadgeStyles(activity.ragStatus)}`}>
              <i className={`${getRagIcon(activity.ragStatus)} text-xl`}></i>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">{activity.learnerName}</h4>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRagBadgeStyles(activity.ragStatus)}`}>
                  {activity.ragStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <i className="ri-user-line"></i>
                  {activity.coachName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 truncate">
                  <i className="ri-book-line"></i>
                  {activity.programmeName}
                </span>
              </div>
            </div>

            {/* Time & Action */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-600">{formatTimeAgo(activity.updatedAt)}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {new Date(activity.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <i className="ri-arrow-right-line text-slate-400 group-hover:text-slate-600 transition-colors"></i>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate('/mcr/reviews')}
          className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>View All Reviews</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>
  );
}