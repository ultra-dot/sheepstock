-- ============================================================
-- FIX: Remove old RLS policies and clean up data isolation
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Step 1: Drop ALL existing policies on the data tables
-- This removes any old permissive policies that might let users see all data

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('cages', 'livestocks', 'inventory_items', 'health_records', 'feeding_records', 'weighing_records')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 2: Make sure RLS is enabled
ALTER TABLE cages ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weighing_records ENABLE ROW LEVEL SECURITY;

-- Step 3: Create ONLY the user_id-based policies (clean)

-- CAGES
CREATE POLICY "user_cages_select" ON cages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_cages_insert" ON cages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_cages_update" ON cages FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_cages_delete" ON cages FOR DELETE USING (user_id = auth.uid());

-- LIVESTOCKS
CREATE POLICY "user_livestocks_select" ON livestocks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_livestocks_insert" ON livestocks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_livestocks_update" ON livestocks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_livestocks_delete" ON livestocks FOR DELETE USING (user_id = auth.uid());

-- INVENTORY ITEMS
CREATE POLICY "user_inventory_select" ON inventory_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_inventory_insert" ON inventory_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_inventory_update" ON inventory_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_inventory_delete" ON inventory_items FOR DELETE USING (user_id = auth.uid());

-- HEALTH RECORDS
CREATE POLICY "user_health_select" ON health_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_health_insert" ON health_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_health_update" ON health_records FOR UPDATE USING (user_id = auth.uid());

-- FEEDING RECORDS
CREATE POLICY "user_feeding_select" ON feeding_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_feeding_insert" ON feeding_records FOR INSERT WITH CHECK (user_id = auth.uid());

-- WEIGHING RECORDS
CREATE POLICY "user_weighing_select" ON weighing_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_weighing_insert" ON weighing_records FOR INSERT WITH CHECK (user_id = auth.uid());
