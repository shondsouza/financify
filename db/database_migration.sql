-- Database Migration Script for Time Tracking
-- Run this in your Supabase SQL Editor to add time tracking fields

-- Add new columns to staff_assignments table
ALTER TABLE staff_assignments 
ADD COLUMN IF NOT EXISTS "entryTime" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "exitTime" TIMESTAMP WITH TIME ZONE;

-- Update existing records to have default values
UPDATE staff_assignments 
SET "entryTime" = NULL, "exitTime" = NULL 
WHERE "entryTime" IS NULL OR "exitTime" IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN staff_assignments."entryTime" IS 'Time when staff started working on the event';
COMMENT ON COLUMN staff_assignments."exitTime" IS 'Time when staff finished working on the event';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'staff_assignments' 
AND column_name IN ('entryTime', 'exitTime');

-- Success message
SELECT 'Time tracking migration completed successfully!' AS status;

-- Wage settings table (base pay, standard hours, overtime rate)
CREATE TABLE IF NOT EXISTS wage_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  "basePay" DECIMAL(10,2) NOT NULL DEFAULT 350.00,
  "standardHours" DECIMAL(4,2) NOT NULL DEFAULT 7.00,
  "overtimeRate" DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure a default row exists
INSERT INTO wage_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Open access policy for MVP (tighten for prod)
ALTER TABLE wage_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Allow all operations" ON wage_settings FOR ALL USING (true)';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

SELECT 'Wage settings migration completed successfully!' AS status;