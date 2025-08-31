'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, Calendar, Users, DollarSign, Clock, CheckCircle, XCircle, 
  AlertTriangle, TrendingUp, MapPin, Building, Star, Eye,
  Filter, Download, RefreshCw, BarChart3, PieChart, Search,
  Zap, Target, Award, Activity, Play, Square
} from 'lucide-react'

export function AdminDashboard({ user }) {
  const [stats, setStats] = useState({})
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventResponses, setEventResponses] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Form state
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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load stats and events
      const [statsRes, eventsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/events')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user.id
        })
      })

      if (response.ok) {
        setShowCreateForm(false)
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
        loadDashboardData()
      } else {
        console.error('Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const loadEventResponses = async (event) => {
    setSelectedEvent(event)
    try {
      const response = await fetch(`/api/events/${event.id}/responses`)
      if (response.ok) {
        const data = await response.json()
        setEventResponses(data)
      }
    } catch (error) {
      console.error('Error loading event responses:', error)
    }
  }

  const createAssignment = async (eventId, teamLeaderId, staffCount) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId,
          teamLeaderId,
          staffAssigned: staffCount,
          assignedHours: 7.0
        })
      })

      if (response.ok) {
        // Update event status to assigned
        await fetch(`/api/events/${eventId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'assigned' })
        })
        
        loadDashboardData()
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
    }
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
      open: { variant: 'outline', icon: Clock, text: 'Open', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      assigned: { variant: 'default', icon: Users, text: 'Assigned', color: 'text-green-600 bg-green-50 border-green-200' },
      completed: { variant: 'default', icon: CheckCircle, text: 'Completed', color: 'text-purple-600 bg-purple-50 border-purple-200' },
      cancelled: { variant: 'destructive', icon: XCircle, text: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200' }
    }
    
    const config = statusConfig[status] || statusConfig.open
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 font-medium`}>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100 text-lg">Here's what's happening with your workforce today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowCreateForm(true)} 
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={loadDashboardData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">Total Events</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">{stats.totalEvents || 0}</div>
            <div className="flex items-center space-x-2">
              <Progress value={(stats.openEvents / stats.totalEvents) * 100 || 0} className="flex-1 h-2" />
              <span className="text-xs text-blue-700 font-medium">{stats.openEvents || 0} open</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Expected Revenue</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-1">₹{stats.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-green-700 flex items-center">
              <Target className="h-3 w-3 mr-1" />
              Total projected income
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">Total Wages</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">₹{stats.totalWages?.toLocaleString() || 0}</div>
            <p className="text-xs text-purple-700 flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              {stats.activeAssignments || 0} active assignments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-orange-800">Total Hours</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-1">{stats.totalHours || 0}</div>
            <p className="text-xs text-orange-700 flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              Hours worked this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white shadow-sm border rounded-lg p-1 h-12">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-medium px-6">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-medium px-6">
            <Calendar className="h-4 w-4 mr-2" />
            Events Management
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-medium px-6">
            <Users className="h-4 w-4 mr-2" />
            Assignments & Wages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.client}</p>
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-lg font-bold text-green-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-lg font-bold text-blue-600">2.3h</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Team Leaders</span>
                    <span className="text-lg font-bold text-purple-600">{stats.activeTeamLeaders || 12}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Enhanced Search and Filter Section */}
          <Card className="shadow-md border-0">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events, clients, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 h-11">
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
                  <Button variant="outline" size="icon" className="h-11 w-11">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {filteredEvents.length === 0 ? (
              <Card className="shadow-md border-0">
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No events found</p>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          {event.title}
                          {getStatusBadge(event.status)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2 text-base">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {event.client}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="capitalize font-medium text-blue-600">{event.eventType}</span>
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadEventResponses(event)}
                        disabled={event.status !== 'open'}
                        className="ml-4 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Responses ({event.responses?.length || 0})
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date & Time</p>
                          <p className="font-semibold text-gray-900">{formatDate(event.eventDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
                          <p className="font-semibold text-gray-900">{event.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Staff Needed</p>
                          <p className="font-semibold text-gray-900">{event.staffNeeded} people</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Revenue</p>
                          <p className="font-semibold text-gray-900">₹{event.expectedRevenue?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    {event.requirements && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800 text-sm">Special Requirements</p>
                            <p className="text-yellow-700 text-sm mt-1">{event.requirements}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <Card className="shadow-md border-0">
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
              
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Event Details</TableHead>
                      <TableHead className="font-semibold">Team Leader</TableHead>
                      <TableHead className="font-semibold">Staff Assigned</TableHead>
                      <TableHead className="font-semibold">Hours</TableHead>
                      <TableHead className="font-semibold">Wage Calculation</TableHead>
                      <TableHead className="font-semibold">Time Tracking</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events
                      .filter(event => event.assignments && event.assignments.length > 0)
                      .flatMap(event => 
                        event.assignments.map(assignment => ({
                          ...assignment,
                          eventTitle: event.title,
                          eventDate: event.eventDate,
                          eventType: event.eventType
                        }))
                      )
                      .map((assignment, index) => (
                        <TableRow key={assignment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-900">{assignment.eventTitle}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(assignment.eventDate)}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {assignment.eventType}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {assignment.teamLeader?.name?.charAt(0)}
                              </div>
                              <span className="font-medium">{assignment.teamLeader?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{assignment.staffAssigned} people</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{assignment.actualHours || assignment.assignedHours} hours</span>
                              </div>
                              {assignment.actualHours > 7 && (
                                <Badge variant="outline" className="text-xs text-orange-600 bg-orange-50">
                                  +{(assignment.actualHours - 7).toFixed(1)}h overtime
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-bold text-lg text-green-600">₹{assignment.totalWage?.toLocaleString()}</span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Base: ₹{assignment.basePay}</div>
                                {assignment.overtimePay > 0 && (
                                  <div>Overtime: ₹{assignment.overtimePay}</div>
                                )}
                                {assignment.commission && (
                                  <div>TL Commission: ₹{assignment.commission}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {assignment.entryTime && assignment.exitTime ? (
                                <div className="text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Play className="h-3 w-3 text-green-600" />
                                    {new Date(assignment.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Square className="h-3 w-3 text-red-600" />
                                    {new Date(assignment.exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </div>
                                  <Badge variant="outline" className="text-xs text-green-600 bg-green-50">
                                    Completed
                                  </Badge>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={assignment.status === 'paid' ? 'default' : 'outline'}
                              className={assignment.status === 'paid' ? 'bg-green-500' : ''}
                            >
                              {assignment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Create Event Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Event</DialogTitle>
            <DialogDescription className="text-base">
              Enter comprehensive event details to notify team leaders and collect availability responses.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Corporate Conference Setup"
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client" className="text-sm font-semibold">Client Name *</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  placeholder="Tech Corp Ltd"
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-sm font-semibold">Event Type</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData({...formData, eventType: value})}>
                  <SelectTrigger className="h-12">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-sm font-semibold">Date & Time *</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Grand Hotel, Mumbai"
                className="h-12"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="staffNeeded" className="text-sm font-semibold">Staff Needed *</Label>
                <Input
                  id="staffNeeded"
                  type="number"
                  value={formData.staffNeeded}
                  onChange={(e) => setFormData({...formData, staffNeeded: e.target.value})}
                  placeholder="8"
                  min="1"
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedRevenue" className="text-sm font-semibold">Expected Revenue (₹)</Label>
                <Input
                  id="expectedRevenue"
                  type="number"
                  value={formData.expectedRevenue}
                  onChange={(e) => setFormData({...formData, expectedRevenue: e.target.value})}
                  placeholder="50000"
                  className="h-12"
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
                  className="h-12"
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
                className="resize-none"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="px-8 py-3"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Event Responses Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Team Leader Responses - {selectedEvent?.title}
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
                    <div className="text-2xl font-bold text-blue-600">{selectedEvent?.staffNeeded}</div>
                    <div className="text-sm text-gray-600">Staff Needed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{eventResponses.filter(r => r.available).length}</div>
                    <div className="text-sm text-gray-600">Available TLs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {eventResponses.filter(r => r.available).reduce((sum, r) => sum + (r.staffCount || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Available Staff</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">₹{selectedEvent?.expectedRevenue?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Expected Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {eventResponses.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses received yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Team leaders will see this event in their dashboard and can respond with their availability. 
                    Responses typically arrive within a few hours.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Team Leader</TableHead>
                      <TableHead className="font-semibold">Availability</TableHead>
                      <TableHead className="font-semibold">Staff Count</TableHead>
                      <TableHead className="font-semibold">Message</TableHead>
                      <TableHead className="font-semibold">Response Time</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventResponses.map((response, index) => (
                      <TableRow key={response.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {response.teamLeader?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{response.teamLeader?.name}</p>
                              <p className="text-sm text-gray-600">{response.teamLeader?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={response.available ? 'default' : 'destructive'}
                            className={`${response.available ? 'bg-green-500' : 'bg-red-500'} text-white font-medium`}
                          >
                            {response.available ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Available
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold">{response.staffCount} people</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {response.message ? (
                              <p className="text-sm bg-gray-100 p-2 rounded-md">{response.message}</p>
                            ) : (
                              <span className="text-gray-400 text-sm">No message</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            <div>{formatDate(response.respondedAt)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {response.available ? (
                            <Button
                              size="sm"
                              onClick={() => createAssignment(selectedEvent.id, response.teamLeaderId, response.staffCount)}
                              disabled={selectedEvent?.status !== 'open'}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Assign
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">Not available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}