import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Share2,
  Truck,
  Activity,
} from 'lucide-react';

export type TabKey =
  | 'overview'
  | 'demand'
  | 'verification'
  | 'recipients'
  | 'logistics'
  | 'system';

interface NavTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const TABS: TabItem[] = [
  { key: 'overview', label: 'Overview Shell', icon: LayoutDashboard },
  { key: 'demand', label: 'Demand Forecasting', icon: TrendingUp, tag: 'Phase 2' },
  { key: 'verification', label: 'Safety Verification', icon: ShieldCheck, tag: 'Phase 3' },
  { key: 'recipients', label: 'Recipient Engine', icon: Share2, tag: 'Phase 4' },
  { key: 'logistics', label: 'Pickup & Dispatch', icon: Truck, tag: 'Phase 5' },
  { key: 'system', label: 'Backend Diagnostics', icon: Activity },
];

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="flex space-x-1 border-b border-foodloop-border overflow-x-auto py-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-foodloop-green text-white font-semibold shadow-xs'
                : 'text-foodloop-navyMuted hover:text-foodloop-navy hover:bg-slate-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.tag && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive
                    ? 'bg-green-800 text-green-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.tag}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
