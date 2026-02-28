import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // ─── Supabase Profile Loader ────────────────────────────
    async function loadProfile(userId: string) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!error && data) setProfile(data);
    }

    useEffect(() => {
        // Real Supabase
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) loadProfile(s.user.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) loadProfile(s.user.id);
            else setProfile(null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function signUp(email: string, password: string, fullName: string) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw new Error(mapAuthError(error.message));
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(mapAuthError(error.message));
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error('Error al cerrar sesión');
        setUser(null);
        setProfile(null);
        setSession(null);
    }

    async function resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error('Error al enviar email de recuperación');
    }

    async function updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error('Error al actualizar contraseña');
    }

    async function updateProfile(updates: Partial<Profile>) {
        if (!user) throw new Error('No hay sesión activa');
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) throw new Error('Error al actualizar perfil');
        await loadProfile(user.id);
    }

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, resetPassword, updatePassword, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

function mapAuthError(msg: string): string {
    const map: Record<string, string> = {
        'Invalid login credentials': 'Email o contraseña incorrectos',
        'Email not confirmed': 'Por favor verifica tu email antes de iniciar sesión',
        'User already registered': 'Este email ya está registrado',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
        'Signups not allowed for this instance': 'El registro de usuarios está deshabilitado',
        'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos.',
        'For security purposes, you can only request this after 60 seconds.': 'Espera 60 segundos antes de intentar de nuevo.',
    };
    // En desarrollo, mostrar el error real para depuración
    return map[msg] || `Error: ${msg}`;
}
