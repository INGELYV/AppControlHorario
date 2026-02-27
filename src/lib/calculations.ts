import {
    differenceInMinutes, differenceInSeconds,
    startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    eachDayOfInterval, isWithinInterval, format,
} from 'date-fns';
import type { TimeEntry, Pause, DailyStats, WeeklyStats } from '@/types';

export function calculatePauseSeconds(pauses: Pause[]): number {
    return pauses
        .filter((p) => p.end_time !== null)
        .reduce((total, p) => total + differenceInSeconds(new Date(p.end_time!), new Date(p.start_time)), 0);
}

export function calculateWorkedHours(entry: TimeEntry): number {
    if (!entry.clock_out) return 0;
    const totalMin = differenceInMinutes(new Date(entry.clock_out), new Date(entry.clock_in));
    const pauseMin = entry.pauses
        ? entry.pauses.filter((p) => p.end_time !== null)
            .reduce((sum, p) => sum + differenceInMinutes(new Date(p.end_time!), new Date(p.start_time)), 0)
        : 0;
    return (totalMin - pauseMin) / 60;
}

export function calculateLiveWorkedSeconds(entry: TimeEntry, now: Date = new Date()): number {
    const endTime = entry.clock_out ? new Date(entry.clock_out) : now;
    const totalSec = differenceInSeconds(endTime, new Date(entry.clock_in));
    const pauseSec = entry.pauses ? calculatePauseSeconds(entry.pauses) : 0;
    const activePause = entry.pauses?.find((p) => p.end_time === null);
    const activePauseSec = activePause ? differenceInSeconds(now, new Date(activePause.start_time)) : 0;
    return Math.max(0, totalSec - pauseSec - activePauseSec);
}

export function calculateLivePauseSeconds(entry: TimeEntry, now: Date = new Date()): number {
    if (!entry.pauses) return 0;
    const completed = calculatePauseSeconds(entry.pauses);
    const activePause = entry.pauses.find((p) => p.end_time === null);
    const active = activePause ? differenceInSeconds(now, new Date(activePause.start_time)) : 0;
    return completed + active;
}

export function getDailyStats(entries: TimeEntry[], date: string): DailyStats {
    const dayEntries = entries.filter((e) => e.date === date);
    const totalWorked = dayEntries.reduce((s, e) => s + (e.total_hours || 0), 0);
    const totalPaused = dayEntries.reduce((s, e) => {
        if (!e.pauses) return s;
        return s + e.pauses.filter((p) => p.duration !== null).reduce((ps, p) => ps + (p.duration || 0), 0) / 60;
    }, 0);
    return { date, totalWorked, totalPaused, entries: dayEntries.length };
}

export function getWeeklyStats(entries: TimeEntry[], ref: Date = new Date()): WeeklyStats {
    const start = startOfWeek(ref, { weekStartsOn: 1 });
    const end = endOfWeek(ref, { weekStartsOn: 1 });
    const weekEntries = entries.filter((e) => isWithinInterval(new Date(e.date), { start, end }));
    const days = eachDayOfInterval({ start, end });
    const dailyBreakdown = days.map((d) => getDailyStats(entries, format(d, 'yyyy-MM-dd')));
    const totalHours = weekEntries.reduce((s, e) => s + (e.total_hours || 0), 0);
    const worked = dailyBreakdown.filter((d) => d.entries > 0);
    return { totalHours, averageDaily: worked.length > 0 ? totalHours / worked.length : 0, daysWorked: worked.length, dailyBreakdown };
}

export function getMonthlyStats(entries: TimeEntry[], ref: Date = new Date()): WeeklyStats {
    const start = startOfMonth(ref);
    const end = endOfMonth(ref);
    const monthEntries = entries.filter((e) => isWithinInterval(new Date(e.date), { start, end }));
    const days = eachDayOfInterval({ start, end });
    const dailyBreakdown = days.map((d) => getDailyStats(entries, format(d, 'yyyy-MM-dd')));
    const totalHours = monthEntries.reduce((s, e) => s + (e.total_hours || 0), 0);
    const worked = dailyBreakdown.filter((d) => d.entries > 0);
    return { totalHours, averageDaily: worked.length > 0 ? totalHours / worked.length : 0, daysWorked: worked.length, dailyBreakdown };
}

export function calculateProductivityScore(stats: WeeklyStats, target: number = 8): number {
    if (stats.daysWorked === 0) return 0;
    return Math.min(100, Math.round((stats.totalHours / (stats.daysWorked * target)) * 100));
}

export function generateCsvContent(entries: TimeEntry[]): string {
    const headers = ['Fecha', 'Hora Entrada', 'Hora Salida', 'Pausas (min)', 'Total Horas', 'Estado', 'Notas'];
    const rows = entries.map((e) => {
        const pauseMin = e.pauses ? e.pauses.filter((p) => p.duration !== null).reduce((s, p) => s + (p.duration || 0), 0) : 0;
        return [
            e.date,
            new Date(e.clock_in).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            e.clock_out ? new Date(e.clock_out).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-',
            pauseMin, e.total_hours !== null ? e.total_hours.toFixed(2) : '-',
            e.status === 'completed' ? 'Completada' : e.status === 'active' ? 'Activa' : 'Pausada',
            e.notes || '',
        ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}

export { format };
