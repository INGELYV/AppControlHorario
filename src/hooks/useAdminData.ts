import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, TimeEntry } from '@/types';

export interface AdminStats {
    totalEmployees: number;
    activeNow: number;
    todayHours: number;
    pendingPauses: number;
}

export interface EmployeeSummary extends Profile {
    lastEntry?: TimeEntry;
    isWorking: boolean;
    todayHours: number;
}

export function useAdminData() {
    const [profiles, setProfiles] = useState<EmployeeSummary[]>([]);
    const [stats, setStats] = useState<AdminStats>({ totalEmployees: 0, activeNow: 0, todayHours: 0, pendingPauses: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch all profiles excluding the admin
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profilesData } = await supabase.from('profiles').select('*').neq('id', user?.id);

            // 2. Fetch today's entries for all
            const today = new Date().toISOString().split('T')[0];
            const { data: entriesData } = await supabase.from('time_entries')
                .select('*, pauses(*)')
                .eq('date', today)
                .neq('user_id', user?.id);

            if (profilesData) {
                const summary: EmployeeSummary[] = profilesData.map(p => {
                    const userEntries = entriesData?.filter(e => e.user_id === p.id) || [];
                    const lastEntry = userEntries.length > 0 ? userEntries[userEntries.length - 1] : undefined;

                    return {
                        ...p,
                        lastEntry,
                        isWorking: lastEntry?.status === 'active' || lastEntry?.status === 'paused',
                        todayHours: userEntries.reduce((acc, curr) => acc + (curr.total_hours || 0), 0)
                    };
                });

                setProfiles(summary);
                setStats({
                    totalEmployees: profilesData.length,
                    activeNow: summary.filter(s => s.isWorking).length,
                    todayHours: summary.reduce((acc, curr) => acc + curr.todayHours, 0),
                    pendingPauses: entriesData?.filter(e => e.status === 'paused').length || 0
                });
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { profiles, stats, loading, refresh: fetchData };
}
