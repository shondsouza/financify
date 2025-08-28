-- Finance Tracking System Database Schema
-- Run this in your Supabase SQL Editor

-- Drop existing tables if recreating (optional)
DROP TABLE IF EXISTS staff_assignments;
DROP TABLE IF EXISTS event_responses;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- Users table for authentication and roles
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'team_leader')),
  phone TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (created by admins)
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "eventDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  "staffNeeded" INTEGER NOT NULL,
  "expectedRevenue" DECIMAL(10,2),
  "budgetAllocated" DECIMAL(10,2),
  requirements TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
  "createdBy" TEXT NOT NULL REFERENCES users(id),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event responses from team leaders
CREATE TABLE event_responses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventId" TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "teamLeaderId" TEXT NOT NULL REFERENCES users(id),
  available BOOLEAN NOT NULL,
  "staffCount" INTEGER DEFAULT 0,
  message TEXT,
  "respondedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("eventId", "teamLeaderId")
);

-- Staff assignments (final assignments after admin reviews responses)
CREATE TABLE staff_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventId" TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "teamLeaderId" TEXT NOT NULL REFERENCES users(id),
  "staffAssigned" INTEGER NOT NULL,
  "assignedHours" DECIMAL(4,2) DEFAULT 7.0,
  "actualHours" DECIMAL(4,2),
  "basePay" DECIMAL(10,2) DEFAULT 350.00,
  "overtimePay" DECIMAL(10,2) DEFAULT 0.00,
  "totalWage" DECIMAL(10,2),
  commission DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'paid')),
  notes TEXT,
  "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for MVP - adjust for production)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON event_responses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON staff_assignments FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_events_date ON events("eventDate");
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_by ON events("createdBy");
CREATE INDEX idx_responses_event ON event_responses("eventId");
CREATE INDEX idx_responses_team_leader ON event_responses("teamLeaderId");
CREATE INDEX idx_assignments_event ON staff_assignments("eventId");
CREATE INDEX idx_assignments_team_leader ON staff_assignments("teamLeaderId");

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update timestamp triggers
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_events_timestamp ON events;
CREATE TRIGGER update_events_timestamp
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Insert sample data
INSERT INTO users (id, email, name, role, phone) VALUES 
  ('admin-1', 'admin@company.com', 'System Admin', 'admin', '+91-9876543210'),
  ('tl-1', 'john@company.com', 'john Smith', 'team_leader', '+91-9876543211'),
  ('tl-2', 'sarah@company.com', 'Sarah johnson', 'team_leader', '+91-9876543212'),
  ('tl-3', 'mike@company.com', 'Mike Wilson', 'team_leader', '+91-9876543213');

-- Insert sample events
INSERT INTO events (id, title, client, "eventType", "eventDate", location, "staffNeeded", "expectedRevenue", "budgetAllocated", "createdBy") VALUES 
  ('event-1', 'Corporate Conference Setup', 'Tech Corp Ltd', 'Corporate Event', '2025-01-20 09:00:00+00', 'Grand Hotel, Mumbai', 8, 50000.00, 35000.00, 'admin-1'),
  ('event-2', 'Wedding Catering Service', 'Sharma Family', 'Wedding', '2025-01-22 18:00:00+00', 'Royal Banquet Hall, Delhi', 12, 75000.00, 50000.00, 'admin-1'),
  ('event-3', 'Hotel Renovation Project', 'Luxury Suites', 'Hotel Service', '2025-01-25 08:00:00+00', 'Luxury Suites Hotel, Bangalore', 15, 100000.00, 70000.00, 'admin-1');

-- Success message
SELECT 'Database setup completed successfully!' AS status;