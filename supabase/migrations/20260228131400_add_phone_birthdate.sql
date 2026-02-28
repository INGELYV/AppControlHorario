-- Migration: Add phone and birth_date to profiles
-- Created at: 2026-02-28 13:14:00

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
