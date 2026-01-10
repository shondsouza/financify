-- Enable Realtime for simple chat tables
-- Run this in Supabase SQL Editor

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.simple_chat_messages;

-- Optional: Enable realtime for conversations table (if you want to track conversation changes)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.simple_chat_conversations;
