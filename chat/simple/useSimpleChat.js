import { useCallback, useEffect, useState } from 'react'
import { getOrCreateConversation, getMessages, sendMessage, deleteMessage } from './simpleChatStorage'
import { chatSupabase } from '../storage/supabaseClient'

export default function useSimpleChat(currentUserId, peerUserId) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])

  const init = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get or create conversation
      const { data: conv, error: convError } = await getOrCreateConversation(currentUserId, peerUserId)
      if (convError) throw convError
      
      setConversation(conv)
      
      // Load messages
      const { data: msgs, error: msgError } = await getMessages(conv.id, 200)
      if (msgError) throw msgError
      
      setMessages(msgs)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, peerUserId])

  // Set up real-time subscription
  useEffect(() => {
    if (!conversation?.id) return

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
          // Add new message to the list
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    // Cleanup subscription on unmount or conversation change
    return () => {
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
