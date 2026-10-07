import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  badge?: {
    text: string;
    variant: 'green' | 'orange' | 'blue' | 'purple' | 'red' | 'neutral';
  };
  icon?: LucideIcon;
  variant?: 'default' | 'highlight' | 'warning' | 'critical' | 'ai';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  badge,
  icon: Icon,
  variant = 'default',
}) => {
  const borderClass =
    variant === 'highlight'
      ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800'
      : variant === 'warning'
      ? 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800'
      : variant === 'critical'
      ? 'border-rose-300 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-800'
      : variant === 'ai'
      ? 'border-purple-300 bg-purple-50/40 dark:bg-purple-950/20 dark:border-purple-800'
      : 'border-foodloop-border dark:border-foodloop-borderDark bg-foodloop-surface dark:bg-foodloop-surfaceDark';

  const badgeColorClass = {
    green:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    orange:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    blue:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    purple:
      'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    red:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }[badge?.variant || 'neutral'];

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-sm ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-foodloop-textMuted dark:text-foodloop-textMutedDark">
          {label}
        </p>
        {Icon && (
          <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-foodloop-navy dark:text-slate-200 shadow-2xs">
            <Icon className="w-4 h-4 text-foodloop-navyMuted dark:text-slate-300" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foodloop-navy dark:text-slate-100 tabular-numbers">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-foodloop-textMuted dark:text-foodloop-textMutedDark">{unit}</span>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-xs">
          {subtext && (
            <span className="text-[11px] text-foodloop-textMuted dark:text-foodloop-textMutedDark leading-tight">
              {subtext}
            </span>
          )}
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColorClass}`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
