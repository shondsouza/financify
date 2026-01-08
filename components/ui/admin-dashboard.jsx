'use client'

import { useState, useEffect } from 'react'
import { dbOperations } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, Calendar, Users, DollarSign, Clock, CheckCircle, XCircle, 
  AlertTriangle, TrendingUp, MapPin, Building, Star, Eye,
  Filter, Download, RefreshCw, BarChart3, PieChart, Search,
  Zap, Target, Award, Activity, Play, Square, Menu, X,
  Home, Settings, Bell, ChevronRight, ArrowUp, ArrowDown, MessageSquare,
  User, Mail, Phone, Save, Moon, Sun, Globe
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import NotificationBanner from './notification-banner'
import TimeManagementDashboard from './time-management-dashboard'
import { generateProfessionalWageSlip } from '@/utils/pdfWageSlipGenerator'
import { generateSimpleWageSlip } from '@/utils/simplePdfGenerator'
import { generateMonthlyReport } from '@/utils/pdfMonthlyReportGenerator'
import ChatPage from '../../chat/simple/ChatPage'
import UserManagement from './user-management'

export default function AdminDashboard() {
  // Get user from localStorage or use default admin user
  const [user, setUser] = useState(null)
  
  // Load user from localStorage on component mount
  useEffect(() => {
    try {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setProfileData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || ''
        })
      } else {
        // Fallback to default admin user if not logged in
        const defaultUser = { id: 'admin-1', name: 'System Admin', email: 'admin@company.com', role: 'admin' }
        setUser(defaultUser)
        setProfileData({
          name: defaultUser.name || '',
          email: defaultUser.email || '',
          phone: defaultUser.phone || ''
        })
      }
    } catch (err) {
      console.warn('Failed to load user from localStorage:', err)
      // Fallback to default admin user
      const defaultUser = { id: 'admin-1', name: 'System Admin', email: 'admin@company.com', role: 'admin' }
      setUser(defaultUser)
      setProfileData({
        name: defaultUser.name || '',
        email: defaultUser.email || '',
        phone: defaultUser.phone || ''
      })
    }
  }, [])

  // Load preferences from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedPreferences = localStorage.getItem(`preferences_${user.id}`)
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences))
        } catch (e) {
          console.error('Failed to load preferences:', e)
        }
      }
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

  const [stats, setStats] = useState({
    totalEvents: 24,
    openEvents: 8,
    totalRevenue: 480000,
    totalWages: 168000,
    totalHours: 672,
    activeAssignments: 12,
    activeTeamLeaders: 15,
    completionRate: 94
  })
  
  const [events, setEvents] = useState([])
  const [fetching, setFetching] = useState(true)

  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventResponses, setEventResponses] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [wageSettings, setWageSettings] = useState({ basePay: 350, standardHours: 7, overtimeRate: 50 })
  const [savingWage, setSavingWage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teamLeaderPerformance, setTeamLeaderPerformance] = useState([])
  const [loadingPerformance, setLoadingPerformance] = useState(false)

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

  // Form state with validation
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    eventType: '',
    eventDate: '',
    location: '',
    staffNeeded: '',
    expectedRevenue: '',
    budgetAllocated: '',
    requirements: ''
  })

  const [formErrors, setFormErrors] = useState({})

  // Fetch from Supabase
  const refetchEvents = async () => {
    setFetching(true)
    const { data, error } = await dbOperations.getEvents()
    if (error) {
      console.error('Failed to fetch events:', error)
    } else {
      const eventsData = data || []
      setEvents(eventsData)
      
      // Save to localStorage for team leader dashboard sync
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_events', JSON.stringify(eventsData))
        }
      } catch (err) {
        console.warn('Failed to save events to localStorage:', err)
      }
    }
    setFetching(false)
  }
  useEffect(() => {
    refetchEvents()
    // Load wage settings
    ;(async () => {
      try {
        const res = await fetch('/api/wage-settings', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          if (data) setWageSettings({
            basePay: parseFloat(data.basePay) || 350,
            standardHours: parseFloat(data.standardHours) || 7,
            overtimeRate: parseFloat(data.overtimeRate) || 50
          })
        }
      } catch (e) {
        console.warn('Failed to load wage settings', e)
      }
    })()
    
    // Load team leader performance data
    fetchTeamLeaderPerformance()
    
    const vis = () => { if (document.visibilityState === 'visible') refetchEvents() }
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])

  // Reload performance when events change (assignments might have been created/updated)
  useEffect(() => {
    if (events.length > 0) {
      // Add a small delay to ensure assignments are also updated
      const timer = setTimeout(() => {
        fetchTeamLeaderPerformance()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [events.length])

  // Mock chart data
  const revenueData = [
    { month: 'Jan', revenue: 320000, expenses: 180000 },
    { month: 'Feb', revenue: 420000, expenses: 220000 },
    { month: 'Mar', revenue: 480000, expenses: 250000 },
    { month: 'Apr', revenue: 380000, expenses: 190000 },
    { month: 'May', revenue: 520000, expenses: 270000 },
    { month: 'Jun', revenue: 600000, expenses: 310000 }
    ]

  const eventTypeData = [
    { name: 'Corporate Events', value: 35, color: '#3B82F6' },
    { name: 'Weddings', value: 28, color: '#10B981' },
    { name: 'Hotel Services', value: 22, color: '#F59E0B' },
    { name: 'Conferences', value: 15, color: '#8B5CF6' }
  ]

  const staffUtilizationData = [
    { date: '2024-03-01', utilization: 85 },
    { date: '2024-03-02', utilization: 92 },
    { date: '2024-03-03', utilization: 78 },
    { date: '2024-03-04', utilization: 95 },
    { date: '2024-03-05', utilization: 88 },
    { date: '2024-03-06', utilization: 91 },
    { date: '2024-03-07', utilization: 87 }
  ]

  // Fetch real team leader performance data (overall/all-time)
  const fetchTeamLeaderPerformance = async () => {
    setLoadingPerformance(true)
    try {
      // Fetch all team leaders
      const { data: allUsers, error: usersError } = await dbOperations.getUsers()
      if (usersError || !allUsers) {
        console.warn('No users found:', usersError)
        setTeamLeaderPerformance([])
        return
      }

      const teamLeaders = allUsers.filter(user => user.role === 'team_leader' && user.isActive)
      if (teamLeaders.length === 0) {
        console.warn('No active team leaders found')
        setTeamLeaderPerformance([])
        return
      }

      // Fetch performance data for each team leader
      const performanceData = await Promise.all(
        teamLeaders.map(async (leader) => {
          try {
            // Fetch all assignments (overall performance, not just this month)
            const { data: assignments, error: assignmentsError } = await dbOperations.getTeamLeaderAssignments(leader.id)
            
            if (assignmentsError || !assignments) {
              console.warn(`Failed to fetch assignments for ${leader.name}:`, assignmentsError)
              return null
            }

            // Use all assignments for overall performance
            if (assignments.length === 0) {
              return null // Skip team leaders with no assignments
            }

            // Calculate metrics based on all assignments
            const completedAssignments = assignments.filter(a => 
              a.status === 'completed' || a.status === 'paid'
            )
            
            const totalEarnings = assignments.reduce((sum, a) => {
              return sum + (parseFloat(a.totalWage) || 0) + (parseFloat(a.commission) || 0)
            }, 0)

            const completionRate = assignments.length > 0 
              ? (completedAssignments.length / assignments.length) * 100 
              : 0

            // Calculate rating based on completion rate (0-5 scale)
            // 100% = 5.0, 80% = 4.5, 60% = 4.0, 40% = 3.5, 20% = 3.0, 0% = 2.5
            const rating = Math.max(2.5, Math.min(5.0, 2.5 + (completionRate / 100) * 2.5))

            return {
              id: leader.id,
              name: leader.name,
              events: assignments.length,
              rating: Math.round(rating * 10) / 10, // Round to 1 decimal
              earnings: totalEarnings,
              completed: completedAssignments.length,
              completionRate: Math.round(completionRate)
            }
          } catch (error) {
            console.error(`Error calculating performance for ${leader.name}:`, error)
            return null
          }
        })
      )

      // Filter out null values and sort by earnings (descending), then by completion rate
      const validPerformance = performanceData
        .filter(p => p !== null)
        .sort((a, b) => {
          // Primary sort: earnings
          if (b.earnings !== a.earnings) {
            return b.earnings - a.earnings
          }
          // Secondary sort: completion rate
          return b.completionRate - a.completionRate
        })
        .slice(0, 5) // Top 5 performers

      setTeamLeaderPerformance(validPerformance)
    } catch (error) {
      console.error('Error fetching team leader performance:', error)
      setTeamLeaderPerformance([])
    } finally {
      setLoadingPerformance(false)
    }
  }

  // Form validation
  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Event title is required'
    if (!formData.client.trim()) errors.client = 'Client name is required'
    if (!formData.eventType) errors.eventType = 'Event type is required'
    if (!formData.eventDate) errors.eventDate = 'Event date is required'
    if (!formData.location.trim()) errors.location = 'Location is required'
    if (!formData.staffNeeded || formData.staffNeeded < 1) errors.staffNeeded = 'Valid staff count is required'
    
    // Date validation - must be future date
    if (formData.eventDate && new Date(formData.eventDate) <= new Date()) {
      errors.eventDate = 'Event date must be in the future'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Ensure admin user exists before creating event
      const { data: adminUser, error: adminError } = await dbOperations.ensureAdminUser()
      if (adminError) {
        console.error('Failed to ensure admin user:', adminError)
        console.error('Failed to create event:', adminError.message || 'Admin user setup failed')
        return
      }

      console.log('Creating event with payload:', formData)
      const payload = {
        title: formData.title.trim(),
        client: formData.client.trim(),
        eventType: formData.eventType,
        eventDate: new Date(formData.eventDate).toISOString(),
        location: formData.location.trim(),
        staffNeeded: parseInt(formData.staffNeeded, 10),
        expectedRevenue: formData.expectedRevenue ? parseInt(formData.expectedRevenue, 10) : null,
        budgetAllocated: formData.budgetAllocated ? parseInt(formData.budgetAllocated, 10) : null,
        requirements: formData.requirements.trim(),
        status: 'open',
        createdBy: adminUser?.id || 'admin-1'
      }
      console.log('Calling dbOperations.createEvent with:', payload)
      const { data, error } = await dbOperations.createEvent(payload)
      console.log('Create event result:', { data, error })
      if (error) {
        console.error('Failed to create event:', error)
        console.error('Failed to create event:', error.message || 'Unknown error')
      } else {
        const updatedEvents = [data, ...events]
        setEvents(updatedEvents)
        setShowCreateForm(false)
        resetForm()
        // Update stats optimistically
        setStats(prev => ({ ...prev, totalEvents: prev.totalEvents + 1, openEvents: prev.openEvents + 1 }))
        
        // Save to localStorage for team leader dashboard sync
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_events', JSON.stringify(updatedEvents))
            // Dispatch custom event to notify team leader dashboard
            window.dispatchEvent(new CustomEvent('admin_events_updated'))
          }
        } catch (err) {
          console.warn('Failed to save events to localStorage:', err)
        }
        
        // Event created successfully - no popup needed
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
      setFormData({
        title: '',
        client: '',
        eventType: '',
        eventDate: '',
        location: '',
        staffNeeded: '',
        expectedRevenue: '',
        budgetAllocated: '',
        requirements: ''
      })
    setFormErrors({})
  }

  const loadEventResponses = (event) => {
    setSelectedEvent(event)
    setEventResponses(event.responses || [])
  }

  const createAssignment = async (eventId, teamLeaderId, staffCount) => {
    try {
      // Create assignment in database
      const assignmentData = {
        eventId: eventId,
        teamLeaderId: teamLeaderId,
        staffAssigned: parseInt(staffCount),
        assignedHours: 7.0, // Default 7 hours
        commission: 0
      }

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create assignment')
      }

      // Update local state
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, status: 'assigned' }
          : event
      )
      setEvents(updatedEvents)
      setSelectedEvent(null)
      
      // Save to localStorage for team leader dashboard sync
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_events', JSON.stringify(updatedEvents))
          // Dispatch custom event to notify team leader dashboard
          window.dispatchEvent(new CustomEvent('admin_events_updated'))
          window.dispatchEvent(new CustomEvent('assignment_created'))
        }
      } catch (err) {
        console.warn('Failed to save events to localStorage:', err)
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        openEvents: prev.openEvents - 1,
        activeAssignments: prev.activeAssignments + 1
      }))
    } catch (error) {
      console.error('Failed to create assignment:', error)
    }
  }

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    
    try {
      const { error } = await dbOperations.deleteEvent(eventId)
      if (error) {
        console.error('Failed to delete event:', error)
        alert('Failed to delete event. Please try again.')
        return
      }

      // Remove event from local state
      const updatedEvents = events.filter(event => event.id !== eventId)
      setEvents(updatedEvents)
      
      // Update stats
      const deletedEvent = events.find(event => event.id === eventId)
      if (deletedEvent) {
        setStats(prev => ({
          ...prev,
          totalEvents: prev.totalEvents - 1,
          openEvents: deletedEvent.status === 'open' ? prev.openEvents - 1 : prev.openEvents,
          activeAssignments: deletedEvent.status === 'assigned' ? prev.activeAssignments - 1 : prev.activeAssignments
        }))
      }
      
      // Save to localStorage for team leader dashboard sync
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_events', JSON.stringify(updatedEvents))
          // Dispatch custom event to notify team leader dashboard
          window.dispatchEvent(new CustomEvent('admin_events_updated'))
        }
      } catch (err) {
        console.warn('Failed to save events to localStorage:', err)
      }
      
      alert('Event deleted successfully!')
    } catch (err) {
      console.error('Error deleting event:', err)
      alert('An error occurred while deleting the event.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'outline', icon: Clock, text: 'Open', className: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100' },
      assigned: { variant: 'default', icon: Users, text: 'Assigned', className: 'text-green-700 bg-green-100 border-green-200 hover:bg-green-200' },
      completed: { variant: 'default', icon: CheckCircle, text: 'Completed', className: 'text-purple-700 bg-purple-100 border-purple-200 hover:bg-purple-200' },
      cancelled: { variant: 'destructive', icon: XCircle, text: 'Cancelled', className: 'text-red-700 bg-red-100 border-red-200 hover:bg-red-200' }
    }
    
    const config = statusConfig[status] || statusConfig.open
    const Icon = config.icon
    
    return (
      <Badge className={`${config.className} flex items-center gap-1 font-medium px-3 py-1 transition-colors`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Close sidebar on mobile when clicking outside and listen for resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Notification Banner - Hide when on settings tab */}
      {activeTab !== 'settings' && <NotificationBanner events={events} />}
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform">
            <SidebarContent setSidebarOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl">
            {/* Welcome Section - Hide when on settings tab */}
            {activeTab !== 'settings' && (
              <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                  <p className="text-blue-100 text-base lg:text-lg">Here's what's happening with your workforce today.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button 
                    onClick={() => setShowCreateForm(true)} 
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg transition-all hover:shadow-xl"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Event
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/30 text-white bg-white/10 hover:bg-white hover:text-blue-600 transition-all backdrop-blur-sm"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              <StatCard
                title="Total Events"
                value={stats.totalEvents}
                subtitle={`${stats.openEvents} open`}
                icon={Calendar}
                color="blue"
                progress={(stats.openEvents / stats.totalEvents) * 100}
              />
              <StatCard
                title="Expected Revenue"
                value={`₹${stats.totalRevenue?.toLocaleString('en-IN')}`}
                subtitle="Total projected income"
                icon={TrendingUp}
                color="green"
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Total Wages"
                value={`₹${stats.totalWages?.toLocaleString('en-IN')}`}
                subtitle={`${stats.activeAssignments} active assignments`}
                icon={Users}
                color="purple"
              />
              <StatCard
                title="Total Hours"
                value={stats.totalHours}
                subtitle="Hours worked this period"
                icon={Clock}
                color="orange"
              />
            </div>
              </>
            )}

            {/* Main Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="hidden">
                <TabsList className="bg-white shadow-sm border rounded-lg p-1 h-12">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="user-management">Team Leaders</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-6">
                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Revenue vs Expenses
                      </CardTitle>
                      <CardDescription>Monthly comparison of revenue and operational costs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-green-600" />
                        Event Distribution
                      </CardTitle>
                      <CardDescription>Breakdown by event type this quarter</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={eventTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                            labelLine={false}
                          >
                            {eventTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        Staff Utilization
                      </CardTitle>
                      <CardDescription>Daily staff utilization percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={staffUtilizationData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Utilization']}
                            labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="utilization" 
                            stroke="#8B5CF6" 
                            fill="#8B5CF6" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-orange-600" />
                        Team Leader Performance
                      </CardTitle>
                      <CardDescription>Top performing team leaders (overall performance)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingPerformance ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading performance data...</p>
                          </div>
                        </div>
                      ) : teamLeaderPerformance.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No team leader performance data available.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {teamLeaderPerformance.map((leader, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {leader.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{leader.name}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>{leader.events} events</span>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                                    {leader.rating}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">₹{leader.earnings.toLocaleString('en-IN')}</p>
                              <p className="text-xs text-gray-500">Total earnings</p>
                            </div>
                          </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-16 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={() => setShowCreateForm(true)}
                      >
                        <Plus className="h-5 w-5" />
                        New Event
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex-col gap-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={() => setActiveTab('assignments')}
                      >
                        <Users className="h-5 w-5" />
                        Manage Staff
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        onClick={async () => {
                          // Generate sample monthly report data
                          const monthData = {
                            monthYear: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }),
                            totalEvents: stats.totalEvents,
                            totalRevenue: stats.totalRevenue,
                            totalWages: stats.totalWages,
                            events: events.slice(0, 5).map(event => ({
                              title: event.title,
                              client: event.client,
                              eventDate: event.eventDate,
                              staffCount: event.staffNeeded,
                              revenue: event.expectedRevenue || 0,
                              wages: event.staffNeeded * 350 // Sample calculation
                            })),
                            teamLeaders: [
                              { name: 'John Smith', eventsAssigned: 5, totalHours: 35, totalEarnings: 1750, avgRating: 4.8, efficiency: 'Excellent' },
                              { name: 'Sarah Johnson', eventsAssigned: 3, totalHours: 21, totalEarnings: 1050, avgRating: 4.6, efficiency: 'Good' }
                            ]
                          }
                          await generateMonthlyReport(monthData)
                        }}
                      >
                        <BarChart3 className="h-5 w-5" />
                        Monthly Report
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-16 flex-col gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                {/* Search and Filter */}
                <Card className="shadow-lg border-0">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                      <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search events, clients, or locations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      </div>
                      <div className="flex items-center space-x-3 w-full lg:w-auto">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-full lg:w-40 h-11">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" className="h-11 w-11 flex-shrink-0">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Export data</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Events List */}
                <div className="grid gap-6">
                  {filteredEvents.length === 0 ? (
                    <Card className="shadow-lg border-0">
                      <CardContent className="pt-12 pb-12 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No events found</p>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onViewResponses={loadEventResponses}
                        onDelete={deleteEvent}
                        formatDate={formatDate}
                        getStatusBadge={getStatusBadge}
                        loading={loading}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="assignments">
                <AssignmentsTab 
                  events={events}
                  formatDate={formatDate}
                />
              </TabsContent>

              <TabsContent value="user-management">
                <div className="h-[calc(100vh-200px)] overflow-y-auto">
                  <UserManagement />
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <div className="h-[calc(100vh-200px)]">
                  <ChatPage currentUserId={(user && user.id) || 'admin-1'} />
                </div>
              </TabsContent>

              <TabsContent value="time-management">
                <TimeManagementDashboard />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
                  <p className="text-gray-600">Manage your profile, preferences, and system settings</p>
                </div>

                {/* Profile Settings */}
                <Card className="shadow-lg border-0">
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
                        <Label htmlFor="admin-profile-name" className="text-sm font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="admin-profile-name"
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
                        <Label htmlFor="admin-profile-email" className="text-sm font-semibold flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="admin-profile-email"
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
                        <Label htmlFor="admin-profile-phone" className="text-sm font-semibold flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="admin-profile-phone"
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
                            const response = await fetch(`/api/users/${user?.id}`, {
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
                <Card className="shadow-lg border-0">
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
                            <Label htmlFor="admin-email-notifications" className="text-base font-medium cursor-pointer">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <Switch
                            id="admin-email-notifications"
                            checked={preferences.emailNotifications}
                            onCheckedChange={(checked) => {
                              setPreferences({ ...preferences, emailNotifications: checked })
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-0.5">
                            <Label htmlFor="admin-push-notifications" className="text-base font-medium cursor-pointer">
                              Push Notifications
                            </Label>
                            <p className="text-sm text-gray-500">Receive browser push notifications</p>
                          </div>
                          <Switch
                            id="admin-push-notifications"
                            checked={preferences.pushNotifications}
                            onCheckedChange={(checked) => {
                              setPreferences({ ...preferences, pushNotifications: checked })
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-0.5">
                            <Label htmlFor="admin-event-reminders" className="text-base font-medium cursor-pointer">
                              Event Reminders
                            </Label>
                            <p className="text-sm text-gray-500">Get reminded about upcoming events</p>
                          </div>
                          <Switch
                            id="admin-event-reminders"
                            checked={preferences.eventReminders}
                            onCheckedChange={(checked) => {
                              setPreferences({ ...preferences, eventReminders: checked })
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-0.5">
                            <Label htmlFor="admin-earnings-alerts" className="text-base font-medium cursor-pointer">
                              Earnings Alerts
                            </Label>
                            <p className="text-sm text-gray-500">Get notified about earnings updates</p>
                          </div>
                          <Switch
                            id="admin-earnings-alerts"
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
                          <Label htmlFor="admin-theme" className="text-sm font-semibold flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Theme
                          </Label>
                          <select
                            id="admin-theme"
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
                          <Label htmlFor="admin-language" className="text-sm font-semibold flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Language
                          </Label>
                          <select
                            id="admin-language"
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
                            localStorage.setItem(`preferences_${user?.id}`, JSON.stringify(preferences))
                            
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

                {/* Wage Settings */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-700" />
                      Wage Settings
                    </CardTitle>
                    <CardDescription>Set base pay, standard hours, and overtime rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="basePay" className="text-sm font-semibold">Base Pay (₹)</Label>
                        <Input id="basePay" type="number" min="0" step="0.01"
                          value={wageSettings.basePay}
                          onChange={(e) => setWageSettings({ ...wageSettings, basePay: e.target.value })}
                          className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="standardHours" className="text-sm font-semibold">Standard Hours</Label>
                        <Input id="standardHours" type="number" min="0" step="0.25"
                          value={wageSettings.standardHours}
                          onChange={(e) => setWageSettings({ ...wageSettings, standardHours: e.target.value })}
                          className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="overtimeRate" className="text-sm font-semibold">Overtime Rate (₹/hr)</Label>
                        <Input id="overtimeRate" type="number" min="0" step="0.01"
                          value={wageSettings.overtimeRate}
                          onChange={(e) => setWageSettings({ ...wageSettings, overtimeRate: e.target.value })}
                          className="h-12" />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={async () => {
                          setSavingWage(true)
                          try {
                            await fetch('/api/wage-settings', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                basePay: parseFloat(wageSettings.basePay),
                                standardHours: parseFloat(wageSettings.standardHours),
                                overtimeRate: parseFloat(wageSettings.overtimeRate)
                              })
                            })
                          } finally {
                            setSavingWage(false)
                          }
                        }}
                        className="px-8"
                        disabled={savingWage}
                      >
                        {savingWage ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Settings'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    These settings are applied to new and updated assignments. Existing records keep their stored values until updated.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog 
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        onSubmit={handleCreateEvent}
        loading={loading}
        onReset={resetForm}
      />

      {/* Event Responses Dialog */}
      <EventResponsesDialog
        selectedEvent={selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
        eventResponses={eventResponses}
        onCreateAssignment={createAssignment}
        formatDate={formatDate}
      />
    </div>
  )
}

// Sidebar Component
function SidebarContent({ setSidebarOpen, activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'time-management', label: 'Time Management', icon: Clock },
    { id: 'user-management', label: 'Team Leaders', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ]

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-2">
          <img src="/logo/logo.png" alt="Financify Logo" className="w-16 h-16 object-contain" />
          <span className="font-bold text-xl">Financify</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="lg:hidden"
          onClick={() => setSidebarOpen?.(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen?.(false)
              }}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
            <AvatarImage src="/avatar/Admin.png" alt="Admin" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">A</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">Admin User</p>
            <p className="text-xs text-gray-600">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, color, progress, trend }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-800 bg-blue-500',
    green: 'from-green-50 to-green-100 text-green-800 bg-green-500',
    purple: 'from-purple-50 to-purple-100 text-purple-800 bg-purple-500',
    orange: 'from-orange-50 to-orange-100 text-orange-800 bg-orange-500'
  }

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} cursor-pointer`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className={`text-sm font-medium ${colorClasses[color].split(' ')[2]}`}>
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color].split(' ')[3]} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl lg:text-3xl font-bold mb-1 ${colorClasses[color].split(' ')[2].replace('800', '900')}`}>
          {value}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${colorClasses[color].split(' ')[2].replace('800', '700')}`}>
            {subtitle}
          </span>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {trend.value}%
            </div>
          )}
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-3 h-2" />
        )}
      </CardContent>
    </Card>
  )
}

// Event Card Component
function EventCard({ event, onViewResponses, onDelete, formatDate, getStatusBadge, loading }) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-xl group-hover:text-blue-600 transition-colors">
              <span className="break-words">{event.title}</span>
              {getStatusBadge(event.status)}
            </CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-base">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{event.client}</span>
              </span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="capitalize font-medium text-blue-600">{event.eventType}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewResponses(event)}
              disabled={event.status !== 'open'}
              className="hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Responses</span>
              <span className="sm:hidden">({event.responses?.length || 0})</span>
              <span className="hidden sm:inline ml-1">({event.responses?.length || 0})</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(event.id)}
              disabled={loading || event.status === 'completed'}
              className="hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0 group-hover:bg-blue-200 transition-colors">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date & Time</p>
              <p className="font-semibold text-gray-900 text-sm break-words">{formatDate(event.eventDate)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0 group-hover:bg-green-200 transition-colors">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
              <p className="font-semibold text-gray-900 text-sm break-words">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0 group-hover:bg-purple-200 transition-colors">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Staff Needed</p>
              <p className="font-semibold text-gray-900 text-sm">{event.staffNeeded} people</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0 group-hover:bg-orange-200 transition-colors">
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Revenue</p>
              <p className="font-semibold text-gray-900 text-sm">₹{event.expectedRevenue?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        {event.requirements && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg group-hover:bg-yellow-100 transition-colors">
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0 fill-current" />
              <div className="min-w-0">
                <p className="font-medium text-yellow-800 text-sm">Special Requirements</p>
                <p className="text-yellow-700 text-sm mt-1 break-words">{event.requirements}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Assignments Tab Component
function AssignmentsTab({ events, formatDate }) {
  const assignedEvents = events.filter(event => event.assignments && event.assignments.length > 0)
  const assignments = assignedEvents.flatMap(event => 
    event.assignments.map(assignment => ({
      ...assignment,
      eventTitle: event.title,
      eventDate: event.eventDate,
      eventType: event.eventType
    }))
  )

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Staff Assignments & Wage Calculator
        </CardTitle>
        <CardDescription>
          Track assigned staff and calculate wages automatically with detailed breakdowns
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Wage Structure:</strong> ₹350 for 7 hours standard duty + ₹50 per hour overtime + TL commission based on team size
          </AlertDescription>
        </Alert>
        
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No assignments yet</p>
            <p className="text-gray-500">Assignments will appear here once events are assigned to team leaders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold min-w-[200px]">Event Details</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Team Leader</TableHead>
                    <TableHead className="font-semibold">Staff</TableHead>
                    <TableHead className="font-semibold">Hours</TableHead>
                    <TableHead className="font-semibold min-w-[180px]">Wage Calculation</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Time Tracking</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow key={assignment.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 break-words">{assignment.eventTitle}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{formatDate(assignment.eventDate)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {assignment.eventType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                            {assignment.teamLeader?.name?.charAt(0)}
                          </div>
                          <span className="font-medium break-words">{assignment.teamLeader?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">{assignment.staffAssigned}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium">{assignment.actualHours || assignment.assignedHours}h</span>
                          </div>
                          {assignment.actualHours > 7 && (
                            <Badge variant="outline" className="text-xs text-orange-600 bg-orange-50 border-orange-200">
                              +{(assignment.actualHours - 7).toFixed(1)}h OT
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="font-bold text-lg text-green-600">₹{assignment.totalWage?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Base: ₹{assignment.basePay?.toLocaleString('en-IN')}</div>
                            {assignment.overtimePay > 0 && (
                              <div>OT: ₹{assignment.overtimePay?.toLocaleString('en-IN')}</div>
                            )}
                            {assignment.commission && (
                              <div>Comm: ₹{assignment.commission?.toLocaleString('en-IN')}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {assignment.entryTime && assignment.exitTime ? (
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Play className="h-3 w-3 text-green-600 flex-shrink-0 fill-current" />
                                <span>{new Date(assignment.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Square className="h-3 w-3 text-red-600 flex-shrink-0 fill-current" />
                                <span>{new Date(assignment.exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                              </div>
                              <div className="flex gap-1 mt-2">
                                <Badge variant="outline" className="text-xs text-green-600 bg-green-50 border-green-200">
                                  Completed
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      await generateProfessionalWageSlip(assignment)
                                    } catch (error) {
                                      console.warn('Professional PDF generator failed, using simple generator:', error)
                                      await generateSimpleWageSlip(assignment)
                                    }
                                  }}
                                  className="h-5 px-2 text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  PDF
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                              Pending
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-2">
                          <Badge 
                            variant={assignment.status === 'paid' ? 'default' : 'outline'}
                            className={`${
                              assignment.status === 'paid' 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'text-gray-600 bg-gray-50 border-gray-200'
                            } capitalize`}
                          >
                            {assignment.status}
                          </Badge>
                          {assignment.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/assignments/${assignment.id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ status: 'paid' }),
                                  });
                                  
                                  if (!response.ok) {
                                    throw new Error('Failed to update assignment status');
                                  }
                                  
                                  // Refresh the assignments list
                                  refetchEvents();
                                  toast({
                                    title: "Payment Processed",
                                    description: `Payment marked as completed for ${assignment.teamLeader?.name || 'team leader'} on ${assignment.eventTitle || 'event'}.`,
                                    duration: 3000,
                                  });
                                } catch (error) {
                                  console.error('Error updating assignment status:', error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to process payment. Please try again.",
                                    variant: "destructive",
                                    duration: 3000,
                                  });
                                }
                              }}
                              className="h-6 px-2 text-xs mt-1"
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Create Event Dialog Component
function CreateEventDialog({ open, onOpenChange, formData, setFormData, formErrors, onSubmit, loading, onReset }) {
  const handleClose = () => {
    onOpenChange(false)
    onReset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Event</DialogTitle>
          <DialogDescription className="text-base">
            Enter comprehensive event details to notify team leaders and collect availability responses.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Corporate Conference Setup"
                className={`h-12 transition-all ${
                  formErrors.title ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                }`}
                required
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm">{formErrors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client" className="text-sm font-semibold">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                placeholder="Tech Corp Ltd"
                className={`h-12 transition-all ${
                  formErrors.client ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                }`}
                required
              />
              {formErrors.client && (
                <p className="text-red-500 text-sm">{formErrors.client}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="eventType" className="text-sm font-semibold">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(value) => setFormData({...formData, eventType: value})}
              >
                <SelectTrigger className={`h-12 transition-all ${
                  formErrors.eventType ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                }`}>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                  <SelectItem value="Hotel Service">Hotel Service</SelectItem>
                  <SelectItem value="Catering">Catering</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.eventType && (
                <p className="text-red-500 text-sm">{formErrors.eventType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="text-sm font-semibold">
                Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                className={`h-12 transition-all ${
                  formErrors.eventDate ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                }`}
                required
              />
              {formErrors.eventDate && (
                <p className="text-red-500 text-sm">{formErrors.eventDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Grand Hotel, Mumbai"
              className={`h-12 transition-all ${
                formErrors.location ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
              }`}
              required
            />
            {formErrors.location && (
              <p className="text-red-500 text-sm">{formErrors.location}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="staffNeeded" className="text-sm font-semibold">
                Staff Needed <span className="text-red-500">*</span>
              </Label>
              <Input
                id="staffNeeded"
                type="number"
                value={formData.staffNeeded}
                onChange={(e) => setFormData({...formData, staffNeeded: e.target.value})}
                placeholder="8"
                min="1"
                className={`h-12 transition-all ${
                  formErrors.staffNeeded ? 'border-red-300 focus:border-red-500' : 'focus:border-blue-500'
                }`}
                required
              />
              {formErrors.staffNeeded && (
                <p className="text-red-500 text-sm">{formErrors.staffNeeded}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedRevenue" className="text-sm font-semibold">Expected Revenue (₹)</Label>
              <Input
                id="expectedRevenue"
                type="number"
                value={formData.expectedRevenue}
                onChange={(e) => setFormData({...formData, expectedRevenue: e.target.value})}
                placeholder="50000"
                min="0"
                className="h-12 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetAllocated" className="text-sm font-semibold">Budget Allocated (₹)</Label>
              <Input
                id="budgetAllocated"
                type="number"
                value={formData.budgetAllocated}
                onChange={(e) => setFormData({...formData, budgetAllocated: e.target.value})}
                placeholder="35000"
                min="0"
                className="h-12 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements" className="text-sm font-semibold">Special Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              placeholder="Any special equipment, skills, or instructions for the team..."
              rows={4}
              className="resize-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="px-8 py-3 transition-all hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                <Plus className="h-4 w-4 mr-2" />
              Create Event
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Event Responses Dialog Component
function EventResponsesDialog({ selectedEvent, onOpenChange, eventResponses, onCreateAssignment, formatDate }) {
  if (!selectedEvent) return null

  return (
    <Dialog open={!!selectedEvent} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="break-words">Team Leader Responses - {selectedEvent?.title}</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Review responses and assign team leaders to this event. Click "Assign" to confirm team leader allocation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Summary Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-blue-600">{selectedEvent?.staffNeeded}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Staff Needed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-green-600">{eventResponses.filter(r => r.available).length}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Available TLs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-purple-600">
                    {eventResponses.filter(r => r.available).reduce((sum, r) => sum + (r.staffCount || 0), 0)}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">Total Available Staff</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-orange-600">₹{selectedEvent?.expectedRevenue?.toLocaleString('en-IN')}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Expected Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {eventResponses.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-700 text-lg font-medium">No responses yet</p>
                <p className="text-gray-500">Team leader responses will appear here as they come in</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventResponses.map((response) => (
                <Card key={response.id} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {response.teamLeader?.name?.charAt(0) || 'T'}
                            </div>
                            <div className="min-w-0">
                          <p className="font-semibold break-words">{response.teamLeader?.name || 'Team Leader'}</p>
                          <p className="text-xs text-gray-500 break-words">{response.teamLeader?.email}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <Badge variant="outline" className={`text-xs ${response.available ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                              {response.available ? 'Available' : 'Not Available'}
                          </Badge>
                            {typeof response.staffCount === 'number' && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                {response.staffCount} staff
                              </span>
                            )}
                            {response.respondedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {formatDate(response.respondedAt)}
                              </span>
                            )}
                          </div>
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                            <Button
                              size="sm"
                          disabled={!response.available}
                          onClick={() => {
                            onCreateAssignment(selectedEvent.id, response.teamLeaderId, response.staffCount || 0)
                            onOpenChange(false)
                          }}
                          className="hover:bg-blue-50 hover:border-blue-300"
                          variant="outline"
                        >
                              Assign
                            </Button>
                      </div>
                    </div>
                    {response.message && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 break-words">
                        {response.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}