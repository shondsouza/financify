'use client'

import { useState, useEffect } from 'react'
import { dbOperations } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, Calendar, MapPin, Users, DollarSign, Clock, AlertTriangle, ThumbsUp, ThumbsDown, Play, Square, TrendingUp, BarChart3, PieChart, Activity, MessageSquare, RefreshCw, Settings, User, Bell, Mail, Phone, Save, Moon, Sun, Globe } from 'lucide-react'
import dynamic from 'next/dynamic'
import NotificationBanner from './notification-banner'
import ChatPage from '../../features/chat/simple/ChatPage'

// Dynamically import Recharts components to avoid SSR issues
const RechartsComponents = dynamic(() => import('recharts'), { 
  ssr: false,
  loading: () => <div className="h-[250px] flex items-center justify-center text-gray-500">Loading charts...</div>
})

// Mock TimeTrackingForm component for demo
const TimeTrackingForm = ({ assignment, onTimeUpdate, onClose }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Time Tracking - {assignment?.eventTitle}</h3>
    <p>Time tracking form would go here...</p>
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={() => onTimeUpdate(assignment)}>Save</Button>
    </div>
  </div>
)

// Chart wrapper component that handles dynamic imports
const ChartWrapper = ({ children, fallback }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Simulate loading time for dynamic import
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (hasError) {
    return fallback || <div className="h-[250px] flex items-center justify-center text-gray-500">Chart failed to load</div>
  }

  if (!isLoaded) {
    return <div className="h-[250px] flex items-center justify-center text-gray-500">Loading charts...</div>
  }

  try {
    return children
  } catch (error) {
    console.error('Chart rendering error:', error)
    setHasError(true)
    return fallback || <div className="h-[250px] flex items-center justify-center text-gray-500">Chart failed to load</div>
  }
}

// Individual chart components
const AreaChartComponent = ({ data }) => {
  const [components, setComponents] = useState(null)

  useEffect(() => {
    import('recharts').then((recharts) => {
      setComponents({
        ResponsiveContainer: recharts.ResponsiveContainer,
        AreaChart: recharts.AreaChart,
        Area: recharts.Area,
        XAxis: recharts.XAxis,
        YAxis: recharts.YAxis,
        CartesianGrid: recharts.CartesianGrid,
        Tooltip: recharts.Tooltip
      })
    })
  }, [])

  if (!components) {
    return <div className="h-[250px] flex items-center justify-center text-gray-500">Loading chart...</div>
  }

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = components

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name) => [
            name === 'earnings' ? `₹${value.toLocaleString()}` : `${value}h`,
            name === 'earnings' ? 'Earnings' : 'Hours'
          ]}
        />
        <Area 
          type="monotone" 
          dataKey="earnings" 
          stroke="#3b82f6" 
          strokeWidth={3}
          fill="url(#earningsGradient)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const PieChartComponent = ({ data }) => {
  const [components, setComponents] = useState(null)

  useEffect(() => {
    import('recharts').then((recharts) => {
      setComponents({
        ResponsiveContainer: recharts.ResponsiveContainer,
        PieChart: recharts.PieChart,
        Pie: recharts.Pie,
        Cell: recharts.Cell,
        Tooltip: recharts.Tooltip
      })
    })
  }, [])

  if (!components) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500">Loading chart...</div>
  }

  const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } = components

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={70}
          innerRadius={30}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value} assignments`, name]} />
      </PieChart>
    </ResponsiveContainer>
  )
}

const BarChartComponent = ({ data }) => {
  const [components, setComponents] = useState(null)

  useEffect(() => {
    import('recharts').then((recharts) => {
      setComponents({
        ResponsiveContainer: recharts.ResponsiveContainer,
        BarChart: recharts.BarChart,
        Bar: recharts.Bar,
        XAxis: recharts.XAxis,
        YAxis: recharts.YAxis,
        CartesianGrid: recharts.CartesianGrid,
        Tooltip: recharts.Tooltip
      })
    })
  }, [])

  if (!components) {
    return <div className="h-[250px] flex items-center justify-center text-gray-500">Loading chart...</div>
  }

  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = components

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name) => [
            name === 'earnings' ? `₹${value.toLocaleString()}` : `${value}h`,
            name === 'earnings' ? 'Total Earnings' : 'Hours Worked'
          ]}
        />
        <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const LineChartComponent = ({ data }) => {
  const [components, setComponents] = useState(null)

  useEffect(() => {
    import('recharts').then((recharts) => {
      setComponents({
        ResponsiveContainer: recharts.ResponsiveContainer,
        LineChart: recharts.LineChart,
        Line: recharts.Line,
        XAxis: recharts.XAxis,
        YAxis: recharts.YAxis,
        CartesianGrid: recharts.CartesianGrid,
        Tooltip: recharts.Tooltip
      })
    })
  }, [])

  if (!components) {
    return <div className="h-[250px] flex items-center justify-center text-gray-500">Loading chart...</div>
  }

  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } = components

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis yAxisId="earnings" orientation="left" stroke="#6b7280" />
        <YAxis yAxisId="hours" orientation="right" stroke="#6b7280" />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Line 
          yAxisId="earnings" 
          type="monotone" 
          dataKey="earnings" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
        />
        <Line 
          yAxisId="hours" 
          type="monotone" 
          dataKey="hours" 
          stroke="#f59e0b" 
          strokeWidth={3}
          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function TeamLeaderDashboard({ user: propUser }) {
  // Use the user from props (logged in user) instead of loading from database
  const [user, setUser] = useState(propUser || { id: null, name: 'Loading...' })
  
  // Update user when prop changes (user logs in/out)
  useEffect(() => {  
    if (propUser) {
      console.log('👤 TeamLeader Dashboard - Using logged in user:', propUser)
      setUser(propUser)
    }
  }, [propUser])
  
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  // Fetch events from API
  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const eventsData = await response.json()
        setEvents(eventsData || [])
      } else {
        console.error('Failed to fetch events:', response.statusText)
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  // Load events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Listen for event updates
  useEffect(() => {
    const handleEventUpdate = () => {
      fetchEvents()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('admin_events_updated', handleEventUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('admin_events_updated', handleEventUpdate)
      }
    }
  }, [])


  const [myAssignments, setMyAssignments] = useState([])

  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [responseData, setResponseData] = useState({
    available: null,
    staffCount: '',
    message: ''
  })
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showTimeTracking, setShowTimeTracking] = useState(false)
  const [activeTab, setActiveTab] = useState('available')

  // Profile and Preferences state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    earningsAlerts: true,
    theme: 'light',
    language: 'en'
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Load profile data when user is available
  useEffect(() => {
    if (user?.id) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
      
      // Load preferences from localStorage
      const savedPreferences = localStorage.getItem(`preferences_${user.id}`)
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences))
        } catch (e) {
          console.error('Failed to load preferences:', e)
        }
      }
    }
  }, [user])

  // Load team leader assignments from database
  const loadAssignments = async () => {
    if (!user?.id) {
      console.log('⚠️ Cannot load assignments - no user ID')
      return
    }

    try {
      setLoading(true)
      console.log('📋 Loading assignments for user ID:', user.id)
      const response = await fetch(`/api/team-leader-assignments/${user.id}`)
      console.log('Assignment response status:', response.status)
      if (response.ok) {
        const assignments = await response.json()
        console.log('Loaded assignments:', assignments)
        // Transform database assignments to match UI format
        const transformedAssignments = assignments.map(assignment => ({
          id: assignment.id,
          eventTitle: assignment.events?.title || 'Unknown Event',
          client: assignment.events?.client || 'Unknown Client',
          eventDate: assignment.events?.eventDate || assignment.assignedAt,
          location: assignment.events?.location || 'Unknown Location',
          staffAssigned: assignment.staffAssigned,
          assignedHours: assignment.assignedHours,
          actualHours: assignment.actualHours,
          status: assignment.status,
          totalWage: assignment.totalWage,
          commission: assignment.commission,
          entryTime: assignment.entryTime,
          exitTime: assignment.exitTime
        }))
        
        setMyAssignments(transformedAssignments)
        console.log('✅ Loaded', transformedAssignments.length, 'assignments')
      } else {
        const errorData = await response.json()
        console.error('Failed to load assignments:', errorData)
      }
    } catch (error) {
      console.error('Failed to load assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load user and assignments on component mount
  useEffect(() => {
    // User is loaded from props, just load assignments when user is available
    if (user?.id) {
      console.log('🔄 Loading assignments for user:', user.id)
      loadAssignments()
    }
  }, [user?.id])

  // Listen for navigation to settings from header dropdown
  useEffect(() => {
    const handleNavigateToSettings = () => {
      setActiveTab('settings')
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('navigate-to-settings', handleNavigateToSettings)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('navigate-to-settings', handleNavigateToSettings)
      }
    }
  }, [])

  // Set up event listeners for assignment updates
  useEffect(() => {
    const handleAssignmentUpdate = () => {
      console.log('Assignment update event received, user ID:', user.id)
      if (user.id) {
        loadAssignments()
      } else {
        console.log('User ID not available yet, will retry when user is loaded')
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('assignment_created', handleAssignmentUpdate)
      window.addEventListener('admin_events_updated', handleAssignmentUpdate)
      console.log('Event listeners set up for assignment updates')
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('assignment_created', handleAssignmentUpdate)
        window.removeEventListener('admin_events_updated', handleAssignmentUpdate)
      }
    }
  }, [user.id]) // Re-run when user.id changes

  // Load assignments when user is loaded
  useEffect(() => {
    if (user.id) {
      loadAssignments()
    }
  }, [user.id])

  const handleEventResponse = (event) => {
    setSelectedEvent(event)
    
    const existingResponse = event.responses?.find(r => r.teamLeaderId === user.id)
    if (existingResponse) {
      setResponseData({
        available: existingResponse.available,
        staffCount: existingResponse.staffCount.toString(),
        message: existingResponse.message || ''
      })
    } else {
      setResponseData({
        available: null,
        staffCount: '',
        message: ''
      })
    }
  }

  const submitResponse = async () => {
    if (responseData.available === null || !selectedEvent) return

    try {
      // Use the actual logged-in user instead of default user
      const teamLeaderUser = user;
      
      // First, save to database
      const responsePayload = {
        teamLeaderId: teamLeaderUser.id,
        available: !!responseData.available,
        staffCount: responseData.available ? parseInt(responseData.staffCount || '0', 10) : 0,
        message: responseData.message || ''
      }

      const response = await fetch(`/api/events/${selectedEvent.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsePayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save response')
      }

      const savedResponse = await response.json()

      // Then update local state with the saved response
      const normalized = {
        id: savedResponse.id,
        teamLeaderId: teamLeaderUser.id,
        teamLeader: { name: teamLeaderUser.name, email: teamLeaderUser.email },
        available: savedResponse.available,
        staffCount: savedResponse.staffCount,
        message: savedResponse.message || '',
        respondedAt: savedResponse.respondedAt || new Date().toISOString()
      }

      const updatedEvents = events.map(ev => {
        if (ev.id !== selectedEvent.id) return ev
        const existingResponses = Array.isArray(ev.responses) ? ev.responses : []
        const idx = existingResponses.findIndex(r => r.teamLeaderId === teamLeaderUser.id)
        if (idx >= 0) {
          const merged = { ...existingResponses[idx], ...normalized, id: savedResponse.id }
          const copy = [...existingResponses]
          copy[idx] = merged
          return { ...ev, responses: copy }
        }
        return { ...ev, responses: [...existingResponses, normalized] }
      })

      setEvents(updatedEvents)
      
      // Update localStorage for admin dashboard sync
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_events', JSON.stringify(updatedEvents))
          // Dispatch custom event to notify admin dashboard
          window.dispatchEvent(new CustomEvent('admin_events_updated'))
        }
      } catch (_) {}
      
      // Response submitted successfully - no popup needed
    } catch (error) {
      console.error('Failed to submit response:', error)
      // Error logged to console - no popup needed
    } finally {
      setSelectedEvent(null)
    }
  }

  const handleTimeTracking = (assignment) => {
    setSelectedAssignment(assignment)
    setShowTimeTracking(true)
  }

  const onTimeUpdate = (updatedAssignment) => {
    setMyAssignments(prev => 
      prev.map(assignment => 
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment
      )
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { variant: 'default', icon: Users, text: 'Assigned', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      in_progress: { variant: 'default', icon: Clock, text: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      completed: { variant: 'default', icon: CheckCircle, text: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
      paid: { variant: 'default', icon: DollarSign, text: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    }
    
    const config = statusConfig[status] || statusConfig.assigned
    const Icon = config.icon
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </div>
    )
  }

  const calculateWageBreakdown = (assignment) => {
    const basePay = 350
    const overtimeRate = 50
    const standardHours = 7
    const actualHours = assignment.actualHours || assignment.assignedHours || 7

    return {
      standardHours: Math.min(actualHours, standardHours),
      overtimeHours: Math.max(0, actualHours - standardHours),
      basePay: basePay,
      overtimePay: Math.max(0, (actualHours - standardHours) * overtimeRate),
      totalWage: assignment.totalWage || (basePay + Math.max(0, (actualHours - standardHours) * overtimeRate))
    }
  }

  const openEvents = events.filter(event => event.status === 'open')
  const myStats = {
    totalAssignments: myAssignments.length,
    completedAssignments: myAssignments.filter(a => a.status === 'completed' || a.status === 'paid').length,
    totalEarnings: myAssignments.reduce((sum, a) => sum + (parseFloat(a.totalWage) || 0) + (parseFloat(a.commission) || 0), 0),
    totalHours: myAssignments.reduce((sum, a) => sum + (parseFloat(a.actualHours) || parseFloat(a.assignedHours) || 0), 0)
  }

  // Chart data preparation
  const earningsChartData = myAssignments.map((assignment, index) => ({
    name: assignment.eventTitle.length > 15 ? assignment.eventTitle.substring(0, 15) + '...' : assignment.eventTitle,
    earnings: (parseFloat(assignment.totalWage) || 0) + (parseFloat(assignment.commission) || 0),
    hours: parseFloat(assignment.actualHours) || parseFloat(assignment.assignedHours) || 0,
    date: new Date(assignment.eventDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }))

  const statusDistribution = [
    { name: 'Completed', value: myAssignments.filter(a => a.status === 'completed').length, color: '#10b981' },
    { name: 'Paid', value: myAssignments.filter(a => a.status === 'paid').length, color: '#059669' },
    { name: 'Assigned', value: myAssignments.filter(a => a.status === 'assigned').length, color: '#3b82f6' }
  ].filter(item => item.value > 0)

  const monthlyEarnings = [
    { month: 'Jun', earnings: 2800, hours: 24 },
    { month: 'Jul', earnings: 3200, hours: 28 },
    { month: 'Aug', earnings: myStats.totalEarnings, hours: myStats.totalHours }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Notification Banner */}
      {activeTab !== 'settings' && <NotificationBanner events={events} />}
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header - Hide when on settings tab */}
        {activeTab !== 'settings' && (
          <>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Team Leader Dashboard
              </h1>
              <p className="text-lg text-gray-600">Welcome back, {user.name}! Here's your performance overview.</p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">My Assignments</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myStats.totalAssignments}</div>
              <p className="text-sm opacity-80">
                {myStats.completedAssignments} completed • {Math.round((myStats.completedAssignments / myStats.totalAssignments) * 100) || 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Earnings</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{myStats.totalEarnings.toLocaleString()}</div>
              <p className="text-sm opacity-80">
                ₹{myStats.totalHours > 0 ? Math.round(myStats.totalEarnings / myStats.totalHours) : 0}/hour average
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Hours Worked</CardTitle>
              <Clock className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myStats.totalHours.toFixed(1)}</div>
              <p className="text-sm opacity-80">
                {(myStats.totalHours - (myAssignments.length * 7)) > 0 ? `+${(myStats.totalHours - (myAssignments.length * 7)).toFixed(1)}h overtime` : 'No overtime'}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Available Events</CardTitle>
              <Calendar className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{openEvents.length}</div>
              <p className="text-sm opacity-80">
                {openEvents.filter(e => !e.responses?.find(r => r.teamLeaderId === user.id)).length} pending response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Monthly Performance Trend
              </CardTitle>
              <CardDescription>Your earnings and hours over the last 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartWrapper fallback={<div className="h-[250px] flex items-center justify-center text-gray-500">Chart loading...</div>}>
                <AreaChartComponent data={monthlyEarnings} />
              </ChartWrapper>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Assignment Status
              </CardTitle>
              <CardDescription>Distribution of your assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartWrapper fallback={<div className="h-[200px] flex items-center justify-center text-gray-500">Chart loading...</div>}>
                <PieChartComponent data={statusDistribution} />
              </ChartWrapper>
              <div className="mt-4 space-y-2">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
          </>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-white shadow-md">
            <TabsTrigger value="available" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Available Events
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              My Assignments
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Earnings & Analytics
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <span className="inline-flex items-center gap-2"><MessageSquare className="h-4 w-4"/> Chat</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <span className="inline-flex items-center gap-2"><Settings className="h-4 w-4"/> Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Available Events</h2>
                <p className="text-gray-600">Respond quickly to secure the best assignments</p>
              </div>
              <Alert className="lg:max-w-md border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Pro Tip:</strong> Early responses get priority assignment!
                </AlertDescription>
              </Alert>
            </div>

            <div className="grid gap-6">
              {eventsLoading ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-16 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Loading Events...</h3>
                    <p className="text-gray-600 text-lg">Fetching available assignments...</p>
                  </CardContent>
                </Card>
              ) : openEvents.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Events Available</h3>
                    <p className="text-gray-600 text-lg">Check back later for new exciting assignments!</p>
                  </CardContent>
                </Card>
              ) : (
                openEvents.map((event) => {
                  const userResponse = event.responses?.find(r => r.teamLeaderId === user.id)
                  
                  return (
                    <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <CardTitle className="text-2xl flex items-center gap-3">
                              {event.title}
                              {userResponse && (
                                <Badge 
                                  className={`${userResponse.available ? 
                                    'bg-green-100 text-green-800 border-green-200' : 
                                    'bg-red-100 text-red-800 border-red-200'} border`}
                                >
                                  {userResponse.available ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" />Available</>
                                  ) : (
                                    <><XCircle className="h-3 w-3 mr-1" />Not Available</>
                                  )}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-base">
                              <span className="font-medium">{event.client}</span> • {event.eventType}
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => handleEventResponse(event)}
                            className={`${userResponse ? 
                              'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300' : 
                              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
                            } transform hover:scale-105 transition-all duration-200`}
                            size="lg"
                          >
                            {userResponse ? 'Update Response' : 'Respond Now'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Date & Time</p>
                              <p className="text-sm text-gray-600">{formatDate(event.eventDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Location</p>
                              <p className="text-sm text-gray-600">{event.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Staff Needed</p>
                              <p className="text-sm text-gray-600">{event.staffNeeded} people</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Revenue</p>
                              <p className="text-sm text-gray-600">₹{event.expectedRevenue?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        {event.requirements && (
                          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg mb-4">
                            <p className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Special Requirements:
                            </p>
                            <p className="text-yellow-700">{event.requirements}</p>
                          </div>
                        )}

                        {userResponse && (
                          <div className="p-4 bg-white border-2 border-gray-100 rounded-lg shadow-sm">
                            <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Activity className="h-4 w-4 text-blue-600" />
                              Your Response:
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50">
                                {userResponse.available ? 
                                  <ThumbsUp className="h-4 w-4 text-green-600" /> : 
                                  <ThumbsDown className="h-4 w-4 text-red-600" />
                                }
                                <span className={userResponse.available ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                  {userResponse.available ? 'Available' : 'Not Available'}
                                </span>
                              </span>
                              {userResponse.available && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                                  {userResponse.staffCount} staff offered
                                </span>
                              )}
                            </div>
                            {userResponse.message && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700 italic">"{userResponse.message}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">My Current Assignments</h2>
                  <p className="text-gray-600">Track your assigned events and their status</p>
                </div>
                <Button
                  onClick={loadAssignments}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>

              {myAssignments.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-12 w-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                    <p className="text-gray-600 text-lg">Respond to available events to get assigned!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myAssignments.map((assignment) => (
                    <Card key={assignment.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">{assignment.eventTitle}</h3>
                            <p className="text-gray-600">{assignment.client}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(assignment.eventDate)} • {assignment.location}
                            </p>
                          </div>
                          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                            {getStatusBadge(assignment.status)}
                            {assignment.status === 'assigned' && (
                              <Button
                                size="sm"
                                onClick={() => handleTimeTracking(assignment)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105 transition-all duration-200"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Track Time
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Staff Assigned</p>
                            <p className="text-lg font-bold text-blue-900">{assignment.staffAssigned}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-800">Hours</p>
                            <p className="text-lg font-bold text-purple-900">
                              {assignment.actualHours || assignment.assignedHours}h
                            </p>
                            {assignment.actualHours > 7 && (
                              <p className="text-xs text-orange-600 font-medium">
                                +{(assignment.actualHours - 7).toFixed(1)}h OT
                              </p>
                            )}
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Earnings</p>
                            <p className="text-lg font-bold text-green-900">
                              ₹{assignment.totalWage?.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600">Base + OT</p>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <p className="text-sm font-medium text-orange-800">Time Log</p>
                            {assignment.entryTime && assignment.exitTime ? (
                              <div className="text-xs">
                                <div className="flex items-center gap-1 text-green-700">
                                  <Play className="h-3 w-3" />
                                  {new Date(assignment.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <div className="flex items-center gap-1 text-red-700">
                                  <Square className="h-3 w-3" />
                                  {new Date(assignment.exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-orange-900">Not logged</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Earnings & Analytics</h2>
                <p className="text-gray-600">Detailed breakdown of your earnings and performance metrics</p>
              </div>

              <Alert className="border-emerald-200 bg-emerald-50">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <strong>Wage Structure:</strong> ₹350 for standard 7-hour duty + ₹50 per hour for overtime
                </AlertDescription>
              </Alert>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Earnings by Event
                    </CardTitle>
                    <CardDescription>Compare your earnings across different assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartWrapper fallback={<div className="h-[250px] flex items-center justify-center text-gray-500">Chart loading...</div>}>
                      <BarChartComponent data={earningsChartData} />
                    </ChartWrapper>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      Hours vs Earnings Correlation
                    </CardTitle>
                    <CardDescription>See how your time investment translates to earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartWrapper fallback={<div className="h-[250px] flex items-center justify-center text-gray-500">Chart loading...</div>}>
                      <LineChartComponent data={earningsChartData} />
                    </ChartWrapper>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Earnings Table */}
              {myAssignments.length > 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Detailed Wage Breakdown</CardTitle>
                    <CardDescription>Complete breakdown of each assignment's earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Event Details</TableHead>
                            <TableHead className="font-semibold">Hours Breakdown</TableHead>
                            <TableHead className="font-semibold">Wage Calculation</TableHead>
                            <TableHead className="font-semibold">Commission</TableHead>
                            <TableHead className="font-semibold">Total Earned</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {myAssignments.map((assignment) => {
                            const breakdown = calculateWageBreakdown(assignment)
                            
                            return (
                              <TableRow key={assignment.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="font-medium text-gray-900">{assignment.eventTitle}</p>
                                    <p className="text-sm text-gray-600">{assignment.client}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(assignment.eventDate)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="text-sm">Standard: {breakdown.standardHours}h</span>
                                    </div>
                                    {breakdown.overtimeHours > 0 && (
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm text-orange-600">Overtime: {breakdown.overtimeHours}h</span>
                                      </div>
                                    )}
                                    <p className="text-sm font-medium text-gray-900">
                                      Total: {(breakdown.standardHours + breakdown.overtimeHours).toFixed(1)}h
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="text-sm">Base: ₹{breakdown.basePay}</p>
                                    {breakdown.overtimePay > 0 && (
                                      <p className="text-sm text-orange-600">OT: ₹{breakdown.overtimePay}</p>
                                    )}
                                    <p className="text-sm font-medium text-gray-900">
                                      Subtotal: ₹{breakdown.totalWage.toLocaleString()}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-green-600">
                                      ₹{assignment.commission?.toLocaleString() || '0'}
                                    </p>
                                    <p className="text-xs text-gray-500">Performance bonus</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-center">
                                    <p className="text-xl font-bold text-gray-900">
                                      ₹{(breakdown.totalWage + (parseFloat(assignment.commission) || 0)).toLocaleString()}
                                    </p>
                                    <div className="mt-1">
                                      {getStatusBadge(assignment.status)}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Enhanced Summary Section */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Performance Summary
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                          <p className="text-2xl font-bold text-gray-900">{myStats.totalHours.toFixed(1)}</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                          <p className="text-2xl font-bold text-gray-900">₹{myStats.totalEarnings.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Avg per Hour</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{myStats.totalHours > 0 ? (myStats.totalEarnings / myStats.totalHours).toFixed(0) : '0'}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="h-6 w-6 text-orange-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {myStats.totalAssignments > 0 ? Math.round((myStats.completedAssignments / myStats.totalAssignments) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="h-[calc(100vh-200px)]">
              <ChatPage currentUserId={user?.id} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Manage your profile and preferences</p>
            </div>

            {/* Profile Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {profileSuccess}
                    </AlertDescription>
                  </Alert>
                )}
                {profileError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="profile-name"
                      value={profileData.name}
                      onChange={(e) => {
                        setProfileData({ ...profileData, name: e.target.value })
                        setProfileError('')
                        setProfileSuccess('')
                      }}
                      className="h-11"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => {
                        setProfileData({ ...profileData, email: e.target.value })
                        setProfileError('')
                        setProfileSuccess('')
                      }}
                      className="h-11"
                      placeholder="your.email@example.com"
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="profile-phone" className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => {
                        setProfileData({ ...profileData, phone: e.target.value })
                        setProfileError('')
                        setProfileSuccess('')
                      }}
                      className="h-11"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={async () => {
                      setSavingProfile(true)
                      setProfileError('')
                      setProfileSuccess('')
                      
                      try {
                        const response = await fetch(`/api/users/${user.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            name: profileData.name,
                            phone: profileData.phone
                          })
                        })

                        if (!response.ok) {
                          const errorData = await response.json()
                          throw new Error(errorData.error || 'Failed to update profile')
                        }

                        const updatedUser = await response.json()
                        
                        // Update local user state
                        setUser({ ...user, ...updatedUser })
                        
                        // Update localStorage
                        localStorage.setItem('currentUser', JSON.stringify({ ...user, ...updatedUser }))
                        
                        setProfileSuccess('Profile updated successfully!')
                        setTimeout(() => setProfileSuccess(''), 3000)
                      } catch (error) {
                        console.error('Profile update error:', error)
                        setProfileError(error.message || 'Failed to update profile. Please try again.')
                      } finally {
                        setSavingProfile(false)
                      }
                    }}
                    disabled={savingProfile}
                    className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  Preferences
                </CardTitle>
                <CardDescription>Customize your notification and app preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-600" />
                    Notification Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => {
                          setPreferences({ ...preferences, emailNotifications: checked })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications" className="text-base font-medium cursor-pointer">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-gray-500">Receive browser push notifications</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => {
                          setPreferences({ ...preferences, pushNotifications: checked })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="event-reminders" className="text-base font-medium cursor-pointer">
                          Event Reminders
                        </Label>
                        <p className="text-sm text-gray-500">Get reminded about upcoming events</p>
                      </div>
                      <Switch
                        id="event-reminders"
                        checked={preferences.eventReminders}
                        onCheckedChange={(checked) => {
                          setPreferences({ ...preferences, eventReminders: checked })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="earnings-alerts" className="text-base font-medium cursor-pointer">
                          Earnings Alerts
                        </Label>
                        <p className="text-sm text-gray-500">Get notified about earnings updates</p>
                      </div>
                      <Switch
                        id="earnings-alerts"
                        checked={preferences.earningsAlerts}
                        onCheckedChange={(checked) => {
                          setPreferences({ ...preferences, earningsAlerts: checked })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Appearance Preferences */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-gray-600" />
                    Appearance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme" className="text-sm font-semibold flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Theme
                      </Label>
                      <select
                        id="theme"
                        value={preferences.theme}
                        onChange={(e) => {
                          setPreferences({ ...preferences, theme: e.target.value })
                        }}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-semibold flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Language
                      </Label>
                      <select
                        id="language"
                        value={preferences.language}
                        onChange={(e) => {
                          setPreferences({ ...preferences, language: e.target.value })
                        }}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="ta">Tamil</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={async () => {
                      setSavingPreferences(true)
                      try {
                        // Save preferences to localStorage
                        localStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences))
                        
                        // In a real app, you might want to save to database too
                        // await fetch(`/api/users/${user.id}/preferences`, { ... })
                        
                        setProfileSuccess('Preferences saved successfully!')
                        setTimeout(() => setProfileSuccess(''), 3000)
                      } catch (error) {
                        console.error('Preferences save error:', error)
                        setProfileError('Failed to save preferences. Please try again.')
                      } finally {
                        setSavingPreferences(false)
                      }
                    }}
                    disabled={savingPreferences}
                    className="px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {savingPreferences ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Response Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Respond to Event
              </DialogTitle>
              <DialogDescription className="text-base">
                <strong>{selectedEvent?.title}</strong> - Let the admin know your availability and staff capacity.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Event Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Client</p>
                      <p className="text-gray-900">{selectedEvent?.client}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{selectedEvent?.location}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date & Time</p>
                      <p className="text-gray-900">{formatDate(selectedEvent?.eventDate || '')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Staff Needed</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        {selectedEvent?.staffNeeded} people
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Are you available for this event? *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={responseData.available === true ? 'default' : 'outline'}
                      onClick={() => setResponseData({ ...responseData, available: true })}
                      className={`h-16 ${responseData.available === true ? 
                        'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 
                        'border-2 hover:border-green-300 hover:bg-green-50'
                      } transform hover:scale-105 transition-all duration-200`}
                    >
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <p className="font-semibold">Yes, Available</p>
                        <p className="text-xs opacity-80">Ready to work</p>
                      </div>
                    </Button>
                    <Button
                      variant={responseData.available === false ? 'destructive' : 'outline'}
                      onClick={() => setResponseData({ ...responseData, available: false })}
                      className={`h-16 ${responseData.available === false ? 
                        'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' : 
                        'border-2 hover:border-red-300 hover:bg-red-50'
                      } transform hover:scale-105 transition-all duration-200`}
                    >
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <p className="font-semibold">Not Available</p>
                        <p className="text-xs opacity-80">Cannot attend</p>
                      </div>
                    </Button>
                  </div>
                </div>

                {responseData.available === true && (
                  <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label htmlFor="staffCount" className="text-base font-medium text-green-800">
                      How many staff can you provide? *
                    </Label>
                    <Input
                      id="staffCount"
                      type="number"
                      value={responseData.staffCount}
                      onChange={(e) => setResponseData({ ...responseData, staffCount: e.target.value })}
                      placeholder="Number of staff members"
                      min="0"
                      max={selectedEvent?.staffNeeded}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                    <p className="text-sm text-green-700">
                      Maximum needed: {selectedEvent?.staffNeeded} staff members
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-base font-medium">Additional Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={responseData.message}
                    onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                    placeholder="Any additional information, constraints, or questions..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedEvent(null)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitResponse}
                  disabled={responseData.available === null}
                  className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Submit Response
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Time Tracking Dialog */}
        <Dialog open={showTimeTracking} onOpenChange={setShowTimeTracking}>
          <DialogContent className="max-w-4xl">
            <TimeTrackingForm
              assignment={selectedAssignment}
              onTimeUpdate={onTimeUpdate}
              onClose={() => setShowTimeTracking(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}