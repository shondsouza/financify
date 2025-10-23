'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { dbOperations } from '@/lib/supabase'

export function AuthForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get user by email
      const { data: user, error } = await dbOperations.getUserByEmail(email)
      
      if (error || !user) {
        setError('Invalid email or password. Please check your credentials.')
        setLoading(false)
        return
      }

      // Check if user is active
      if (!user.isActive) {
        setError('Your account has been deactivated. Please contact administrator.')
        setLoading(false)
        return
      }

      // Verify password (in production, use proper password hashing comparison)
      // For demo purposes, we accept any password for demo accounts or check stored password
      const isDemoAccount = ['admin@company.com', 'john@company.com', 'sarah@company.com', 'mike@company.com'].includes(email.toLowerCase())
      const isPasswordValid = isDemoAccount || (user.password && password === user.password)
      
      if (!isPasswordValid) {
        setError('Invalid email or password. Please check your credentials.')
        setLoading(false)
        return
      }

      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user))
      onLogin(user)
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Finance Tracker</CardTitle>
          <CardDescription className="text-center">
            Sign in to your workforce management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded">
              <p className="font-medium">Demo Accounts:</p>
              <p>Admin: admin@company.com</p>
              <p>Team Leader: john@company.com</p>
              <p>Password: (any text)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}