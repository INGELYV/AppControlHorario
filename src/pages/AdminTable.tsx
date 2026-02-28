import { useState, useEffect } from 'react';
import { useAdminTable } from '@/hooks/useAdminTable';
import { Download, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminTablePage() {
    const { entries, profiles, loading, fetchEntries } = useAdminTable();
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01')); // First of current month
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedUser, setSelectedUser] = useState('all');

    useEffect(() => {
        fetchEntries({ startDate, endDate, userId: selectedUser });
    }, [startDate, endDate, selectedUser, fetchEntries]);

    function exportToCSV() {
        if (entries.length === 0) return;

        const headers = ['Fecha', 'Empleado', 'Entrada', 'Salida', 'Horas Totales', 'Estado Civil', 'Teléfono', 'Notas'];
        const rows = entries.map(e => [
            e.date,
            e.profiles?.full_name || 'N/A',
            e.clock_in ? format(new Date(e.clock_in), 'HH:mm:ss') : '-',
            e.clock_out ? format(new Date(e.clock_out), 'HH:mm:ss') : '-',
            e.total_hours?.toString() || '0',
            e.profiles?.marital_status || '-',
            e.profiles?.phone || '-',
            (e.notes || '').replace(/,/g, ';') // Avoid CSV break
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_asistencia_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-greeting">Tabla <span className="text-accent">Maestra</span></h1>
                    <p className="dashboard-date">Gestión total de registros e información</p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={loading || entries.length === 0}
                    className="btn btn-primary"
                >
                    <Download size={18} /> <span>Exportar CSV</span>
                </button>
            </header>

            <section className="dashboard-section filters-section" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} /> Desde
                        </label>
                        <input
                            type="date"
                            className="form-input form-input--dark"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} /> Hasta
                        </label>
                        <input
                            type="date"
                            className="form-input form-input--dark"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserIcon size={14} /> Empleado
                        </label>
                        <select
                            className="form-input form-input--dark"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="all">Todos los empleados</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="history-list" style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Empleado</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Horas</th>
                                <th>Estado Civil</th>
                                <th>Teléfono</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}><div className="loader-spinner" style={{ margin: '0 auto' }}></div></td></tr>
                            ) : entries.length === 0 ? (
                                <tr><td colSpan={8} className="empty-state">No se encontraron registros para este filtro.</td></tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>{format(new Date(entry.date + 'T12:00:00'), 'dd/MM/yyyy')}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="user-avatar user-avatar--sm">{entry.profiles?.full_name?.charAt(0)}</div>
                                                {entry.profiles?.full_name}
                                            </div>
                                        </td>
                                        <td>{entry.clock_in ? format(new Date(entry.clock_in), 'HH:mm:ss') : '-'}</td>
                                        <td>{entry.clock_out ? format(new Date(entry.clock_out), 'HH:mm:ss') : '-'}</td>
                                        <td className="text-accent font-bold">{entry.total_hours?.toFixed(2) || '0.00'}h</td>
                                        <td>{entry.profiles?.marital_status || '-'}</td>
                                        <td>{entry.profiles?.phone || '-'}</td>
                                        <td>
                                            <span className={`status-badge status-badge--${entry.status}`}>
                                                {entry.status === 'completed' ? 'Completado' : entry.status === 'active' ? 'En turno' : 'Pausa'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
