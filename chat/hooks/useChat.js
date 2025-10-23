import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getOrCreateConversation, getUserKeys, insertMessage, listMessages, upsertUserKeys } from '../storage/chatStorage'
import { base64ToBytes, bytesToBase64, decryptMessage, decryptPrivateKey, deriveConversationKey, encryptMessage, encryptPrivateKey, exportPrivateKeyPkcs8, exportPublicKeyJwk, generateIdentityKeyPair, importPrivateKeyFromPkcs8 } from '../crypto/crypto'

export default function useChat(currentUserId, peerUserId, keyPassword) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [myKeys, setMyKeys] = useState({ publicJwk: null, privateKey: null })
  const [peerPublicJwk, setPeerPublicJwk] = useState(null)
  const aesKeyRef = useRef(null)

  const conversationUsers = useMemo(() => [currentUserId, peerUserId], [currentUserId, peerUserId])

  const ensureKeys = useCallback(async (userId) => {
    const { data } = await getUserKeys(userId)
    if (data?.public_jwk && data?.enc_private_key) {
      // Decrypt private key with password
      const pkcs8 = await decryptPrivateKey(data.enc_private_key, keyPassword)
      const privateKey = await importPrivateKeyFromPkcs8(pkcs8)
      return { publicJwk: data.public_jwk, privateKey }
    }
    // Generate new
    const kp = await generateIdentityKeyPair()
    const publicJwk = await exportPublicKeyJwk(kp.publicKey)
    const pkcs8 = await exportPrivateKeyPkcs8(kp.privateKey)
    const enc = await encryptPrivateKey(pkcs8, keyPassword)
    await upsertUserKeys(userId, publicJwk, enc)
    return { publicJwk, privateKey: kp.privateKey }
  }, [keyPassword])

  const init = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Keys
      const my = await ensureKeys(currentUserId)
      setMyKeys(my)
      const peer = await getUserKeys(peerUserId)
      if (!peer.data?.public_jwk) throw new Error('Peer user has no chat key yet')
      setPeerPublicJwk(peer.data.public_jwk)

      // Conversation
      const { data: conv } = await getOrCreateConversation(currentUserId, peerUserId)
      setConversation(conv)

      // Derive AES key
      const aesKey = await deriveConversationKey(my.privateKey, peer.data.public_jwk)
      aesKeyRef.current = aesKey

      // Load messages
      const { data: rows } = await listMessages(conv.id, 200)
      setMessages(rows)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, peerUserId, ensureKeys])

  useEffect(() => {
    if (currentUserId && peerUserId && keyPassword) init()
  }, [currentUserId, peerUserId, keyPassword, init])

  const sendMessage = useCallback(async (text) => {
    if (!text || !conversation?.id || !aesKeyRef.current) return
    const { iv, ciphertext } = await encryptMessage(aesKeyRef.current, text)
    const { data } = await insertMessage(conversation.id, currentUserId, iv, ciphertext)
    setMessages((prev) => [...prev, data])
  }, [conversation, currentUserId])

  const decryptRow = useCallback(async (row) => {
    if (!aesKeyRef.current) return null
    try {
      const plaintext = await decryptMessage(aesKeyRef.current, row.iv_b64, row.ciphertext_b64)
      return { ...row, plaintext }
    } catch {
      return { ...row, plaintext: '[decryption failed]' }
    }
  }, [])

  const decryptedMessages = useMemo(() => {
    return messages
  }, [messages])

  return {
    loading,
    error,
    conversation,
    messages: decryptedMessages,
    sendMessage,
    decryptRow,
    refresh: init,
  }
}



