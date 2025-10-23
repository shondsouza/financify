import { useCallback, useEffect, useState } from 'react'
import { getOrCreateConversation, getMessages, sendMessage, deleteMessage } from './simpleChatStorage'
import { chatSupabase } from '../storage/supabaseClient'

export default function useSimpleChat(currentUserId, peerUserId) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])

  const init = useCallback(async () => {
    if (!currentUserId || !peerUserId) {
      console.log('⚠️ Chat init skipped - missing user IDs:', { currentUserId, peerUserId })
      setMessages([])
      setConversation(null)
      setLoading(false)
      return
    }

    console.log('🔄 Chat init - Loading conversation:', { currentUserId, peerUserId })
    setLoading(true)
    setError(null)
    
    try {
      // Get or create conversation
      const { data: conv, error: convError } = await getOrCreateConversation(currentUserId, peerUserId)
      if (convError) throw convError
      
      console.log('✅ Conversation loaded:', { 
        conversationId: conv.id, 
        user_a: conv.user_a, 
        user_b: conv.user_b 
      })
      
      setConversation(conv)
      
      // Load messages
      const { data: msgs, error: msgError } = await getMessages(conv.id, 200)
      if (msgError) throw msgError
      
      console.log('📨 Messages loaded:', { 
        conversationId: conv.id, 
        messageCount: msgs.length,
        messages: msgs 
      })
      
      setMessages(msgs)
    } catch (e) {
      console.error('❌ Chat init error:', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, peerUserId])

  // Set up real-time subscription
  useEffect(() => {
    if (!conversation?.id) {
      console.log('⚠️ Realtime subscription skipped - no conversation ID')
      return
    }

    console.log('🔌 Setting up realtime subscription for conversation:', conversation.id)

    // Subscribe to real-time changes for this conversation
    const subscription = chatSupabase
      .channel(`conversation-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'simple_chat_messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          console.log('🔔 New message received via realtime:', payload.new)
          // Add new message to the list
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    // Cleanup subscription on unmount or conversation change
    return () => {
      console.log('🚫 Unsubscribing from conversation:', conversation.id)
      subscription.unsubscribe()
    }
  }, [conversation?.id])

  useEffect(() => {
    if (currentUserId && peerUserId) {
      init()
    }
  }, [currentUserId, peerUserId, init])

  const sendNewMessage = useCallback(async (text) => {
    if (!text || !conversation?.id) return
    
    const { data, error } = await sendMessage(conversation.id, currentUserId, text)
    if (error) {
      setError(error)
      return
    }
    
    // Message will be added automatically via real-time subscription
    // No need to manually add it here
  }, [conversation, currentUserId])

  const deleteMessageById = useCallback(async (messageId) => {
    const { error } = await deleteMessage(messageId)
    if (error) {
      setError(error)
      return false
    }
    
    // Remove message from local state
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    return true
  }, [])

  return {
    loading,
    error,
    conversation,
    messages,
    sendMessage: sendNewMessage,
    deleteMessage: deleteMessageById,
    refresh: init
  }
}
