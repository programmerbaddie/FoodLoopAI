import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { Pipeline } from './components/ui/Pipeline';
import { OverviewPage } from './pages/OverviewPage';
import { DemandPredictionPage } from './pages/DemandPredictionPage';
import { SurplusPage } from './pages/SurplusPage';
import { SafetyVerificationPage } from './pages/SafetyVerificationPage';
import { RecipientMatchingPage } from './pages/RecipientMatchingPage';
import { RedistributionPage } from './pages/RedistributionPage';
import { ImpactPage } from './pages/ImpactPage';
import { checkBackendHealth } from './services/api';
import { NavTabId } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [loading, setLoading] = useState<boolean>(false);

  const refreshTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      await checkBackendHealth();
    } catch {
      // Graceful offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 60000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  return (
    <div className="min-h-screen flex flex-col bg-foodloop-canvas dark:bg-foodloop-canvasDark text-foodloop-navy dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* Brand Header with Theme Toggle */}
      <Header onRefreshData={refreshTelemetry} isRefreshing={loading} />

      {/* Main Operational Tabs Navigation */}
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Operational Flow Pipeline — Clickable across all stages */}
        <Pipeline activeTab={activeTab} onSelectStage={setActiveTab} />

        {/* Dynamic Route View */}
        <section aria-label="Active Operational Module">
          {activeTab === 'overview' && (
            <OverviewPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'demand' && (
            <DemandPredictionPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'surplus' && (
            <SurplusPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'safety' && (
            <SafetyVerificationPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'matching' && (
            <RecipientMatchingPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'redistribution' && (
            <RedistributionPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'impact' && (
            <ImpactPage onNavigateTab={setActiveTab} />
          )}
        </section>
      </main>

      {/* Subtle Global Product Footer */}
      <footer className="border-t border-foodloop-border dark:border-foodloop-borderDark bg-foodloop-surface dark:bg-foodloop-surfaceDark py-6 text-xs text-foodloop-textMuted dark:text-foodloop-textMutedDark mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-bold text-foodloop-navy dark:text-slate-200">FoodLoop</span>
            <span>•</span>
            <span>Smart Food Waste Reduction & Sustainable Redistribution</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 text-[11px]">
            <span>Powered by Impact Innovators</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
