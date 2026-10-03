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
import { checkBackendHealth, HealthStatus } from './services/api';
import { NavTabId } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkBackendHealth();
      setHealth(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(errorMessage);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="min-h-screen flex flex-col bg-foodloop-canvas text-foodloop-navy selection:bg-emerald-100 selection:text-emerald-900">
      {/* Brand Header with Live Health Indicator */}
      <Header health={health} loading={loading} error={error} />

      {/* Main Operational Tabs Navigation */}
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Operational Flow Pipeline — Clickable across all stages */}
        <Pipeline activeTab={activeTab} onSelectStage={setActiveTab} />

        {/* Dynamic Route View */}
        <section aria-label="Active Operational Module">
          {activeTab === 'overview' && (
            <OverviewPage
              onNavigateTab={setActiveTab}
              health={health}
              loadingHealth={loading}
              onRefreshHealth={fetchHealth}
            />
          )}

          {activeTab === 'demand' && <DemandPredictionPage />}

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

          {activeTab === 'impact' && <ImpactPage />}
        </section>
      </main>

      {/* Institutional Compliance Footer */}
      <footer className="border-t border-foodloop-border bg-foodloop-surface py-6 text-xs text-foodloop-textMuted mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-bold text-foodloop-navy">FoodLoop AI</span>
            <span>•</span>
            <span>Smart India Hackathon 2026 (SIH26234)</span>
            <span>•</span>
            <span>Ministry of Food Processing Industries (MoFPI)</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
            <span>Team IMPACT INNOVATOR</span>
            <span>•</span>
            <span>v0.2.0-phase2-dashboard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
