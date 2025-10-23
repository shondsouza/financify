-- Add password field to users table for authentication
-- Run this migration in your Supabase SQL Editor

-- Add password column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Set default password for existing users (for demo purposes)
UPDATE users 
SET password = 'demo123' 
WHERE password IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.password IS 'User password for authentication (in production, should be hashed)';

-- Success message
SELECT 'User password migration completed successfully!' AS status;
