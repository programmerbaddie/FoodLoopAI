import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-foodloop-green hover:bg-foodloop-greenHover text-white focus:ring-foodloop-green shadow-xs',
    secondary:
      'bg-foodloop-navy hover:bg-foodloop-navyMuted text-white dark:bg-slate-700 dark:hover:bg-slate-600 focus:ring-foodloop-navy shadow-xs',
    outline:
      'border border-foodloop-border dark:border-slate-700 bg-white dark:bg-slate-800 text-foodloop-navy dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-xs',
    ai:
      'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 shadow-xs',
    ghost:
      'text-foodloop-textMuted dark:text-slate-400 hover:text-foodloop-navy dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {Icon && !loading && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      <span>{children}</span>
    </button>
  );
};
