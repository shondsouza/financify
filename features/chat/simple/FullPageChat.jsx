"use client"
import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, ArrowLeft, User, Trash2 } from 'lucide-react'
import useSimpleChat from './useSimpleChat'

export default function FullPageChat({ currentUserId, onBack }) {
  const [selectedPeer, setSelectedPeer] = useState(null)
  const [input, setInput] = useState('')
  const [showDeleteOption, setShowDeleteOption] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const bottomRef = useRef(null)
  
  // Dynamic user list from database
  const [availableUsers, setAvailableUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)

  console.log('👥 FullPageChat rendered with currentUserId:', currentUserId)

  // Load all users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true)
        console.log('📥 Loading users from database...')
        
        const response = await fetch('/api/users')
        if (response.ok) {
          const users = await response.json()
          console.log('✅ Loaded users:', users)
          
          // Format users for chat
          const formattedUsers = users
            .filter(user => user.isActive) // Only active users
            .map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.role === 'admin' ? '/avatar/Admin.png' : '/avatar/person.png'
            }))
          
          setAvailableUsers(formattedUsers)
          console.log('👥 Available users for chat:', formattedUsers.length)
        } else {
          console.error('Failed to load users')
          // Fallback to hardcoded users if API fails
          setAvailableUsers([
            { id: 'admin-1', name: 'System Admin', role: 'admin', avatar: '/avatar/Admin.png' },
            { id: 'tl-1', name: 'John Smith', role: 'team_leader', avatar: '/avatar/person.png' },
            { id: 'tl-2', name: 'Sarah Johnson', role: 'team_leader', avatar: '/avatar/person.png' },
            { id: 'tl-3', name: 'Mike Wilson', role: 'team_leader', avatar: '/avatar/person.png' }
          ])
        }
      } catch (error) {
        console.error('Error loading users:', error)
        // Fallback to hardcoded users
        setAvailableUsers([
          { id: 'admin-1', name: 'System Admin', role: 'admin', avatar: '/avatar/Admin.png' },
          { id: 'tl-1', name: 'John Smith', role: 'team_leader', avatar: '/avatar/person.png' }
        ])
      } finally {
        setUsersLoading(false)
      }
    }

    loadUsers()
  }, []) // Load once on mount

  // Filter out current user from available users
  const otherUsers = availableUsers.filter(user => user.id !== currentUserId)

  const { loading, error, messages, sendMessage, deleteMessage } = useSimpleChat(
    currentUserId, 
    selectedPeer?.id
  )

  // Debug: Log when selectedPeer changes
  useEffect(() => {
    console.log('👤 Selected peer changed:', { 
      peerName: selectedPeer?.name, 
      peerId: selectedPeer?.id,
      currentUserId 
    })
  }, [selectedPeer, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function onSend(e) {
    e.preventDefault()
    if (!input.trim() || !selectedPeer) return
    await sendMessage(input.trim())
    setInput('')
  }

  // Long press handlers
  const handleMessageLongPress = (messageId) => {
    setShowDeleteOption(messageId)
  }

  const handleDeleteClick = (messageId) => {
    setDeleteConfirm(messageId)
    setShowDeleteOption(null)
  }

  const confirmDelete = async (messageId) => {
    const success = await deleteMessage(messageId)
    if (success) {
      setDeleteConfirm(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
    setShowDeleteOption(null)
  }

  const getCurrentUser = () => {
    const user = availableUsers.find(user => user.id === currentUserId)
    if (user) return user
    
    // If current user not in list yet, create a temporary entry
    return { 
      id: currentUserId, 
      name: 'You', 
      role: 'user', 
      avatar: '/avatar/person.png' 
    }
  }

  const currentUser = getCurrentUser()

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - User List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">{currentUser.name}</h2>
              <p className="text-sm text-blue-100">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Team Members</h3>
            
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500 text-sm">Loading users...</div>
              </div>
            ) : otherUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No other users found</p>
              </div>
            ) : (
              otherUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedPeer(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedPeer?.id === user.id 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-semibold" style={{display: 'none'}}>
                        {user.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedPeer ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedPeer.avatar} 
                  alt={selectedPeer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-semibold" style={{display: 'none'}}>
                  {selectedPeer.name.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedPeer.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{selectedPeer.role.replace('_', ' ')}</p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading && (
                <div className="flex justify-center">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              )}
              
              {error && (
                <div className="flex justify-center">
                  <div className="text-red-500">Error: {error.message}</div>
                </div>
              )}

              {messages.length === 0 && !loading && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation with {selectedPeer.name}</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} relative`}
                >
                  <div 
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all duration-200 ${
                      message.sender_id === currentUserId
                        ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                        : 'bg-white text-gray-900 border border-gray-200'
                    } ${showDeleteOption === message.id ? 'ring-2 ring-red-500' : ''}`}
                    onMouseDown={() => {
                      // Only allow long press on own messages
                      if (message.sender_id !== currentUserId) return
                      
                      // Start long press timer
                      const timer = setTimeout(() => {
                        handleMessageLongPress(message.id)
                      }, 500) // 500ms long press
                      
                      const handleMouseUp = () => {
                        clearTimeout(timer)
                        document.removeEventListener('mouseup', handleMouseUp)
                      }
                      
                      document.addEventListener('mouseup', handleMouseUp)
                    }}
                    onTouchStart={() => {
                      // Only allow long press on own messages
                      if (message.sender_id !== currentUserId) return
                      
                      // Touch long press
                      const timer = setTimeout(() => {
                        handleMessageLongPress(message.id)
                      }, 500)
                      
                      const handleTouchEnd = () => {
                        clearTimeout(timer)
                        document.removeEventListener('touchend', handleTouchEnd)
                      }
                      
                      document.addEventListener('touchend', handleTouchEnd)
                    }}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  
                  {/* Delete option overlay - only show for own messages */}
                  {showDeleteOption === message.id && message.sender_id === currentUserId && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleDeleteClick(message.id)}
                        className="flex items-center space-x-1 text-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={onSend} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${selectedPeer.name}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a team member from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Message</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
