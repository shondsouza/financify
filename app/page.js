'use client'

import { useState, useEffect } from 'react'
import { AuthForm } from '@/components/ui/auth-form'
import { DashboardHeader } from '@/components/ui/dashboard-header'
import AdminDashboard from '@/components/ui/admin-dashboard'
import TeamLeaderDashboard from '@/components/ui/team-leader-dashboard'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <AuthForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={currentUser} onLogout={handleLogout} />
      
      <main className="p-6">
        {currentUser.role === 'admin' ? (
          <AdminDashboard user={currentUser} />
        ) : (
          <TeamLeaderDashboard user={currentUser} />
        )}
      </main>
    </div>
  )
}