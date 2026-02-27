import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { isDemoMode, demoGetEntries } from '@/lib/mock-service';
import { getWeeklyStats, getMonthlyStats, generateCsvContent, calculateProductivityScore } from '@/lib/calculations';
import { downloadCsv, formatHoursDecimal } from '@/lib/utils';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import type { TimeEntry, WeeklyStats } from '@/types';
import { BarChart3, Download, Clock, TrendingUp, Calendar, Target } from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<WeeklyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

    useEffect(() => {
        async function load() {
            if (!user) return;
            const ago = new Date(); ago.setDate(ago.getDate() - 60);
            const dateFrom = ago.toISOString().split('T')[0];

            let all: TimeEntry[] = [];

            if (isDemoMode()) {
                all = demoGetEntries(user.id, { dateFrom });
            } else {
                const { data, error } = await supabase.from('time_entries').select('*, pauses(*)').eq('user_id', user.id)
                    .gte('date', dateFrom).order('date', { ascending: false });
                if (error) { console.error(error); setLoading(false); return; }
                all = (data || []) as TimeEntry[];
            }

            setEntries(all);
            setWeeklyStats(getWeeklyStats(all));
            setMonthlyStats(getMonthlyStats(all));
            setLoading(false);
        }
        load();
    }, [user]);

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
