import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { calculateWorkedHours } from '@/lib/calculations';
import type { TimeEntry, Pause, WorkStatus, PauseType } from '@/types';

interface TimeTrackingContextType {
    workStatus: WorkStatus;
    currentEntry: TimeEntry | null;
    currentPause: Pause | null;
    loading: boolean;
    clockIn: () => Promise<void>;
    clockOut: () => Promise<void>;
    startPause: (type: PauseType) => Promise<void>;
    endPause: () => Promise<void>;
    refreshCurrentEntry: () => Promise<void>;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [workStatus, setWorkStatus] = useState<WorkStatus>('idle');
    const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
    const [currentPause, setCurrentPause] = useState<Pause | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshCurrentEntry = useCallback(async () => {
        if (!user) {
            setCurrentEntry(null);
            setCurrentPause(null);
            setWorkStatus('idle');
            setLoading(false);
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('time_entries').select('*, pauses(*)')
            .eq('user_id', user.id)
            .in('status', ['active', 'paused'])
            .order('clock_in', { ascending: false })
            .limit(1).maybeSingle();

        if (error) {
            console.error('Error loading entry:', error);
            setLoading(false);
            return;
        }

        if (data) {
            setCurrentEntry(data as TimeEntry);
            const ap = (data.pauses as Pause[])?.find((p) => p.end_time === null);
            setCurrentPause(ap || null);
            setWorkStatus(data.status === 'paused' ? 'paused' : 'working');
        } else {
            setCurrentEntry(null);
            setCurrentPause(null);
            setWorkStatus('idle');
        }
        setLoading(false);
    }, [user]);

    useEffect(() => { refreshCurrentEntry(); }, [refreshCurrentEntry]);

    async function clockIn() {
        if (!user) throw new Error('No hay sesión activa');
        if (workStatus !== 'idle') throw new Error('Ya hay una jornada activa');

        const now = new Date();
        const { data, error } = await supabase
            .from('time_entries')
            .insert({ user_id: user.id, date: now.toISOString().split('T')[0], clock_in: now.toISOString(), status: 'active' as const })
            .select('*, pauses(*)').single();
        if (error) throw new Error('Error al iniciar jornada');
        setCurrentEntry(data as TimeEntry);
        setWorkStatus('working');
    }

    async function clockOut() {
        if (!user || !currentEntry) throw new Error('No hay jornada activa');

        if (currentPause) await endPause();

        const now = new Date();
        const updated = { ...currentEntry, clock_out: now.toISOString() };
        const totalHours = calculateWorkedHours(updated);
        const { error } = await supabase.from('time_entries')
            .update({ clock_out: now.toISOString(), total_hours: Math.round(totalHours * 100) / 100, status: 'completed' as const })
            .eq('id', currentEntry.id);
        if (error) throw new Error('Error al finalizar jornada');
        setCurrentEntry(null);
        setCurrentPause(null);
        setWorkStatus('idle');
        await refreshCurrentEntry();
    }

    async function startPause(type: PauseType) {
        if (!user || !currentEntry) throw new Error('No hay jornada activa');
        if (currentPause) throw new Error('Ya hay una pausa activa');

        const now = new Date();
        const { data, error } = await supabase.from('pauses')
            .insert({ time_entry_id: currentEntry.id, start_time: now.toISOString(), type }).select().single();
        if (error) throw new Error('Error al iniciar pausa');
        await supabase.from('time_entries').update({ status: 'paused' as const }).eq('id', currentEntry.id);
        setCurrentPause(data as Pause);
        setWorkStatus('paused');
        await refreshCurrentEntry();
    }

    async function endPause() {
        if (!currentPause || !currentEntry) throw new Error('No hay pausa activa');

        const now = new Date();
        const dur = Math.round((now.getTime() - new Date(currentPause.start_time).getTime()) / 60000);
        const { error: pe } = await supabase.from('pauses').update({ end_time: now.toISOString(), duration: dur }).eq('id', currentPause.id);
        if (pe) throw new Error('Error al finalizar pausa');
        const { error: ee } = await supabase.from('time_entries').update({ status: 'active' as const }).eq('id', currentEntry.id);
        if (ee) throw new Error('Error al reanudar jornada');
        setCurrentPause(null);
        setWorkStatus('working');
        await refreshCurrentEntry();
    }

    return (
        <TimeTrackingContext.Provider value={{ workStatus, currentEntry, currentPause, loading, clockIn, clockOut, startPause, endPause, refreshCurrentEntry }}>
            {children}
        </TimeTrackingContext.Provider>
    );
}

export function useTimeTracking() {
    const ctx = useContext(TimeTrackingContext);
    if (!ctx) throw new Error('useTimeTracking must be used within TimeTrackingProvider');
    return ctx;
}
