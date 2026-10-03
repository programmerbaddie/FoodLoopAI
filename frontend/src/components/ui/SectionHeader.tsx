import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-foodloop-border gap-2">
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foodloop-navy">
            {title}
          </h2>
          {badge && (
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-foodloop-textMuted mt-0.5">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center space-x-2 self-start sm:self-auto">{actions}</div>}
    </div>
  );
};
