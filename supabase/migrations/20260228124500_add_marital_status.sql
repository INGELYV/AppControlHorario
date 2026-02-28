-- Migration: Add marital_status to profiles
-- Created at: 2026-02-28 12:45:00

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marital_status TEXT;
