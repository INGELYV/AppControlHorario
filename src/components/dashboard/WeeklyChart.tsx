import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { WeeklyStats } from '@/types';
import { getDayName } from '@/lib/utils';

export function WeeklyChart({ stats }: { stats: WeeklyStats }) {
    const chartData = stats.dailyBreakdown.map((day) => ({ name: getDayName(day.date), hours: Number(day.totalWorked.toFixed(1)), date: day.date }));
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="chart-card">
            <div className="chart-header"><h3 className="chart-title">Resumen Semanal</h3><span className="chart-badge">Semanal</span></div>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} tickFormatter={(v) => `${v}h`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,214,10,0.2)', borderRadius: '12px', color: '#fff', fontSize: '13px' }} formatter={(v: number) => [`${v}h`, 'Horas']} cursor={{ fill: 'rgba(255,214,10,0.05)' }} />
                        <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
                            {chartData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.date === today ? '#FFD60A' : 'rgba(255,214,10,0.4)'} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-footer">
                <div className="chart-stat"><span className="chart-stat-value">{stats.totalHours.toFixed(1)}h</span><span className="chart-stat-label">Total</span></div>
                <div className="chart-stat"><span className="chart-stat-value">{stats.averageDaily.toFixed(1)}h</span><span className="chart-stat-label">Promedio</span></div>
                <div className="chart-stat"><span className="chart-stat-value">{stats.daysWorked}</span><span className="chart-stat-label">Días</span></div>
            </div>
        </div>
    );
}
