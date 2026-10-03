import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Share2,
  Truck,
  BarChart3,
} from 'lucide-react';
import { NavTabId } from '../types';

interface NavTabsProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
}

interface TabItem {
  id: NavTabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const TABS: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'demand',
    label: 'Demand Prediction',
    shortLabel: 'Demand',
    icon: TrendingUp,
    badge: '1,280 Portions',
  },
  {
    id: 'surplus',
    label: 'Surplus',
    shortLabel: 'Surplus',
    icon: AlertTriangle,
    badge: '170 Risk',
  },
  {
    id: 'safety',
    label: 'Safety Verification',
    shortLabel: 'Safety',
    icon: ShieldCheck,
    badge: 'FSSAI',
  },
  {
    id: 'matching',
    label: 'Recipient Matching',
    shortLabel: 'Matching',
    icon: Share2,
  },
  {
    id: 'redistribution',
    label: 'Redistribution',
    shortLabel: 'Logistics',
    icon: Truck,
    badge: '2 Transit',
  },
  {
    id: 'impact',
    label: 'Impact',
    shortLabel: 'Impact',
    icon: BarChart3,
  },
];

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-foodloop-surface border-b border-foodloop-border sticky top-16 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar"
          aria-label="Operational Navigation"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-foodloop-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-foodloop-navy hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-foodloop-green' : 'text-slate-400'
                  }`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-normal ${
                      isActive
                        ? 'bg-slate-800 text-emerald-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
