-- Migration: Fix RLS Recursion and Admin Access
-- Created at: 2026-02-28 13:50:00

-- 1. Create a security definer function to check if the user is an admin
-- This avoids the infinite recursion in RLS policies on the profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up previous policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all entries" ON time_entries;
DROP POLICY IF EXISTS "Admins can view all pauses" ON pauses;

-- 3. Apply new, non-recursive policies
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING ( public.is_admin() );

CREATE POLICY "Admins can view all entries"
    ON public.time_entries FOR SELECT
    USING ( public.is_admin() );

CREATE POLICY "Admins can view all pauses"
    ON public.pauses FOR SELECT
    USING ( public.is_admin() );
