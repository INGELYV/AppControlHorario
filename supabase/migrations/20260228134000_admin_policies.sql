-- Migration: Add Admin RLS Policies
-- Created at: 2026-02-28 13:40:00

-- Allow admins to see all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles AS p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

-- Allow admins to see all time entries
CREATE POLICY "Admins can view all entries"
    ON time_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to see all pauses
CREATE POLICY "Admins can view all pauses"
    ON pauses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
