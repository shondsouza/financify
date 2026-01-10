-- Time Tracking & Wage Calculation System Migration
-- Add new fields to staff_assignments table for time tracking and wage calculation

-- Add time tracking fields
ALTER TABLE staff_assignments 
ADD COLUMN IF NOT EXISTS entry_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS exit_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS break_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add wage calculation fields
ALTER TABLE staff_assignments 
ADD COLUMN IF NOT EXISTS base_pay DECIMAL(10,2) DEFAULT 350.00,
ADD COLUMN IF NOT EXISTS overtime_pay DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tl_commission DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_wage DECIMAL(10,2) DEFAULT 0.00;

-- Add tracking fields
ALTER TABLE staff_assignments 
ADD COLUMN IF NOT EXISTS logged_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS logged_at TIMESTAMP;

-- Update existing records with default values
UPDATE staff_assignments 
SET 
  base_pay = 350.00,
  total_wage = 350.00,
  tl_commission = staff_assigned * 25.00
WHERE base_pay IS NULL;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_staff_assignments_status ON staff_assignments(status);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_team_leader ON staff_assignments(team_leader_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_event ON staff_assignments(event_id);

-- Add comments for documentation
COMMENT ON COLUMN staff_assignments.entry_time IS 'Time when team leader started work';
COMMENT ON COLUMN staff_assignments.exit_time IS 'Time when team leader finished work';
COMMENT ON COLUMN staff_assignments.break_time IS 'Break time in minutes';
COMMENT ON COLUMN staff_assignments.admin_notes IS 'Additional notes from admin';
COMMENT ON COLUMN staff_assignments.base_pay IS 'Base pay for standard hours (default ₹350)';
COMMENT ON COLUMN staff_assignments.overtime_pay IS 'Additional pay for overtime hours (₹50/hr)';
COMMENT ON COLUMN staff_assignments.tl_commission IS 'Team leader commission (₹25 per staff member)';
COMMENT ON COLUMN staff_assignments.total_wage IS 'Total calculated wage (base + overtime + commission)';
COMMENT ON COLUMN staff_assignments.logged_by IS 'Admin user who logged the time';
COMMENT ON COLUMN staff_assignments.logged_at IS 'When the time was logged';

-- Update the status enum to include new statuses if needed
-- (This depends on your current status column type)
-- If using a text column, no changes needed
-- If using an enum, you might need to add 'completed' and 'paid' statuses

-- Example of how to add new statuses to an enum (uncomment if needed):
-- ALTER TYPE assignment_status ADD VALUE IF NOT EXISTS 'completed';
-- ALTER TYPE assignment_status ADD VALUE IF NOT EXISTS 'paid';
