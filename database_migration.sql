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
