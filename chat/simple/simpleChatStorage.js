import { chatSupabase } from '../storage/supabaseClient'

// Simple chat storage - no encryption
export async function getOrCreateConversation(userId1, userId2) {
  // Deterministic order
  const [a, b] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]
  
  const { data: existing } = await chatSupabase
    .from('simple_chat_conversations')
    .select('*')
    .eq('user_a', a)
    .eq('user_b', b)
    .maybeSingle()
  
  if (existing) return { data: existing }
  
  // Try to insert, but handle the case where it already exists
  const { data, error } = await chatSupabase
    .from('simple_chat_conversations')
    .upsert({ user_a: a, user_b: b }, { onConflict: 'user_a,user_b' })
    .select()
    .single()
  
  return { data, error }
}

export async function getMessages(conversationId, limit = 100) {
  const { data, error } = await chatSupabase
    .from('simple_chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)
  
  return { data: data || [], error }
}

export async function sendMessage(conversationId, senderId, message) {
  const { data, error } = await chatSupabase
    .from('simple_chat_messages')
    .insert({ 
      conversation_id: conversationId, 
      sender_id: senderId, 
      message: message 
    })
    .select()
    .single()
  
  return { data, error }
}

export async function deleteMessage(messageId) {
  const { data, error } = await chatSupabase
    .from('simple_chat_messages')
    .delete()
    .eq('id', messageId)
    .select()
    .single()
  
  return { data, error }
}
