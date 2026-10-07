import React from 'react';
import { Sun, Moon, MapPin, RefreshCw } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefreshData, isRefreshing = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-foodloop-border dark:border-foodloop-borderDark bg-foodloop-surface dark:bg-foodloop-surfaceDark sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Product Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-foodloop-green flex items-center justify-center text-white shadow-xs font-bold text-lg tracking-tight select-none">
              FL
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-foodloop-navy dark:text-slate-100">
                  FoodLoop
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-foodloop-green dark:text-emerald-400 border border-foodloop-greenBorder dark:border-emerald-800">
                  Operations Console
                </span>
              </div>
              <p className="text-xs text-foodloop-textMuted dark:text-foodloop-textMutedDark hidden md:block">
                Institutional Food Waste Reduction & Sustainable Redistribution
              </p>
            </div>
          </div>

          {/* Facility Scope & Theme Controls */}
          <div className="flex items-center space-x-3">
            {/* Active Facility Chip */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-foodloop-green" />
              <span>IIT Delhi Central Dining Facility</span>
            </div>

            {/* Optional Manual Sync Button */}
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                disabled={isRefreshing}
                title="Refresh operational data"
                className="p-2 rounded-lg border border-foodloop-border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-foodloop-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-foodloop-green' : ''}`} />
              </button>
            )}

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-foodloop-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
