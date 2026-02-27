import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimeClockControls } from '@/components/time-tracking/TimeClockControls';
import { CurrentStatus } from '@/components/time-tracking/CurrentStatus';
import { PauseControls } from '@/components/time-tracking/PauseControls';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { getWeeklyStats, calculateProductivityScore } from '@/lib/calculations';
import { supabase } from '@/lib/supabase';
import { isDemoMode, demoGetEntries } from '@/lib/mock-service';
import type { TimeEntry, WeeklyStats } from '@/types';
import { Clock, TrendingUp, Calendar, Target } from 'lucide-react';
import { formatHoursDecimal } from '@/lib/utils';

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({ totalHours: 0, averageDaily: 0, daysWorked: 0, dailyBreakdown: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            if (!user) return;
            const ago = new Date(); ago.setDate(ago.getDate() - 30);
            const dateFrom = ago.toISOString().split('T')[0];

            let entries: TimeEntry[] = [];

            if (isDemoMode()) {
                entries = demoGetEntries(user.id, { dateFrom });
            } else {
                const { data, error } = await supabase.from('time_entries').select('*, pauses(*)').eq('user_id', user.id)
                    .gte('date', dateFrom).order('date', { ascending: false });
                if (error) { console.error('Error loading stats:', error); setLoading(false); return; }
                entries = (data || []) as TimeEntry[];
            }

            setWeeklyStats(getWeeklyStats(entries));
            setLoading(false);
        }
        loadStats();
    }, [user]);

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
