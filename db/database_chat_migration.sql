-- =====================================================
-- CHAT SYSTEM DATABASE MIGRATION
-- WhatsApp-style isolated conversations
-- =====================================================

-- Drop existing tables if you want to start fresh (OPTIONAL - UNCOMMENT IF NEEDED)
-- DROP TABLE IF EXISTS public.simple_chat_messages CASCADE;
-- DROP TABLE IF EXISTS public.simple_chat_conversations CASCADE;

-- =====================================================
-- 1. CREATE CONVERSATIONS TABLE
-- Stores unique conversation pairs between users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.simple_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a TEXT NOT NULL,
  user_b TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT simple_chat_conversations_pair_unique UNIQUE (user_a, user_b)
);

-- Add comment for documentation
COMMENT ON TABLE public.simple_chat_conversations IS 'Stores unique conversation pairs between users (WhatsApp-style)';
COMMENT ON COLUMN public.simple_chat_conversations.user_a IS 'First user ID (alphabetically sorted)';
COMMENT ON COLUMN public.simple_chat_conversations.user_b IS 'Second user ID (alphabetically sorted)';

-- =====================================================
-- 2. CREATE MESSAGES TABLE
-- Stores all messages within conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.simple_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.simple_chat_conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.simple_chat_messages IS 'Stores all chat messages within conversations';
COMMENT ON COLUMN public.simple_chat_messages.conversation_id IS 'References the conversation this message belongs to';
COMMENT ON COLUMN public.simple_chat_messages.sender_id IS 'User ID who sent the message';

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_simple_chat_messages_conversation 
  ON public.simple_chat_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_simple_chat_messages_created_at 
  ON public.simple_chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simple_chat_messages_sender 
  ON public.simple_chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_simple_chat_conversations_users 
  ON public.simple_chat_conversations(user_a, user_b);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.simple_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simple_chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- Users can only see conversations they're part of
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.simple_chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.simple_chat_conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.simple_chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.simple_chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.simple_chat_messages;

-- Allow users to view conversations they're part of
CREATE POLICY "Users can view their own conversations" 
  ON public.simple_chat_conversations
  FOR SELECT
  USING (true); -- For demo, allow all. In production: (user_a = auth.uid()::text OR user_b = auth.uid()::text)

-- Allow users to create conversations
CREATE POLICY "Users can create conversations" 
  ON public.simple_chat_conversations
  FOR INSERT
  WITH CHECK (true); -- For demo, allow all. In production: (user_a = auth.uid()::text OR user_b = auth.uid()::text)

-- Allow users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" 
  ON public.simple_chat_messages
  FOR SELECT
  USING (true); -- For demo, allow all. In production: check conversation membership

-- Allow users to send messages
CREATE POLICY "Users can send messages" 
  ON public.simple_chat_messages
  FOR INSERT
  WITH CHECK (true); -- For demo, allow all. In production: (sender_id = auth.uid()::text)

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages" 
  ON public.simple_chat_messages
  FOR DELETE
  USING (true); -- For demo, allow all. In production: (sender_id = auth.uid()::text)

-- =====================================================
-- 6. ENABLE REALTIME
-- Required for Supabase real-time subscriptions
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.simple_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.simple_chat_conversations;

-- =====================================================
-- 7. CREATE FUNCTION TO UPDATE CONVERSATION TIMESTAMP
-- Updates the conversation's updated_at when a new message is sent
-- =====================================================
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.simple_chat_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON public.simple_chat_messages;
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON public.simple_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- =====================================================
-- 8. VERIFICATION QUERIES (Run separately to verify)
-- =====================================================

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'simple_chat%';

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename LIKE 'simple_chat%';

-- Check policies
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE tablename LIKE 'simple_chat%';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Chat system migration completed successfully!';
  RAISE NOTICE '📊 Tables created: simple_chat_conversations, simple_chat_messages';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '⚡ Real-time subscriptions enabled';
  RAISE NOTICE '🎯 Ready to use!';
END $$;

SELECT 'Chat system is ready!' AS status;
