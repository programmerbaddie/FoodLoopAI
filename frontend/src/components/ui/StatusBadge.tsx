import React from 'react';

export type StatusVariant =
  | 'safe'
  | 'warning'
  | 'critical'
  | 'info'
  | 'neutral'
  | 'success';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    safe: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
    },
    success: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
    },
    warning: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    critical: {
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-600',
    },
    info: {
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-600',
    },
    neutral: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const current = variantStyles[variant] || variantStyles.neutral;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-medium rounded-md border ${current.badge} ${paddingClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span className="truncate">{status}</span>
    </span>
  );
};
