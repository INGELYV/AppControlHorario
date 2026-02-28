import { useAdminData } from '@/hooks/useAdminData';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Users, Clock, Coffee, Briefcase, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboard() {
    const { profiles, stats, loading, refresh } = useAdminData();

    if (loading) return <div className="protected-route-loader"><div className="loader-spinner"></div></div>;

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="dashboard-greeting">Panel de <span className="text-accent">Administración</span></h1>
                        <p className="dashboard-date">{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
                    </div>
                    <button onClick={refresh} className="btn btn-accent btn-sm" title="Actualizar datos">
                        <RefreshCw size={16} /> <span>Actualizar</span>
                    </button>
                </div>
            </header>

            <div className="stats-grid">
                <StatsCard title="Total Empleados" value={stats.totalEmployees.toString()} icon={<Users size={20} />} accentColor="accent" subtitle="Registrados en el sistema" />
                <StatsCard title="Activos Ahora" value={stats.activeNow.toString()} icon={<Briefcase size={20} />} accentColor="success" subtitle="En turno o en pausa" />
                <StatsCard title="Horas Totales (Hoy)" value={`${stats.todayHours.toFixed(1)}h`} icon={<Clock size={20} />} accentColor="warning" subtitle="Suma de toda la jornada" />
                <StatsCard title="En Pausa" value={stats.pendingPauses.toString()} icon={<Coffee size={20} />} accentColor="error" subtitle="Descansos actuales" />
            </div>

            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title"><Users size={20} /> Estado de Empleados</h2>
                </div>

                <div className="history-list">
                    {profiles.map((employee) => (
                        <div key={employee.id} className="entry-card" style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <div className="user-avatar">{employee.full_name?.charAt(0)?.toUpperCase()}</div>
                                <div>
                                    <div className="user-name">{employee.full_name}</div>
                                    <div className="user-role" style={{ fontSize: 'var(--font-size-xs)' }}>
                                        {employee.isWorking ? (
                                            <span className="text-accent">● Actualmente en {employee.lastEntry?.status === 'paused' ? 'Pausa' : 'Turno'}</span>
                                        ) : (
                                            <span className="text-muted">Desconectado</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div className="entry-hours">{employee.todayHours.toFixed(1)}h</div>
                                <div className="entry-date" style={{ fontSize: 'var(--font-size-xs)' }}>Hoy</div>
                            </div>
                        </div>
                    ))}
                    {profiles.length === 0 && <div className="empty-state">No se encontraron empleados registrados.</div>}
                </div>
            </section>
        </div>
    );
}
