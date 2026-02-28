import { useAdminData } from '@/hooks/useAdminData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminReports() {
    const { profiles, stats, loading } = useAdminData();

    if (loading) return <div className="protected-route-loader"><div className="loader-spinner"></div></div>;

    const chartData = profiles.map(p => ({
        name: p.full_name?.split(' ')[0] || 'U',
        hours: Number(p.todayHours.toFixed(1)),
        isWorking: p.isWorking
    }));

    const statusData = [
        { name: 'Trabajando', value: profiles.filter(p => p.lastEntry?.status === 'active').length, color: '#10B981' },
        { name: 'Pausado', value: profiles.filter(p => p.lastEntry?.status === 'paused').length, color: '#F59E0B' },
        { name: 'Fuera', value: profiles.filter(p => !p.isWorking).length, color: '#EF4444' },
    ];

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-greeting">Reportes <span className="text-accent">Globales</span></h1>
                    <p className="dashboard-date">Distribución hoy, {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stats-card">
                    <div className="stats-card-header"><BarChart3 size={20} className="stats-card-icon" /><h3 className="stats-card-title">Promedio Diario</h3></div>
                    <div className="stats-card-body">
                        <span className="stats-card-value">{(stats.todayHours / (stats.totalEmployees || 1)).toFixed(1)}h</span>
                        <span className="stats-card-subtitle">Por empleado (Hoy)</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                {/* Chart: Hours by User */}
                <div className="chart-card">
                    <div className="chart-header"><h3 className="chart-title">Horas por Empleado (Hoy)</h3></div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,214,10,0.2)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                    {chartData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.isWorking ? '#FFD60A' : 'rgba(255,214,10,0.4)'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart: Status Distribution */}
                <div className="chart-card">
                    <div className="chart-header"><h3 className="chart-title">Estado del Equipo</h3></div>
                    <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-footer" style={{ justifyContent: 'center', gap: 'var(--space-md)' }}>
                        {statusData.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '2px', background: d.color }}></div>
                                <span className="text-muted">{d.name}: {d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
