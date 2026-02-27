/**
 * Mock Supabase Service — Modo Demo
 *
 * Simula la API de Supabase usando localStorage para que la app
 * funcione 100% sin backend. Cuando se configuren credenciales
 * reales de Supabase, este módulo se saltea automáticamente.
 */

import type { TimeEntry, Pause, Profile, PauseType } from '@/types';

const STORAGE_KEYS = {
    user: 'demo_user',
    profile: 'demo_profile',
    entries: 'demo_time_entries',
    pauses: 'demo_pauses',
} as const;

// ─── Helpers ─────────────────────────────────────────────────
function generateId(): string {
    return crypto.randomUUID();
}

function getFromStorage<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
}

// ─── Demo User ───────────────────────────────────────────────
export interface DemoUser {
    id: string;
    email: string;
    password: string;
}

export function isDemoMode(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return !url || url === 'https://tu-proyecto.supabase.co' || url.includes('placeholder');
}

// ─── Auth Mock ───────────────────────────────────────────────
export function demoSignUp(email: string, password: string, fullName: string): { user: DemoUser; profile: Profile } {
    // Verificar si ya existe
    const existingUsers = getFromStorage<DemoUser[]>('demo_users', []);
    if (existingUsers.some((u) => u.email === email)) {
        throw new Error('Este email ya está registrado');
    }

    const userId = generateId();
    const user: DemoUser = { id: userId, email, password };
    const profile: Profile = {
        id: userId,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    // Guardar
    existingUsers.push(user);
    saveToStorage('demo_users', existingUsers);
    saveToStorage(STORAGE_KEYS.user, user);
    saveToStorage(STORAGE_KEYS.profile, profile);

    return { user, profile };
}

export function demoSignIn(email: string, password: string): { user: DemoUser; profile: Profile } {
    const users = getFromStorage<DemoUser[]>('demo_users', []);
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error('Email o contraseña incorrectos');

    // Buscar o crear profile
    const profiles = getFromStorage<Profile[]>('demo_profiles', []);
    let profile = profiles.find((p) => p.id === found.id);
    if (!profile) {
        profile = {
            id: found.id,
            full_name: found.email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }

    saveToStorage(STORAGE_KEYS.user, found);
    saveToStorage(STORAGE_KEYS.profile, profile);

    return { user: found, profile };
}

export function demoSignOut(): void {
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.profile);
}

export function demoGetSession(): { user: DemoUser | null; profile: Profile | null } {
    const user = getFromStorage<DemoUser | null>(STORAGE_KEYS.user, null);
    const profile = getFromStorage<Profile | null>(STORAGE_KEYS.profile, null);
    return { user, profile };
}

export function demoUpdateProfile(userId: string, updates: Partial<Profile>): Profile {
    const profile = getFromStorage<Profile | null>(STORAGE_KEYS.profile, null);
    if (!profile || profile.id !== userId) throw new Error('Perfil no encontrado');

    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.profile, updated);

    // Actualizar en lista
    const profiles = getFromStorage<Profile[]>('demo_profiles', []);
    const idx = profiles.findIndex((p) => p.id === userId);
    if (idx >= 0) profiles[idx] = updated; else profiles.push(updated);
    saveToStorage('demo_profiles', profiles);

    return updated;
}

export function demoUpdatePassword(_newPassword: string): void {
    const user = getFromStorage<DemoUser | null>(STORAGE_KEYS.user, null);
    if (!user) throw new Error('No hay sesión activa');

    const users = getFromStorage<DemoUser[]>('demo_users', []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
        users[idx].password = _newPassword;
        saveToStorage('demo_users', users);
        saveToStorage(STORAGE_KEYS.user, users[idx]);
    }
}

// ─── Time Entries Mock ───────────────────────────────────────
export function demoGetEntries(userId: string, filter?: { dateFrom?: string }): TimeEntry[] {
    const entries = getFromStorage<TimeEntry[]>(STORAGE_KEYS.entries, []);
    const pauses = getFromStorage<Pause[]>(STORAGE_KEYS.pauses, []);

    return entries
        .filter((e) => e.user_id === userId)
        .filter((e) => !filter?.dateFrom || e.date >= filter.dateFrom)
        .map((e) => ({
            ...e,
            pauses: pauses.filter((p) => p.time_entry_id === e.id),
        }))
        .sort((a, b) => b.date.localeCompare(a.date) || b.clock_in.localeCompare(a.clock_in));
}

export function demoGetActiveEntry(userId: string): TimeEntry | null {
    const entries = getFromStorage<TimeEntry[]>(STORAGE_KEYS.entries, []);
    const pauses = getFromStorage<Pause[]>(STORAGE_KEYS.pauses, []);

    const active = entries.find((e) => e.user_id === userId && (e.status === 'active' || e.status === 'paused'));
    if (!active) return null;

    return { ...active, pauses: pauses.filter((p) => p.time_entry_id === active.id) };
}

export function demoClockIn(userId: string): TimeEntry {
    const entries = getFromStorage<TimeEntry[]>(STORAGE_KEYS.entries, []);

    // Verificar que no haya entrada activa
    if (entries.some((e) => e.user_id === userId && (e.status === 'active' || e.status === 'paused'))) {
        throw new Error('Ya hay una jornada activa');
    }

    const now = new Date();
    const entry: TimeEntry = {
        id: generateId(),
        user_id: userId,
        date: now.toISOString().split('T')[0],
        clock_in: now.toISOString(),
        clock_out: null,
        total_hours: null,
        status: 'active',
        edited_manually: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        pauses: [],
    };

    entries.push(entry);
    saveToStorage(STORAGE_KEYS.entries, entries);
    return entry;
}

export function demoClockOut(entryId: string): TimeEntry {
    const entries = getFromStorage<TimeEntry[]>(STORAGE_KEYS.entries, []);
    const pauses = getFromStorage<Pause[]>(STORAGE_KEYS.pauses, []);
    const idx = entries.findIndex((e) => e.id === entryId);
    if (idx < 0) throw new Error('Entrada no encontrada');

    // Cerrar pausa activa si existe
    const activePause = pauses.find((p) => p.time_entry_id === entryId && p.end_time === null);
    if (activePause) {
        const now = new Date();
        activePause.end_time = now.toISOString();
        activePause.duration = Math.round((now.getTime() - new Date(activePause.start_time).getTime()) / 60000);
        activePause.updated_at = now.toISOString();
        saveToStorage(STORAGE_KEYS.pauses, pauses);
    }

    const now = new Date();
    const totalMinutes = (now.getTime() - new Date(entries[idx].clock_in).getTime()) / 60000;
    const entryPauses = pauses.filter((p) => p.time_entry_id === entryId && p.duration !== null);
    const pauseMinutes = entryPauses.reduce((s, p) => s + (p.duration || 0), 0);
    const workedHours = (totalMinutes - pauseMinutes) / 60;

    entries[idx] = {
        ...entries[idx],
        clock_out: now.toISOString(),
        total_hours: Math.round(workedHours * 100) / 100,
        status: 'completed',
        updated_at: now.toISOString(),
    };

    saveToStorage(STORAGE_KEYS.entries, entries);
    return { ...entries[idx], pauses: pauses.filter((p) => p.time_entry_id === entryId) };
}

export function demoStartPause(entryId: string, type: PauseType): Pause {
    const pauses = getFromStorage<Pause[]>(STORAGE_KEYS.pauses, []);
    const entries = getFromStorage<TimeEntry[]>(STORAGE_KEYS.entries, []);

    // Verificar que no haya pausa activa
    if (pauses.some((p) => p.time_entry_id === entryId && p.end_time === null)) {
        throw new Error('Ya hay una pausa activa');
    }

    const now = new Date();
    const pause: Pause = {
        id: generateId(),
        time_entry_id: entryId,
        start_time: now.toISOString(),
        end_time: null,
        type,
        duration: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
    };

    pauses.push(pause);
    saveToStorage(STORAGE_KEYS.pauses, pauses);

    // Actualizar status de la entrada
    const entryIdx = entries.findIndex((e) => e.id === entryId);
    if (entryIdx >= 0) {
        entries[entryIdx].status = 'paused';
        entries[entryIdx].updated_at = now.toISOString();
        saveToStorage(STORAGE_KEYS.entries, entries);
    }

    return pause;
}

export function demoEndPause(pauseId: string): Pause {
    const pauses = getFromStorage<Pause[]>(STORAGE_KEYS.pauses, []);
    const entries = getFromStorage<TimeEntry[]>(STORAGE_KEYS.entries, []);
    const idx = pauses.findIndex((p) => p.id === pauseId);
    if (idx < 0) throw new Error('Pausa no encontrada');

    const now = new Date();
    const duration = Math.round((now.getTime() - new Date(pauses[idx].start_time).getTime()) / 60000);

    pauses[idx] = {
        ...pauses[idx],
        end_time: now.toISOString(),
        duration,
        updated_at: now.toISOString(),
    };

    saveToStorage(STORAGE_KEYS.pauses, pauses);

    // Actualizar status de la entrada
    const entryIdx = entries.findIndex((e) => e.id === pauses[idx].time_entry_id);
    if (entryIdx >= 0) {
        entries[entryIdx].status = 'active';
        entries[entryIdx].updated_at = now.toISOString();
        saveToStorage(STORAGE_KEYS.entries, entries);
    }

    return pauses[idx];
}

export function demoDeleteEntry(entryId: string): void {
    const entries = getFromStorage<TimeEntry[]>(STORAGE_KEYS.entries, []);
    const pauses = getFromStorage<Pause[]>(STORAGE_KEYS.pauses, []);

    saveToStorage(STORAGE_KEYS.entries, entries.filter((e) => e.id !== entryId));
    saveToStorage(STORAGE_KEYS.pauses, pauses.filter((p) => p.time_entry_id !== entryId));
}
