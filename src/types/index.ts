// ─── User & Profile ──────────────────────────────────────────
export interface Profile {
    id: string;
    full_name: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

// ─── Time Tracking ───────────────────────────────────────────
export type TimeEntryStatus = 'active' | 'paused' | 'completed';
export type PauseType = 'meal' | 'break' | 'other';

export interface TimeEntry {
    id: string;
    user_id: string;
    date: string;
    clock_in: string;
    clock_out: string | null;
    total_hours: number | null;
    status: TimeEntryStatus;
    edited_manually: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    pauses?: Pause[];
}

export interface Pause {
    id: string;
    time_entry_id: string;
    start_time: string;
    end_time: string | null;
    type: PauseType;
    duration: number | null;
    created_at: string;
    updated_at: string;
}

// ─── Statistics ──────────────────────────────────────────────
export interface DailyStats {
    date: string;
    totalWorked: number;
    totalPaused: number;
    entries: number;
}

export interface WeeklyStats {
    totalHours: number;
    averageDaily: number;
    daysWorked: number;
    dailyBreakdown: DailyStats[];
}

// ─── App State ───────────────────────────────────────────────
export type WorkStatus = 'idle' | 'working' | 'paused';

// ─── Supabase Database Types ─────────────────────────────────
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
            };
            time_entries: {
                Row: TimeEntry;
                Insert: Pick<TimeEntry, 'user_id' | 'date' | 'clock_in'> & Partial<TimeEntry>;
                Update: Partial<Omit<TimeEntry, 'id' | 'user_id' | 'created_at'>>;
            };
            pauses: {
                Row: Pause;
                Insert: Pick<Pause, 'time_entry_id' | 'start_time' | 'type'> & Partial<Pause>;
                Update: Partial<Omit<Pause, 'id' | 'time_entry_id' | 'created_at'>>;
            };
        };
    };
}
