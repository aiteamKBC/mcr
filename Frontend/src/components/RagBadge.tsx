import type { RagStatus } from '../types/mcr';

interface RagBadgeProps {
  status: RagStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function RagBadge({ status, size = 'md', showLabel = true }: RagBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  const iconClasses = {
    green: 'ri-checkbox-circle-fill text-green-600',
    amber: 'ri-error-warning-fill text-amber-600',
    red: 'ri-close-circle-fill text-red-600',
  };

  const labels = {
    green: 'Green',
    amber: 'Amber',
    red: 'Red',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${sizeClasses[size]} ${colorClasses[status]}`}
    >
      <i className={iconClasses[status]}></i>
      {showLabel && labels[status]}
    </span>
  );
}