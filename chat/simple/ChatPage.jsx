"use client"
import { useState } from 'react'
import FullPageChat from './FullPageChat'

export default function ChatPage({ currentUserId }) {
  const [showChat, setShowChat] = useState(false)

  if (showChat) {
    return (
      <FullPageChat 
        currentUserId={currentUserId} 
        onBack={() => setShowChat(false)} 
      />
    )
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Secure Chat</h2>
        <p className="text-gray-600 mb-8">Communicate with your team members in real-time</p>
        <button
          onClick={() => setShowChat(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Chat
        </button>
      </div>
    </div>
  )
}
