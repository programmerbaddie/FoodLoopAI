import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { NavTabs, TabKey } from './components/NavTabs';
import { OverviewPage } from './pages/OverviewPage';
import { PlaceholderStagePage } from './pages/PlaceholderStagePage';
import { checkBackendHealth, HealthStatus } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
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
    // Periodic check every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="min-h-screen flex flex-col bg-foodloop-canvas text-foodloop-navy">
      {/* Top Application Header */}
      <Header health={health} loading={loading} error={error} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Module Navigation Tabs */}
        <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content Router */}
        {activeTab === 'overview' ? (
          <OverviewPage
            health={health}
            loading={loading}
            error={error}
            onRefreshHealth={fetchHealth}
          />
        ) : (
          <PlaceholderStagePage stageKey={activeTab} />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-foodloop-border bg-foodloop-surface py-6 text-xs text-foodloop-textMuted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-foodloop-navy">FoodLoop AI</span>
            <span>•</span>
            <span>Smart India Hackathon 2026 (SIH26234)</span>
            <span>•</span>
            <span>Ministry of Food Processing Industries (MoFPI)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>Developed by Team IMPACT INNOVATOR</span>
            <span>•</span>
            <span className="font-mono">v0.1.0-foundation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
