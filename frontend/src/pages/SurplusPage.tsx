import React, { useState } from 'react';
import {
  Clock,
  Thermometer,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { NavTabId } from '../types';
import { DEMO_SURPLUS_ITEMS } from '../data/mockData';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { ActionButton } from '../components/ui/ActionButton';

interface SurplusPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const SurplusPage: React.FC<SurplusPageProps> = ({ onNavigateTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: string[] = [
    'ALL',
    'Cooked Grains',
    'Curry & Dal',
    'Breads & Rotis',
    'Vegetables',
  ];

  const filteredItems = DEMO_SURPLUS_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalKg = DEMO_SURPLUS_ITEMS.reduce((sum, item) => sum + item.quantityKg, 0);
  const totalPortions = DEMO_SURPLUS_ITEMS.reduce(
    (sum, item) => sum + item.portionsEquivalent,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
        <SectionHeader
          title="Surplus Detection & Inventory Registry"
          subtitle="Real-time tally of post-service meal remnants logged directly from the institutional kitchen packing station"
          badge="STAGE 03: SURPLUS"
          actions={
            <ActionButton
              variant="primary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => onNavigateTab('safety')}
            >
              Verify Food Safety
            </ActionButton>
          }
        />

        {/* Quick Aggregation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-foodloop-canvas border border-foodloop-border">
            <span className="text-[10px] font-bold text-foodloop-textMuted uppercase block">
              Total Logged Today
            </span>
            <span className="text-xl font-bold text-foodloop-navy tabular-numbers">
              {totalKg.toFixed(1)} kg
            </span>
            <span className="text-[11px] text-slate-500 block">
              ~{totalPortions} Portions
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              Verified Safe
            </span>
            <span className="text-xl font-bold text-foodloop-green tabular-numbers">
              105 Portions
            </span>
            <span className="text-[11px] text-emerald-700 block">
              Temp & sensory compliant
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">
              Pending Check
            </span>
            <span className="text-xl font-bold text-foodloop-orange tabular-numbers">
              50 Portions
            </span>
            <span className="text-[11px] text-amber-700 block">
              Awaiting thermal signoff
            </span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">
              In Redistribution
            </span>
            <span className="text-xl font-bold text-blue-800 tabular-numbers">
              65 Portions
            </span>
            <span className="text-[11px] text-blue-700 block">
              Assigned to courier
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-foodloop-surface p-4 rounded-xl border border-foodloop-border shadow-xs">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-foodloop-textMuted uppercase mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-foodloop-navy text-white'
                  : 'bg-slate-100 text-foodloop-navyMuted hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish or batch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-foodloop-border bg-foodloop-canvas text-xs text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
          />
        </div>
      </div>

      {/* Surplus Items Table */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
        <SectionHeader
          title="Active Remnants Registry"
          subtitle="Real-time holding conditions, temperature logs, and verification status"
          badge={`${filteredItems.length} Records`}
        />

        <DataTable
          headers={[
            'Batch ID',
            'Dish / Menu Item',
            'Category',
            'Quantity (kg / Portions)',
            'Logged Time',
            'Holding Temp',
            'Remaining Shelf-Life',
            'Current Status',
            'Action',
          ]}
          isEmpty={filteredItems.length === 0}
          emptyMessage="No surplus items found for selected filter."
        >
          {filteredItems.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-600">
                {item.batchId}
              </td>
              <td className="px-4 py-3 font-semibold text-foodloop-navy">
                {item.dishName}
                <span className="block text-[10px] text-slate-400 font-normal">
                  Unit: {item.storageUnit}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{item.category}</td>
              <td className="px-4 py-3 tabular-numbers font-medium text-foodloop-navy">
                {item.quantityKg} kg
                <span className="block text-[10px] text-foodloop-textMuted font-normal">
                  ~{item.portionsEquivalent} portions
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 tabular-numbers">
                {item.prepTimestamp}
              </td>
              <td className="px-4 py-3 tabular-numbers">
                <span
                  className={`inline-flex items-center gap-1 font-mono font-bold ${
                    item.holdingTempC >= 60
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  {item.holdingTempC}°C
                </span>
              </td>
              <td className="px-4 py-3 tabular-numbers text-slate-600">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.shelfLifeRemainingHours} hrs safe window
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={item.status}
                  variant={
                    item.status === 'Verified Safe'
                      ? 'safe'
                      : item.status === 'Pending Verification'
                      ? 'warning'
                      : item.status === 'Matched'
                      ? 'info'
                      : 'neutral'
                  }
                  size="sm"
                />
              </td>
              <td className="px-4 py-3">
                {item.status === 'Pending Verification' ? (
                  <ActionButton
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigateTab('safety')}
                  >
                    Verify
                  </ActionButton>
                ) : item.status === 'Verified Safe' ? (
                  <ActionButton
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateTab('matching')}
                  >
                    Match NGO
                  </ActionButton>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono">Assigned</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
};
