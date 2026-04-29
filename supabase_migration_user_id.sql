-- ============================================================
-- MIGRATION: Add user_id column to all data tables
-- Purpose: Separate data per user account
-- ============================================================
-- HOW TO RUN: Copy this entire script into the Supabase Dashboard > SQL Editor > New Query, then click "Run"
-- ============================================================

-- 1. Add user_id column to 'cages' table
ALTER TABLE cages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user_id column to 'livestocks' table
ALTER TABLE livestocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add user_id column to 'inventory_items' table
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Add user_id column to 'health_records' table
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Add user_id column to 'feeding_records' table
ALTER TABLE feeding_records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Add user_id column to 'weighing_records' table
ALTER TABLE weighing_records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- ASSIGN EXISTING DATA to the first admin user (so old data doesn't disappear)
-- Replace the UUID below with your main admin user ID from Supabase Auth > Users
-- You can find it in the Supabase Dashboard > Authentication > Users
-- ============================================================

-- IMPORTANT: Replace 'YOUR_ADMIN_USER_ID_HERE' with your actual admin UUID
-- Example: UPDATE cages SET user_id = '12345678-abcd-efgh-ijkl-123456789012' WHERE user_id IS NULL;

-- UPDATE cages SET user_id = 'YOUR_ADMIN_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE livestocks SET user_id = 'YOUR_ADMIN_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE inventory_items SET user_id = 'YOUR_ADMIN_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE health_records SET user_id = 'YOUR_ADMIN_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE feeding_records SET user_id = 'YOUR_ADMIN_USER_ID_HERE' WHERE user_id IS NULL;
-- UPDATE weighing_records SET user_id = 'YOUR_ADMIN_USER_ID_HERE' WHERE user_id IS NULL;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- These ensure each user can only see/modify their own data
-- ============================================================

-- CAGES
DROP POLICY IF EXISTS "Users can view own cages" ON cages;
DROP POLICY IF EXISTS "Users can insert own cages" ON cages;
DROP POLICY IF EXISTS "Users can update own cages" ON cages;
DROP POLICY IF EXISTS "Users can delete own cages" ON cages;

CREATE POLICY "Users can view own cages" ON cages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own cages" ON cages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own cages" ON cages FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own cages" ON cages FOR DELETE USING (user_id = auth.uid());

-- LIVESTOCKS
DROP POLICY IF EXISTS "Users can view own livestocks" ON livestocks;
DROP POLICY IF EXISTS "Users can insert own livestocks" ON livestocks;
DROP POLICY IF EXISTS "Users can update own livestocks" ON livestocks;
DROP POLICY IF EXISTS "Users can delete own livestocks" ON livestocks;

CREATE POLICY "Users can view own livestocks" ON livestocks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own livestocks" ON livestocks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own livestocks" ON livestocks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own livestocks" ON livestocks FOR DELETE USING (user_id = auth.uid());

-- INVENTORY ITEMS
DROP POLICY IF EXISTS "Users can view own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory" ON inventory_items;

CREATE POLICY "Users can view own inventory" ON inventory_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own inventory" ON inventory_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own inventory" ON inventory_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own inventory" ON inventory_items FOR DELETE USING (user_id = auth.uid());

-- HEALTH RECORDS
DROP POLICY IF EXISTS "Users can view own health records" ON health_records;
DROP POLICY IF EXISTS "Users can insert own health records" ON health_records;
DROP POLICY IF EXISTS "Users can update own health records" ON health_records;

CREATE POLICY "Users can view own health records" ON health_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own health records" ON health_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own health records" ON health_records FOR UPDATE USING (user_id = auth.uid());

-- FEEDING RECORDS
DROP POLICY IF EXISTS "Users can view own feeding records" ON feeding_records;
DROP POLICY IF EXISTS "Users can insert own feeding records" ON feeding_records;

CREATE POLICY "Users can view own feeding records" ON feeding_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own feeding records" ON feeding_records FOR INSERT WITH CHECK (user_id = auth.uid());

-- WEIGHING RECORDS
DROP POLICY IF EXISTS "Users can view own weighing records" ON weighing_records;
DROP POLICY IF EXISTS "Users can insert own weighing records" ON weighing_records;

CREATE POLICY "Users can view own weighing records" ON weighing_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own weighing records" ON weighing_records FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Enable RLS on all tables (if not already enabled)
-- ============================================================
ALTER TABLE cages ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weighing_records ENABLE ROW LEVEL SECURITY;
