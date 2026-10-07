import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-foodloop-surfaceDark border border-dashed border-foodloop-border dark:border-foodloop-borderDark rounded-xl transition-colors">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-foodloop-textMuted dark:text-slate-400 mb-3">
        <Icon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-foodloop-navy dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-foodloop-textMuted dark:text-foodloop-textMutedDark max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
