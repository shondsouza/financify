-- User Management Schema
-- Run this in Supabase SQL Editor

-- Add password column to existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Update existing users with default passwords (optional)
UPDATE public.users 
SET password = 'default123' 
WHERE password IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(isActive);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Optional: Add RLS policies for user management
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to manage all users
-- CREATE POLICY "Admins can manage users" ON public.users
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.users 
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- Policy to allow users to view their own data
-- CREATE POLICY "Users can view own data" ON public.users
--   FOR SELECT USING (id = auth.uid());
