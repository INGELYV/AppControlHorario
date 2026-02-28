-- Migration: Fix relationships for joined queries
-- Created at: 2026-02-28 13:42:00

-- Add explicit relationship between time_entries and profiles
-- This allows PostgREST to perform joins like .select('*, profiles(*)')
ALTER TABLE time_entries
DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey,
ADD CONSTRAINT time_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE;
