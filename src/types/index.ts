export type UserRole = 'employee' | 'admin';

export interface Profile {
    id: string;
    full_name: string;
    role: UserRole;
    marital_status?: string;
    phone?: string;
    birth_date?: string;
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

