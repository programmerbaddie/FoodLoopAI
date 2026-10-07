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

interface NavSection {
  groupName?: string;
  items: {
    id: NavTabId;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      {
        id: 'overview',
        label: 'Overview',
        shortLabel: 'Overview',
        icon: LayoutDashboard,
        accentColor: 'text-blue-500',
      },
    ],
  },
  {
    groupName: 'PLAN',
    items: [
      {
        id: 'demand',
        label: 'Demand Prediction',
        shortLabel: 'Demand',
        icon: TrendingUp,
        accentColor: 'text-purple-500',
      },
    ],
  },
  {
    groupName: 'MANAGE',
    items: [
      {
        id: 'surplus',
        label: 'Surplus Inventory',
        shortLabel: 'Surplus',
        icon: AlertTriangle,
        accentColor: 'text-amber-500',
      },
      {
        id: 'safety',
        label: 'Safety Verification',
        shortLabel: 'Safety Gate',
        icon: ShieldCheck,
        accentColor: 'text-emerald-500',
      },
    ],
  },
  {
    groupName: 'REDISTRIBUTE',
    items: [
      {
        id: 'matching',
        label: 'Recipient Matching',
        shortLabel: 'Matching',
        icon: Share2,
        accentColor: 'text-sky-500',
      },
      {
        id: 'redistribution',
        label: 'Redistribution Logistics',
        shortLabel: 'Logistics',
        icon: Truck,
        accentColor: 'text-indigo-500',
      },
    ],
  },
  {
    groupName: 'IMPACT',
    items: [
      {
        id: 'impact',
        label: 'Impact & Learning',
        shortLabel: 'Impact',
        icon: BarChart3,
        accentColor: 'text-teal-500',
      },
    ],
  },
];

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-foodloop-surface dark:bg-foodloop-surfaceDark border-b border-foodloop-border dark:border-foodloop-borderDark sticky top-16 z-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-2.5 no-scrollbar"
          aria-label="Product Workflow Navigation"
        >
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
              {section.groupName && (
                <span className="hidden lg:inline-block text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-1 select-none">
                  {section.groupName}
                </span>
              )}
              {section.items.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-foodloop-navy dark:bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-foodloop-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-foodloop-green dark:text-white' : tab.accentColor
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              {idx < NAV_SECTIONS.length - 1 && (
                <div className="hidden md:block w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};
