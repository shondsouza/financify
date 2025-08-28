'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, Calendar, MapPin, Users, DollarSign, Clock, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react'

export function TeamLeaderDashboard({ user }) {
  const [events, setEvents] = useState([])
  const [myAssignments, setMyAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [responseData, setResponseData] = useState({
    available: null,
    staffCount: '',
    message: ''
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
        
        // Filter assignments for current user
        const userAssignments = data
          .flatMap(event => 
            event.assignments
              ?.filter(assignment => assignment.teamLeaderId === user.id)
              .map(assignment => ({
                ...assignment,
                eventTitle: event.title,
                eventDate: event.eventDate,
                client: event.client,
                location: event.location
              })) || []
          )
        setMyAssignments(userAssignments)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventResponse = (event) => {
    setSelectedEvent(event)
    
    // Check if user already responded
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
    if (responseData.available === null) return

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamLeaderId: user.id,
          available: responseData.available,
          staffCount: parseInt(responseData.staffCount) || 0,
          message: responseData.message
        })
      })

      if (response.ok) {
        setSelectedEvent(null)
        loadDashboardData()
      }
    } catch (error) {
      console.error('Error submitting response:', error)
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
      assigned: { variant: 'default', icon: Users, text: 'Assigned' },
      in_progress: { variant: 'default', icon: Clock, text: 'In Progress' },
      completed: { variant: 'default', icon: CheckCircle, text: 'Completed' },
      paid: { variant: 'default', icon: DollarSign, text: 'Paid' }
    }
    
    const config = statusConfig[status] || statusConfig.assigned
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const calculateWageBreakdown = (assignment) => {
    const basePay = 350
    const overtimeRate = 50
    const standardHours = 7
    const actualHours = assignment.actualHours || assignment.assignedHours || 7

    let breakdown = {
      standardHours: Math.min(actualHours, standardHours),
      overtimeHours: Math.max(0, actualHours - standardHours),
      basePay: basePay,
      overtimePay: Math.max(0, (actualHours - standardHours) * overtimeRate),
      totalWage: assignment.totalWage || (basePay + Math.max(0, (actualHours - standardHours) * overtimeRate))
    }

    return breakdown
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const openEvents = events.filter(event => event.status === 'open')
  const myStats = {
    totalAssignments: myAssignments.length,
    completedAssignments: myAssignments.filter(a => a.status === 'completed').length,
    totalEarnings: myAssignments.reduce((sum, a) => sum + (parseFloat(a.totalWage) || 0), 0),
    totalHours: myAssignments.reduce((sum, a) => sum + (parseFloat(a.actualHours) || parseFloat(a.assignedHours) || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {myStats.completedAssignments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{myStats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStats.totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Total hours logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Events</TabsTrigger>
          <TabsTrigger value="assignments">My Assignments</TabsTrigger>
          <TabsTrigger value="earnings">Earnings & Wages</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Available Events</h2>
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Respond quickly to secure assignments!
              </AlertDescription>
            </Alert>
          </div>

          <div className="grid gap-4">
            {openEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No events available</p>
                  <p className="text-muted-foreground">Check back later for new assignments!</p>
                </CardContent>
              </Card>
            ) : (
              openEvents.map((event) => {
                const userResponse = event.responses?.find(r => r.teamLeaderId === user.id)
                
                return (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {event.title}
                            {userResponse && (
                              <Badge variant={userResponse.available ? 'default' : 'destructive'}>
                                {userResponse.available ? 'Response: Available' : 'Response: Not Available'}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {event.client} • {event.eventType}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => handleEventResponse(event)}
                          variant={userResponse ? 'outline' : 'default'}
                        >
                          {userResponse ? 'Update Response' : 'Respond'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Date & Time</p>
                            <p className="text-muted-foreground">{formatDate(event.eventDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-muted-foreground">{event.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Staff Needed</p>
                            <p className="text-muted-foreground">{event.staffNeeded} people</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Expected Revenue</p>
                            <p className="text-muted-foreground">₹{event.expectedRevenue?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      {event.requirements && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="font-medium text-sm mb-1">Special Requirements:</p>
                          <p className="text-sm text-muted-foreground">{event.requirements}</p>
                        </div>
                      )}

                      {userResponse && (
                        <div className="mt-4 p-3 border rounded">
                          <p className="font-medium text-sm mb-1">Your Response:</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              {userResponse.available ? 
                                <ThumbsUp className="h-4 w-4 text-green-600" /> : 
                                <ThumbsDown className="h-4 w-4 text-red-600" />
                              }
                              {userResponse.available ? 'Available' : 'Not Available'}
                            </span>
                            {userResponse.available && (
                              <span>Staff: {userResponse.staffCount}</span>
                            )}
                          </div>
                          {userResponse.message && (
                            <p className="text-sm text-muted-foreground mt-1">"{userResponse.message}"</p>
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
          <Card>
            <CardHeader>
              <CardTitle>My Current Assignments</CardTitle>
              <CardDescription>
                Track your assigned events and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>No assignments yet</p>
                  <p>Respond to available events to get assigned!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Details</TableHead>
                      <TableHead>Staff Assigned</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.eventTitle}</p>
                            <p className="text-sm text-muted-foreground">{assignment.client}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(assignment.eventDate)} • {assignment.location}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.staffAssigned} people</TableCell>
                        <TableCell>
                          <div>
                            <p>{assignment.actualHours || assignment.assignedHours} hours</p>
                            {assignment.actualHours > 7 && (
                              <p className="text-xs text-orange-600">
                                +{(assignment.actualHours - 7).toFixed(1)}h overtime
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(assignment.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{assignment.totalWage?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              Base + Overtime
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings & Wage Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of your earnings and wage calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wage Structure:</strong> ₹350 for standard 7-hour duty + ₹50 per hour for overtime
                </AlertDescription>
              </Alert>

              {myAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4" />
                  <p>No earnings data available</p>
                  <p>Complete assignments to see your wage breakdown!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Hours Breakdown</TableHead>
                      <TableHead>Wage Calculation</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Total Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAssignments.map((assignment) => {
                      const breakdown = calculateWageBreakdown(assignment)
                      
                      return (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{assignment.eventTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(assignment.eventDate)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>Standard: {breakdown.standardHours}h</p>
                              {breakdown.overtimeHours > 0 && (
                                <p className="text-orange-600">Overtime: {breakdown.overtimeHours}h</p>
                              )}
                              <p className="font-medium">Total: {(breakdown.standardHours + breakdown.overtimeHours).toFixed(1)}h</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>Base Pay: ₹{breakdown.basePay}</p>
                              {breakdown.overtimePay > 0 && (
                                <p className="text-orange-600">Overtime: ₹{breakdown.overtimePay}</p>
                              )}
                              <p className="font-medium">Subtotal: ₹{breakdown.totalWage.toLocaleString()}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">₹{assignment.commission?.toLocaleString() || '0'}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-bold text-lg">
                                ₹{(breakdown.totalWage + (parseFloat(assignment.commission) || 0)).toLocaleString()}
                              </p>
                              <Badge variant={assignment.status === 'paid' ? 'default' : 'outline'} className="text-xs">
                                {assignment.status === 'paid' ? 'Paid' : 'Pending'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              
              {myAssignments.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="text-xl font-bold">{myStats.totalHours.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-xl font-bold">₹{myStats.totalEarnings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg per Hour</p>
                      <p className="text-xl font-bold">
                        ₹{myStats.totalHours > 0 ? (myStats.totalEarnings / myStats.totalHours).toFixed(0) : '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-xl font-bold">
                        {myStats.totalAssignments > 0 ? Math.round((myStats.completedAssignments / myStats.totalAssignments) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Response Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Event - {selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Let the admin know your availability and how many staff you can provide.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Client:</p>
                  <p>{selectedEvent?.client}</p>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>{formatDate(selectedEvent?.eventDate || '')}</p>
                </div>
                <div>
                  <p className="font-medium">Location:</p>
                  <p>{selectedEvent?.location}</p>
                </div>
                <div>
                  <p className="font-medium">Staff Needed:</p>
                  <p>{selectedEvent?.staffNeeded} people</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Are you available for this event? *</Label>
                <div className="flex gap-4">
                  <Button
                    variant={responseData.available === true ? 'default' : 'outline'}
                    onClick={() => setResponseData({...responseData, available: true})}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes, Available
                  </Button>
                  <Button
                    variant={responseData.available === false ? 'destructive' : 'outline'}
                    onClick={() => setResponseData({...responseData, available: false})}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not Available
                  </Button>
                </div>
              </div>

              {responseData.available === true && (
                <div className="space-y-2">
                  <Label htmlFor="staffCount">How many staff can you provide? *</Label>
                  <Input
                    id="staffCount"
                    type="number"
                    value={responseData.staffCount}
                    onChange={(e) => setResponseData({...responseData, staffCount: e.target.value})}
                    placeholder="Number of staff members"
                    min="0"
                    max={selectedEvent?.staffNeeded}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={responseData.message}
                  onChange={(e) => setResponseData({...responseData, message: e.target.value})}
                  placeholder="Any additional information, constraints, or questions..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Cancel
              </Button>
              <Button 
                onClick={submitResponse}
                disabled={responseData.available === null}
              >
                Submit Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}