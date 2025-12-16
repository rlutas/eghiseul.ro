-- =============================================
-- Migration: 003_fix_rls_recursion
-- Description: Fix infinite recursion in RLS policies
-- Date: 2025-12-16
-- Issue: Admin policies checking profiles table causes recursion
-- =============================================

-- First, create a function to check admin role without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Use raw SQL to bypass RLS and check admin role
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check partner role
CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'partner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- Fix profiles table policies
-- =============================================

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Recreate with SECURITY DEFINER function
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (public.is_admin());

-- =============================================
-- Fix services table policies
-- =============================================

-- Drop and recreate admin policies for services
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can delete services" ON services;

CREATE POLICY "Admins can insert services"
  ON services
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update services"
  ON services
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete services"
  ON services
  FOR DELETE
  USING (public.is_admin());

-- =============================================
-- Fix service_options table policies
-- =============================================

DROP POLICY IF EXISTS "Admins can insert service options" ON service_options;
DROP POLICY IF EXISTS "Admins can update service options" ON service_options;
DROP POLICY IF EXISTS "Admins can delete service options" ON service_options;

CREATE POLICY "Admins can insert service options"
  ON service_options
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update service options"
  ON service_options
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete service options"
  ON service_options
  FOR DELETE
  USING (public.is_admin());

-- =============================================
-- Fix orders table policies
-- =============================================

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Partners can view their orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Partners can view their orders"
  ON orders
  FOR SELECT
  USING (public.is_partner() AND partner_id = auth.uid());

-- =============================================
-- Fix order_history table policies
-- =============================================

DROP POLICY IF EXISTS "Admins can view all order history" ON order_history;

CREATE POLICY "Admins can view all order history"
  ON order_history
  FOR SELECT
  USING (public.is_admin());

-- =============================================
-- Run this migration in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =============================================

-- After running, verify no recursion errors with:
-- SELECT * FROM services LIMIT 1;
