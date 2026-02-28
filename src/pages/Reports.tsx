import { useEffect, useState } from 'react';
import { getWeeklyStats, getMonthlyStats, generateCsvContent, calculateProductivityScore } from '@/lib/calculations';
import { downloadCsv, formatHoursDecimal } from '@/lib/utils';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import type { WeeklyStats } from '@/types';
import { BarChart3, Download, Clock, TrendingUp, Calendar, Target } from 'lucide-react';

export default function ReportsPage() {
    const { entries, loading } = useTimeEntries({ daysAgo: 60 });
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<WeeklyStats | null>(null);
    const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

    useEffect(() => {
        if (!loading) {
            setWeeklyStats(getWeeklyStats(entries));
            setMonthlyStats(getMonthlyStats(entries));
        }
    }, [entries, loading]);

    function handleExport() {
        if (!entries.length) { alert('No hay datos'); return; }
        downloadCsv(generateCsvContent(entries), `control-horario-${new Date().toISOString().split('T')[0]}.csv`);
    }

    const cs = viewMode === 'weekly' ? weeklyStats : monthlyStats;
    const p = cs ? calculateProductivityScore(cs) : 0;

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1 className="page-title"><BarChart3 size={24} />Reportes</h1>
                <button onClick={handleExport} className="btn btn-accent" disabled={!entries.length}><Download size={18} />Exportar CSV</button>
            </div>
            <div className="filter-tabs">
                <button onClick={() => setViewMode('weekly')} className={`filter-tab ${viewMode === 'weekly' ? 'filter-tab--active' : ''}`}>Semanal</button>
                <button onClick={() => setViewMode('monthly')} className={`filter-tab ${viewMode === 'monthly' ? 'filter-tab--active' : ''}`}>Mensual</button>
            </div>
            {loading ? <div className="loading-state"><div className="spinner" /><p>Cargando reportes...</p></div>
                : cs && <>
                    <div className="stats-grid">
                        <StatsCard title="Total Horas" value={`${formatHoursDecimal(cs.totalHours)}h`} subtitle={viewMode === 'weekly' ? 'Esta semana' : 'Este mes'} icon={<Clock size={20} />} accentColor="accent" />
                        <StatsCard title="Promedio Diario" value={`${formatHoursDecimal(cs.averageDaily)}h`} subtitle="por día" icon={<TrendingUp size={20} />} accentColor="success" />
                        <StatsCard title="Días Trabajados" value={`${cs.daysWorked}`} subtitle={viewMode === 'weekly' ? 'de 7' : 'del mes'} icon={<Calendar size={20} />} accentColor="warning" />
                        <StatsCard title="Productividad" value={`${p}%`} subtitle="del objetivo" icon={<Target size={20} />} accentColor={p >= 80 ? 'success' : p >= 50 ? 'warning' : 'error'} />
                    </div>
                    <WeeklyChart stats={cs} />
                </>}
        </div>
    );
}
