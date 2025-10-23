-- DEBUG CHAT ISOLATION ISSUE
-- Run these queries to diagnose the problem

-- 1. Check all conversations
SELECT 
  c.id as conversation_id,
  c.user_a,
  c.user_b,
  c.created_at
FROM simple_chat_conversations c
ORDER BY c.created_at DESC;

-- 2. Check all messages with their conversation info
SELECT 
  m.id as message_id,
  m.conversation_id,
  m.sender_id,
  m.message,
  m.created_at,
  c.user_a as conv_user_a,
  c.user_b as conv_user_b
FROM simple_chat_messages m
LEFT JOIN simple_chat_conversations c ON m.conversation_id = c.id
ORDER BY m.created_at DESC;

-- 3. Verify the conversation between admin-1 and tl-1 (John)
SELECT 
  c.id as conversation_id,
  c.user_a,
  c.user_b,
  COUNT(m.id) as message_count
FROM simple_chat_conversations c
LEFT JOIN simple_chat_messages m ON c.id = m.conversation_id
WHERE (c.user_a = 'admin-1' AND c.user_b = 'tl-1')
   OR (c.user_a = 'tl-1' AND c.user_b = 'admin-1')
GROUP BY c.id, c.user_a, c.user_b;

-- 4. Check if there are any messages WITHOUT a conversation_id (orphaned)
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.message
FROM simple_chat_messages m
WHERE m.conversation_id IS NULL;

-- 5. What conversation should Sarah see when she selects Admin?
-- (Should be a NEW conversation with 0 messages)
SELECT 
  c.id as conversation_id,
  c.user_a,
  c.user_b,
  COUNT(m.id) as message_count
FROM simple_chat_conversations c
LEFT JOIN simple_chat_messages m ON c.id = m.conversation_id
WHERE (c.user_a = 'admin-1' AND c.user_b = 'tl-2')
   OR (c.user_a = 'tl-2' AND c.user_b = 'admin-1')
GROUP BY c.id, c.user_a, c.user_b;
