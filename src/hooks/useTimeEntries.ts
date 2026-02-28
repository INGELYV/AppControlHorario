import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { TimeEntry } from '@/types';

interface UseTimeEntriesOptions {
    daysAgo?: number;
    enabled?: boolean;
}

export function useTimeEntries({ daysAgo = 30, enabled = true }: UseTimeEntriesOptions = {}) {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadEntries() {
            if (!user || !enabled) {
                if (!user) {
                    setEntries([]);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError(null);

            const start = new Date();
            start.setDate(start.getDate() - daysAgo);
            const dateFrom = start.toISOString().split('T')[0];

            try {
                const { data, error: supaError } = await supabase
                    .from('time_entries')
                    .select('*, pauses(*)')
                    .eq('user_id', user.id)
                    .gte('date', dateFrom)
                    .order('date', { ascending: false })
                    .order('clock_in', { ascending: false });

                if (supaError) throw new Error(supaError.message);
                setEntries((data || []) as TimeEntry[]);
            } catch (err) {
                console.error('Error loading time entries:', err);
                setError(err instanceof Error ? err.message : 'Error al cargar datos');
            } finally {
                setLoading(false);
            }
        }

        loadEntries();
    }, [user, daysAgo, enabled]);

    // Función para recargar los datos manualmente si es necesario (e.g. después de borrar)
    const refetch = () => {
        setLoading(true);
        // Pequeño hack para forzar el re-render o simplemente confiar en que el state lo hace,
        // pero preferiblemente recargamos directamente:
        if (user) {
            const start = new Date();
            start.setDate(start.getDate() - daysAgo);
            const dateFrom = start.toISOString().split('T')[0];
            supabase
                .from('time_entries')
                .select('*, pauses(*)')
                .eq('user_id', user.id)
                .gte('date', dateFrom)
                .order('date', { ascending: false })
                .order('clock_in', { ascending: false })
                .then(({ data, error }) => {
                    if (!error) setEntries((data || []) as TimeEntry[]);
                    setLoading(false);
                });
        }
    };

    return { entries, loading, error, refetch, setEntries };
}
