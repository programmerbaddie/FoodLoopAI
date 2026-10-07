import React, { useState, useEffect } from 'react';
import {
  Clock,
  Thermometer,
  ShieldCheck,
  Search,
  PlusCircle,
  RotateCw,
  AlertCircle,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';
import { NavTabId, SurplusItem, SurplusDetectionPayload } from '../types';
import { DEMO_SURPLUS_ITEMS } from '../data/mockData';
import { getActiveSurplus, detectSurplus } from '../services/api';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { ActionButton } from '../components/ui/ActionButton';
import { WorkflowContextBar } from '../components/ui/WorkflowContextBar';

interface SurplusPageProps {
  onNavigateTab: (tab: NavTabId) => void;
}

export const SurplusPage: React.FC<SurplusPageProps> = ({ onNavigateTab }) => {
  const [items, setItems] = useState<SurplusItem[]>(DEMO_SURPLUS_ITEMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Surplus Detection Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SurplusDetectionPayload>({
    kitchen_id: 'KITCHEN-IITD-01',
    meal_slot: 'Lunch',
    dish_name: 'Paneer Butter Masala',
    category: 'Curry & Dal',
    planned_portions: 450,
    cooked_portions: 470,
    consumed_portions: 415,
    remaining_weight_kg: 16.5,
    prep_timestamp: '12:45 IST',
    holding_temp_c: 64.5,
    storage_unit: 'Insulated Hot-Holding Cabinet #3',
  });

  const fetchSurplus = async () => {
    setLoading(true);
    try {
      const data = await getActiveSurplus();
      setItems(data);
    } catch {
      setItems(DEMO_SURPLUS_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurplus();
  }, []);

  const handleLogSurplus = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const newSurplus = await detectSurplus(formData);
      setItems((prev) => [newSurplus, ...prev]);
      setIsFormOpen(false);
      // Reset form to defaults
      setFormData({
        ...formData,
        dish_name: '',
        cooked_portions: 100,
        consumed_portions: 80,
        remaining_weight_kg: undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record surplus.';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const categories: string[] = [
    'ALL',
    'Cooked Grains',
    'Curry & Dal',
    'Breads & Rotis',
    'Vegetables',
    'Dairy & Desserts',
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalKg = items.reduce((sum, item) => sum + item.quantityKg, 0);
  const totalPortions = items.reduce(
    (sum, item) => sum + item.portionsEquivalent,
    0
  );
  const verifiedPortions = items
    .filter((item) => item.status === 'Safety Verified' || item.status === 'Verified Safe' || item.redistributionEligible)
    .reduce((sum, item) => sum + item.portionsEquivalent, 0);
  const pendingPortions = items
    .filter((item) => item.status === 'Pending Verification' || !item.redistributionEligible)
    .reduce((sum, item) => sum + item.portionsEquivalent, 0);

  return (
    <div className="space-y-6">
      {/* Workflow Navigation Context */}
      <WorkflowContextBar
        currentStage="SURPLUS"
        purpose="Track post-service meal remnants logged from institutional kitchen batch scales. Newly logged surplus requires mandatory safety signoff before recipient matching."
        prev={{ tab: 'demand', label: 'PREDICT: Demand' }}
        next={{ tab: 'safety', label: 'VERIFY: Food Safety' }}
        onNavigate={onNavigateTab}
      />

      {/* Top Banner & Telemetry */}
      <div className="bg-foodloop-surface dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
        <SectionHeader
          title="Surplus Detection & Inventory Registry"
          subtitle="Real-time tally of post-service meal remnants logged directly from institutional kitchen batch scales"
          badge="STAGE 03: SURPLUS"
          actions={
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <ActionButton
                variant="outline"
                size="sm"
                icon={RotateCw}
                onClick={fetchSurplus}
                loading={loading}
              >
                Sync
              </ActionButton>

              <ActionButton
                variant="primary"
                size="sm"
                icon={PlusCircle}
                onClick={() => setIsFormOpen(!isFormOpen)}
              >
                {isFormOpen ? 'Close Remnant Log' : 'Log Kitchen Remnant'}
              </ActionButton>

              <ActionButton
                variant="outline"
                size="sm"
                icon={ShieldCheck}
                onClick={() => onNavigateTab('safety')}
              >
                Safety Verification Station
              </ActionButton>
            </div>
          }
        />

        {/* Quick Aggregation Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-foodloop-canvas dark:bg-slate-800/60 border border-foodloop-border dark:border-slate-700">
            <span className="text-[10px] font-bold text-foodloop-textMuted dark:text-slate-400 uppercase block">
              Total Logged Today
            </span>
            <span className="text-xl font-bold text-foodloop-navy dark:text-slate-100 tabular-numbers">
              {totalKg.toFixed(1)} kg
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              ~{totalPortions} Portions
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
              Safety Verified
            </span>
            <span className="text-xl font-bold text-foodloop-green dark:text-emerald-400 tabular-numbers">
              {verifiedPortions} Portions
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400/80 block">
              Cleared for redistribution
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase block">
              Pending Check
            </span>
            <span className="text-xl font-bold text-foodloop-orange dark:text-amber-400 tabular-numbers">
              {pendingPortions} Portions
            </span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400/80 block">
              Awaiting mandatory safety signoff
            </span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
            <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block">
              Active Items Count
            </span>
            <span className="text-xl font-bold text-blue-800 dark:text-blue-400 tabular-numbers">
              {items.length} Batches
            </span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400/80 block">
              Live storage ledger
            </span>
          </div>
        </div>

        {/* Strict Safety Protocol Notice */}
        <div className="mt-4 p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Mandatory Safety Gate (Operational Hygiene Protocol):</strong> Surplus food is never marked eligible for redistribution automatically upon logging. All remnants remain held in <em>Pending Verification</em> until a physical core temperature probe (≥60.0°C for hot holding) and 4-point sensory inspection are formally logged.
          </div>
        </div>
      </div>

      {/* Interactive Remnant Logger Panel */}
      {isFormOpen && (
        <div className="bg-foodloop-surface dark:bg-slate-900 border border-foodloop-greenBorder dark:border-emerald-800/60 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-foodloop-border dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-foodloop-green dark:text-emerald-400" />
              <h3 className="text-base font-bold text-foodloop-navy dark:text-slate-100">
                Post-Service Surplus Remnant Logger
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
              Kitchen Scale Weigh-In
            </span>
          </div>

          <form onSubmit={handleLogSurplus} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Dish / Recipe Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Steamed Rice, Dal Makhani"
                  value={formData.dish_name}
                  onChange={(e) =>
                    setFormData({ ...formData, dish_name: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Food Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                >
                  <option value="Cooked Grains">Cooked Grains</option>
                  <option value="Curry & Dal">Curry & Dal</option>
                  <option value="Breads & Rotis">Breads & Rotis</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy & Desserts">Dairy & Desserts</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Meal Slot
                </label>
                <select
                  value={formData.meal_slot}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meal_slot: e.target.value as any,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snacks">Evening Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cooking Finish Timestamp
                </label>
                <input
                  type="text"
                  value={formData.prep_timestamp}
                  onChange={(e) =>
                    setFormData({ ...formData, prep_timestamp: e.target.value })
                  }
                  placeholder="e.g. 13:00 IST"
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Planned Portions
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.planned_portions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      planned_portions: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cooked Portions
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cooked_portions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cooked_portions: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Consumed Portions
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.cooked_portions}
                  value={formData.consumed_portions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consumed_portions: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Scale Remnant Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 14.5"
                  value={formData.remaining_weight_kg || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remaining_weight_kg: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observed Holding Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.holding_temp_c}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      holding_temp_c: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green tabular-numbers font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">
                  Holding Vessel / Storage Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Insulated Hot-Holding Cabinet #1, Stainless Steel Crate"
                  value={formData.storage_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, storage_unit: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-foodloop-border bg-foodloop-canvas text-foodloop-navy focus:outline-hidden focus:border-foodloop-green"
                  required
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <ActionButton
                type="submit"
                variant="primary"
                size="sm"
                icon={Sparkles}
                loading={formLoading}
              >
                Log Remnant into Registry
              </ActionButton>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-foodloop-surface dark:bg-slate-900 p-4 rounded-xl border border-foodloop-border dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-foodloop-textMuted dark:text-slate-400 uppercase mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-foodloop-navy dark:bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-foodloop-navyMuted dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-foodloop-border dark:border-slate-700 bg-foodloop-canvas dark:bg-slate-800 text-xs text-foodloop-navy dark:text-slate-100 focus:outline-hidden focus:border-foodloop-green"
          />
        </div>
      </div>

      {/* Surplus Items Table */}
      <div className="bg-foodloop-surface dark:bg-slate-900 border border-foodloop-border dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
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
            'Safe Window',
            'Current Status',
            'Redistribution Gate',
            'Action',
          ]}
          isEmpty={filteredItems.length === 0}
          emptyMessage="No surplus items found for selected filter."
        >
          {filteredItems.map((item) => {
            const isSafe =
              item.status === 'Safety Verified' ||
              item.status === 'Verified Safe' ||
              item.redistributionEligible;
            const isDiscard = item.status === 'Composted';
            return (
              <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {item.batchId}
                  {item.isDemoData && (
                    <span className="block text-[9px] text-slate-400 font-mono">
                      Synthetic Record
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-foodloop-navy dark:text-slate-100">
                  {item.dishName}
                  <span className="block text-[10px] text-slate-400 font-normal">
                    Unit: {item.storageUnit}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {item.category}
                </td>
                <td className="px-4 py-3 tabular-numbers font-medium text-foodloop-navy dark:text-slate-100 whitespace-nowrap">
                  {item.quantityKg} kg
                  <span className="block text-[10px] text-foodloop-textMuted dark:text-slate-400 font-normal">
                    ~{item.portionsEquivalent} portions
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 tabular-numbers whitespace-nowrap text-xs">
                  {item.prepTimestamp}
                </td>
                <td className="px-4 py-3 tabular-numbers whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${
                      item.holdingTempC >= 60
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    {item.holdingTempC}°C
                  </span>
                  <span className="block text-[9px] text-slate-400">
                    {item.holdingTempC >= 60 ? '≥60°C Hot Hold' : 'Danger Zone'}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-numbers text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.shelfLifeRemainingHours} hrs
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge
                    status={item.status}
                    variant={
                      item.status === 'Safety Verified' || item.status === 'Verified Safe'
                        ? 'safe'
                        : item.status === 'Pending Verification'
                        ? 'warning'
                        : item.status === 'Matched'
                        ? 'info'
                        : item.status === 'Composted'
                        ? 'critical'
                        : 'neutral'
                    }
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isSafe ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Cleared
                    </span>
                  ) : isDiscard ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded">
                      Composted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                      Held (Unverified)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {!isSafe && !isDiscard ? (
                    <ActionButton
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigateTab('safety')}
                    >
                      Verify
                    </ActionButton>
                  ) : isSafe && item.status !== 'Matched' && item.status !== 'Dispatched' ? (
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateTab('matching')}
                    >
                      Match NGO
                    </ActionButton>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.status}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </div>
  );
};
