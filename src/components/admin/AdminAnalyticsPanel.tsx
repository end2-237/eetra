'use client'

interface StatCard {
  label: string
  value: string | number
  subtext?: string
  color?: string
}

interface AdminAnalyticsPanelProps {
  stats: StatCard[]
}

export function AdminAnalyticsPanel({ stats }: AdminAnalyticsPanelProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <style>{`
        .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
        .stat-card { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:14px 16px; }
        .stat-val { font-size:24px; font-weight:700; letter-spacing:-.03em; color:var(--text); margin:8px 0 2px; }
        .stat-label { font-size:11px; color:var(--text4); }
        .stat-sub { font-size:10px; color:var(--text4); margin-top:2px; }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns:1fr; }
        }
      `}
