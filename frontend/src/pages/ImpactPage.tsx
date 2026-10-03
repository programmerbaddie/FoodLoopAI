import React from 'react';
import {
  Award,
  Leaf,
  Droplets,
  Users,
  RotateCw,
  TrendingDown,
} from 'lucide-react';
import { DEMO_IMPACT_SUMMARY } from '../data/mockData';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { DataTable } from '../components/ui/DataTable';

export const ImpactPage: React.FC = () => {
  const imp = DEMO_IMPACT_SUMMARY;

  const monthlyHeaders = [
    'Month',
    'Total Planned Portions',
    'Actual Diner Consumption',
    'Portions Rescued & Redistributed',
    'Organic Waste Diverted (kg)',
    'Institutional Efficiency',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs">
        <SectionHeader
          title="Impact Telemetry & Closed-Loop Learning"
          subtitle="Longitudinal environmental and nutritional accounting with automated model feedback calibration"
          badge="STAGE 07: LEARN"
        />

        <div className="mt-4 p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
          <RotateCw className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>The Closed-Loop Feedback Principle:</strong> Every actual consumption variance logged today automatically feeds back into the Demand Prediction weights for future Friday meal shifts. This continuously shrinks the gap between planned preparation and actual consumption over time.
          </div>
        </div>
      </div>

      {/* Aggregate ESG & Environmental Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Meals Rescued"
          value={imp.totalMealsRescued.toLocaleString()}
          unit="portions"
          subtext="Nutritious meals delivered to verified shelters"
          badge={{ text: 'Verified Handoffs', variant: 'green' }}
          icon={Award}
          variant="highlight"
        />

        <MetricCard
          label="Organic Waste Diverted"
          value={`${imp.totalKgWasteDiverted.toLocaleString()} kg`}
          subtext="Diverted entirely from municipal landfills"
          badge={{ text: 'Zero Landfill', variant: 'green' }}
          icon={Leaf}
        />

        <MetricCard
          label="Avoided Greenhouse Gas"
          value={`${imp.ghgAvoidedCo2eKg.toLocaleString()} kg`}
          unit="CO₂e"
          subtext="Calculated using MoEFCC & IPCC methane factors"
          badge={{ text: 'Emissions Offset', variant: 'blue' }}
          icon={TrendingDown}
        />

        <MetricCard
          label="Virtual Water Conserved"
          value={`${(imp.waterSavedLiters / 1000000).toFixed(2)}M`}
          unit="liters"
          subtext="Embedded agricultural irrigation footprint preserved"
          badge={{ text: 'Water Saved', variant: 'blue' }}
          icon={Droplets}
        />
      </div>

      {/* Secondary Metrics & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Category Composition */}
        <div className="bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
          <SectionHeader
            title="Surplus Category Breakdown"
            subtitle="Composition of food items diverted across the current quarter"
          />

          <div className="space-y-3">
            {imp.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foodloop-navy">{cat.category}</span>
                  <span className="font-mono text-slate-500">
                    {cat.percentage}% ({cat.rescuedKg} kg)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-foodloop-green h-2 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-foodloop-canvas text-xs text-foodloop-textMuted border border-foodloop-border flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-foodloop-green" />
              <span>Beneficiaries Reached:</span>
            </span>
            <span className="font-bold text-foodloop-navy tabular-numbers">
              {imp.beneficiaryCountServed.toLocaleString()} people
            </span>
          </div>
        </div>

        {/* Right: Longitudinal Trend Table (2 columns width) */}
        <div className="lg:col-span-2 bg-foodloop-surface border border-foodloop-border rounded-xl p-5 shadow-xs space-y-4">
          <SectionHeader
            title="Monthly Waste Reduction & Consumption Baseline"
            subtitle="Demonstrating progressive baseline accuracy improvements over time"
          />

          <DataTable headers={monthlyHeaders}>
            {imp.monthlyTrends.map((row) => {
              const efficiency = (
                (row.actualConsumedPortions / row.plannedPortions) *
                100
              ).toFixed(1);

              return (
                <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foodloop-navy">
                    {row.month}
                  </td>
                  <td className="px-4 py-3 tabular-numbers text-slate-600">
                    {row.plannedPortions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-numbers font-medium text-foodloop-navy">
                    {row.actualConsumedPortions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-numbers text-foodloop-green font-semibold">
                    {row.rescuedPortions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-numbers font-mono text-slate-700">
                    {row.divertedKg} kg
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {efficiency}% Efficiency
                    </span>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>
      </div>
    </div>
  );
};
