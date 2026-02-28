import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimeClockControls } from '@/components/time-tracking/TimeClockControls';
import { CurrentStatus } from '@/components/time-tracking/CurrentStatus';
import { PauseControls } from '@/components/time-tracking/PauseControls';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { getWeeklyStats, calculateProductivityScore } from '@/lib/calculations';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import type { WeeklyStats } from '@/types';
import { Clock, TrendingUp, Calendar, Target } from 'lucide-react';
import { formatHoursDecimal } from '@/lib/utils';

export default function DashboardPage() {
    const { profile } = useAuth();
    const { entries, loading } = useTimeEntries({ daysAgo: 30 });
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({ totalHours: 0, averageDaily: 0, daysWorked: 0, dailyBreakdown: [] });

    useEffect(() => {
        if (!loading) {
            setWeeklyStats(getWeeklyStats(entries));
        }
    }, [entries, loading]);

    const ps = calculateProductivityScore(weeklyStats);
    const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-greeting">{greeting}, <span className="text-accent">{profile?.full_name?.split(' ')[0] || 'Usuario'}</span></h1>
                <p className="dashboard-date">{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <section className="dashboard-section">
                <div className="tracking-card"><CurrentStatus /><TimeClockControls /><PauseControls /></div>
            </section>
            <section className="dashboard-section">
                <div className="stats-grid">
                    <StatsCard title="Horas Semana" value={`${formatHoursDecimal(weeklyStats.totalHours)}h`} subtitle="Esta semana" icon={<Clock size={20} />} accentColor="accent" />
                    <StatsCard title="Promedio Diario" value={`${formatHoursDecimal(weeklyStats.averageDaily)}h`} subtitle="por día" icon={<TrendingUp size={20} />} accentColor="success" />
                    <StatsCard title="Días Trabajados" value={`${weeklyStats.daysWorked}`} subtitle="esta semana" icon={<Calendar size={20} />} accentColor="warning" />
                    <StatsCard title="Productividad" value={`${ps}%`} subtitle="del objetivo" icon={<Target size={20} />} accentColor={ps >= 80 ? 'success' : ps >= 50 ? 'warning' : 'error'} />
                </div>
            </section>
            <section className="dashboard-section">{!loading && <WeeklyChart stats={weeklyStats} />}</section>
        </div>
    );
}
