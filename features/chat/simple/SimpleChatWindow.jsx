"use client"
import { useEffect, useRef, useState } from 'react'
import useSimpleChat from './useSimpleChat'

export default function SimpleChatWindow({ currentUserId, peerUserId }) {
  const { loading, error, messages, sendMessage } = useSimpleChat(currentUserId, peerUserId)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function onSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    await sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col border rounded-md h-[480px] max-w-xl w-full">
      <div className="p-3 border-b text-sm font-medium">Chat</div>
      <div className="flex-1 overflow-auto p-3 space-y-2 bg-muted/10">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-red-600">{String(error.message || error)}</div>}
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] text-sm p-2 rounded-md ${m.sender_id === currentUserId ? 'ml-auto bg-blue-600 text-white' : 'mr-auto bg-gray-200'}`}>
            <div>{m.message}</div>
            <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="px-3 py-2 rounded bg-blue-600 text-white text-sm" type="submit">Send</button>
      </form>
    </div>
  )
}
