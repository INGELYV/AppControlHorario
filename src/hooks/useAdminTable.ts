import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, TimeEntry } from '@/types';

export interface ExtendedTimeEntry extends TimeEntry {
    profiles: {
        full_name: string;
        email?: string;
        phone?: string;
        marital_status?: string;
    };
}

export function useAdminTable() {
    const [entries, setEntries] = useState<ExtendedTimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const fetchProfiles = useCallback(async () => {
        const { data } = await supabase.from('profiles').select('*').order('full_name');
        if (data) setProfiles(data);
    }, []);

    const fetchEntries = useCallback(async (filters: {
        startDate?: string;
        endDate?: string;
        userId?: string;
    }) => {
        setLoading(true);
        try {
            let query = supabase
                .from('time_entries')
                .select('*, profiles(full_name, phone, marital_status)')
                .order('date', { ascending: false })
                .order('clock_in', { ascending: false });

            if (filters.startDate) query = query.gte('date', filters.startDate);
            if (filters.endDate) query = query.lte('date', filters.endDate);
            if (filters.userId && filters.userId !== 'all') query = query.eq('user_id', filters.userId);

            const { data, error } = await query;
            if (error) throw error;
            setEntries((data as any) || []);
        } catch (err) {
            console.error('Error fetching admin entries:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    return { entries, profiles, loading, fetchEntries };
}
