-- ═══════════════════════════════════════════════════════════
-- Control Horario — Supabase Schema
-- ═══════════════════════════════════════════════════════════

-- 1. Profiles (se crea automáticamente al registrarse)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Time Entries (registros de jornada)
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clock_out TIMESTAMPTZ,
    total_hours NUMERIC(5,2),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    edited_manually BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Pauses (pausas dentro de una jornada)
CREATE TABLE IF NOT EXISTS pauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    type TEXT NOT NULL DEFAULT 'break' CHECK (type IN ('meal', 'break', 'other')),
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_pauses_entry_id ON pauses(time_entry_id);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- Cada usuario solo puede ver/editar sus propios datos
-- ═══════════════════════════════════════════════════════════

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Time Entries RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
    ON time_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
    ON time_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
    ON time_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
    ON time_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Pauses RLS
ALTER TABLE pauses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pauses"
    ON pauses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM time_entries
        WHERE time_entries.id = pauses.time_entry_id
        AND time_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own pauses"
    ON pauses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM time_entries
        WHERE time_entries.id = pauses.time_entry_id
        AND time_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own pauses"
    ON pauses FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM time_entries
        WHERE time_entries.id = pauses.time_entry_id
        AND time_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own pauses"
    ON pauses FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM time_entries
        WHERE time_entries.id = pauses.time_entry_id
        AND time_entries.user_id = auth.uid()
    ));

-- ═══════════════════════════════════════════════════════════
-- Trigger: crear perfil automáticamente al registrarse
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE WHEN NEW.email = 'ingelyv@gmail.com' THEN 'admin' ELSE 'employee' END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- Trigger: actualizar updated_at automáticamente
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pauses_updated_at
    BEFORE UPDATE ON pauses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
