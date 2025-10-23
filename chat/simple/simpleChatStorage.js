import { chatSupabase } from '../storage/supabaseClient'

// Simple chat storage - no encryption
export async function getOrCreateConversation(userId1, userId2) {
  // Deterministic order
  const [a, b] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]
  
  console.log('🔍 Looking for conversation:', { userId1, userId2, sorted: { a, b } })
  
  const { data: existing } = await chatSupabase
    .from('simple_chat_conversations')
    .select('*')
    .eq('user_a', a)
    .eq('user_b', b)
    .maybeSingle()
  
  if (existing) {
    console.log('✅ Found existing conversation:', existing)
    return { data: existing }
  }
  
  console.log('➕ Creating new conversation for:', { a, b })
  // Try to insert, but handle the case where it already exists
  const { data, error } = await chatSupabase
    .from('simple_chat_conversations')
    .upsert({ user_a: a, user_b: b }, { onConflict: 'user_a,user_b' })
    .select()
    .single()
  
  console.log('🆕 New conversation created:', data)
  return { data, error }
}

export async function getMessages(conversationId, limit = 100) {
  console.log('📬 Fetching messages for conversation:', conversationId)
  
  const { data, error } = await chatSupabase
    .from('simple_chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)
  
  console.log('📨 Messages fetched:', { 
    conversationId, 
    count: data?.length || 0, 
    messages: data,
    error 
  })
  
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
