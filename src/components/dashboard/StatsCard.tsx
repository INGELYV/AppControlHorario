import type { ReactNode } from 'react';

interface StatsCardProps { title: string; value: string; subtitle?: string; icon: ReactNode; accentColor?: 'accent' | 'success' | 'warning' | 'error'; }

export function StatsCard({ title, value, subtitle, icon, accentColor = 'accent' }: StatsCardProps) {
    return (
        <div className={`stats-card stats-card--${accentColor}`}>
            <div className="stats-card-header"><div className="stats-card-icon">{icon}</div><span className="stats-card-title">{title}</span></div>
            <div className="stats-card-body"><span className="stats-card-value">{value}</span>{subtitle && <span className="stats-card-subtitle">{subtitle}</span>}</div>
        </div>
    );
}
