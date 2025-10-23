"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import useChat from '../hooks/useChat'

export default function ChatWindow({ currentUserId, peerUserId, keyPassword }) {
  const { loading, error, messages, sendMessage, decryptRow } = useChat(currentUserId, peerUserId, keyPassword)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  const [view, setView] = useState([])
  useEffect(() => {
    let cancelled = false
    async function run() {
      const out = []
      for (const row of messages) {
        const d = await decryptRow(row)
        out.push(d)
      }
      if (!cancelled) setView(out)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    run()
    return () => { cancelled = true }
  }, [messages, decryptRow])

  async function onSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    await sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col border rounded-md h-[480px] max-w-xl w-full">
      <div className="p-3 border-b text-sm font-medium">Secure Chat</div>
      <div className="flex-1 overflow-auto p-3 space-y-2 bg-muted/10">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-red-600">{String(error.message || error)}</div>}
        {view.map((m) => (
          <div key={m.id} className={`max-w-[80%] text-sm p-2 rounded-md ${m.sender_id === currentUserId ? 'ml-auto bg-blue-600 text-white' : 'mr-auto bg-gray-200'}`}>
            <div>{m.plaintext}</div>
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



