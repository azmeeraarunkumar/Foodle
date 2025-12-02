-- Fix RLS policies to allow public access (since we are bypassing auth for testing)
-- Run this in Supabase SQL Editor

-- 1. Update Stalls Policy
DROP POLICY IF EXISTS "Anyone can view stalls" ON stalls;

CREATE POLICY "Anyone can view stalls"
  ON stalls FOR SELECT
  TO public
  USING (true);

-- 2. Update Menu Items Policy
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;

CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO public
  USING (true);

-- 3. Update Orders Policy (optional, but good for testing)
-- Allow public to create orders for now
DROP POLICY IF EXISTS "Students can create orders" ON orders;

CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to view their own orders (by matching local storage ID if we had one, but for now allow all for testing)
-- Note: This is insecure for production but fine for this specific testing phase
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

CREATE POLICY "Public can view orders"
  ON orders FOR SELECT
  TO public
  USING (true);
