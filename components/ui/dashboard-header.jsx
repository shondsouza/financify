'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { 
  LogOut, 
  User, 
  Settings, 
  Bell,
  Search,
  Menu,
  Zap,
  Shield,
  Crown
} from 'lucide-react'
import { useState, useEffect } from 'react'

export function DashboardHeader({ user, onLogout, onMenuToggle, notifications = 0 }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const adminAvatarUrl = '/avatar/Admin.png'
  const tlAvatarUrl = '/avatar/person.png'

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Crown className="h-3 w-3" />
      case 'team_leader': return <Shield className="h-3 w-3" />
      default: return <User className="h-3 w-3" />
    }
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-purple-600'
      case 'team_leader': return 'bg-gradient-to-r from-blue-500 to-blue-600'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    })
  }

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/60 backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-4">
            {onMenuToggle && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMenuToggle}
                className="lg:hidden hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <img src="/logo/logo.png" alt="Financify Logo" className="w-20 h-20 object-contain" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Financify
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className={`${getRoleBadgeColor(user?.role)} text-white text-xs px-2 py-0.5 flex items-center space-x-1`}
                  >
                    {getRoleIcon(user?.role)}
                    <span className="capitalize">
                      {user?.role === 'admin' ? 'Administrator' : 'Team Leader'} 
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Center Section - Time & Date (Hidden on mobile) */}
          <div className="hidden md:flex flex-col items-center text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Right Section - Actions & Profile */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex hover:bg-gray-100 text-gray-600"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-gray-100 text-gray-600"
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </Button>
            </div>

            {/* User Info & Avatar */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <div className="flex items-center justify-end space-x-1">
                  {getRoleIcon(user?.role)}
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full hover:ring-2 hover:ring-blue-200 transition-all duration-200">
                    <Avatar className="h-11 w-11 ring-2 ring-white shadow-md">
                      {user?.role === 'admin' ? (
                        <AvatarImage src={adminAvatarUrl} alt="Admin Avatar" />
                      ) : (
                        <AvatarImage src={tlAvatarUrl} alt="Team Leader Avatar" />
                      )}
                      <AvatarFallback className={`${getRoleBadgeColor(user?.role)} text-white font-semibold text-sm`}>
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status indicator */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`${getRoleBadgeColor(user?.role)} text-white`}>
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-gray-50 p-3"
                    onClick={() => {
                      // Dispatch custom event to navigate to settings tab
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('navigate-to-settings'))
                      }
                    }}
                  >
                    <User className="mr-3 h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Profile Settings</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-gray-50 p-3"
                    onClick={() => {
                      // Dispatch custom event to navigate to settings tab
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('navigate-to-settings'))
                      }
                    }}
                  >
                    <Settings className="mr-3 h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Preferences</p>
                      <p className="text-xs text-gray-500">App settings & themes</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 hover:bg-red-50 p-3 focus:bg-red-50 focus:text-red-600"
                    onClick={onLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <div>
                      <p className="font-medium">Sign out</p>
                      <p className="text-xs text-red-500">End your session</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Time Display */}
      <div className="md:hidden px-6 pb-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatDate(currentTime)}</span>
          <span className="font-medium">{formatTime(currentTime)}</span>
        </div>
      </div>
    </header>
  )
}