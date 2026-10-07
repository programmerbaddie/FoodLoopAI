import React from 'react';

export type StatusVariant =
  | 'safe'
  | 'success'
  | 'warning'
  | 'critical'
  | 'info'
  | 'ai'
  | 'neutral';

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
      badge:
        'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-600 dark:bg-emerald-400',
    },
    success: {
      badge:
        'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-600 dark:bg-emerald-400',
    },
    warning: {
      badge:
        'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500 dark:bg-amber-400',
    },
    critical: {
      badge:
        'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      dot: 'bg-rose-600 dark:bg-rose-400',
    },
    ai: {
      badge:
        'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      dot: 'bg-purple-600 dark:bg-purple-400',
    },
    info: {
      badge:
        'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
      dot: 'bg-sky-600 dark:bg-sky-400',
    },
    neutral: {
      badge:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400 dark:bg-slate-500',
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
