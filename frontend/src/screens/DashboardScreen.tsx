import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardResponse } from '../api/types';
import './DashboardScreen.css';

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setStats(await api.getDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="screen-loading">Loading…</div>;
  if (error) return (
    <div className="screen-error">
      <p>{error}</p>
      <button onClick={() => void load()}>Retry</button>
    </div>
  );
  if (!stats) return null;

  const weekPct = Math.round((stats.this_week_count / stats.this_week_target) * 100);
  const ratePct = Math.round(stats.completion_rate * 100);

  return (
    <div className="dashboard-screen">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.current_streak}</span>
          <span className="stat-label">Current streak</span>
          <span className="stat-unit">weeks</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{stats.best_streak}</span>
          <span className="stat-label">Best streak</span>
          <span className="stat-unit">weeks</span>
        </div>

        <div className="stat-card stat-card--wide">
          <span className="stat-value">
            {stats.this_week_count}
            <span className="stat-denom">/{stats.this_week_target}</span>
          </span>
          <span className="stat-label">This week</span>
          <div className="progress-track" role="progressbar" aria-valuenow={weekPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${weekPct}%` }} />
          </div>
        </div>

        <div className="stat-card stat-card--wide">
          <span className="stat-value">{ratePct}%</span>
          <span className="stat-label">Completion rate</span>
          <span className="stat-unit">last 4 complete weeks</span>
        </div>
      </div>
    </div>
  );
}
