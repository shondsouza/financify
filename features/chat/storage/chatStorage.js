import { chatSupabase } from './supabaseClient'

// Tables:
// chat_users_keys: { user_id (pk), public_jwk (json), enc_private_key (json), created_at }
// chat_conversations: { id (pk), a_user_id, b_user_id, created_at }
// chat_messages: { id (pk), conversation_id, sender_id, iv_b64, ciphertext_b64, created_at }

export async function upsertUserKeys(userId, publicJwk, encPrivateKeyJson) {
  return await chatSupabase.from('chat_users_keys').upsert({
    user_id: userId,
    public_jwk: publicJwk,
    enc_private_key: encPrivateKeyJson,
  })
}

export async function getUserKeys(userId) {
  const { data, error } = await chatSupabase
    .from('chat_users_keys')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export async function getOrCreateConversation(aUserId, bUserId) {
  // Deterministic order
  const [x, y] = aUserId < bUserId ? [aUserId, bUserId] : [bUserId, aUserId]
  const { data: existing } = await chatSupabase
    .from('chat_conversations')
    .select('*')
    .eq('a_user_id', x)
    .eq('b_user_id', y)
    .maybeSingle()
  if (existing) return { data: existing }
  const { data, error } = await chatSupabase
    .from('chat_conversations')
    .insert({ a_user_id: x, b_user_id: y })
    .select()
    .single()
  return { data, error }
}

export async function listMessages(conversationId, limit = 100) {
  const { data, error } = await chatSupabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)
  return { data: data || [], error }
}

export async function insertMessage(conversationId, senderId, ivB64, ciphertextB64) {
  const { data, error } = await chatSupabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, iv_b64: ivB64, ciphertext_b64: ciphertextB64 })
    .select()
    .single()
  return { data, error }
}



