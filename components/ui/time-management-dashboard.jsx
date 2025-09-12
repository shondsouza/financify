'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Users, DollarSign, FileText, AlertTriangle, RefreshCw } from 'lucide-react'
import AssignmentTimeCard from './assignment-time-card'

export default function TimeManagementDashboard() {
  const [assignments, setAssignments] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch assignments based on filter
  const fetchAssignments = async () => {
    setLoading(true)
    setError('')
    
    try {
      let endpoint = '/api/assignments'
      if (filter === 'pending') {
        endpoint = '/api/assignments/pending'
      } else if (filter === 'completed') {
        endpoint = '/api/assignments/completed'
      } else if (filter === 'paid') {
        endpoint = '/api/assignments/paid'
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Failed to fetch assignments')
      }
      
      const data = await response.json()
      setAssignments(data || [])
    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError('Failed to load assignments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [filter])

  const handleTimeUpdate = (updatedAssignment) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment
      )
    )
  }

  const handleStatusUpdate = (assignmentId, newStatus) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: newStatus }
          : assignment
      )
    )
  }

  const getFilterStats = () => {
    const total = assignments.length
    const pending = assignments.filter(a => a.status === 'assigned').length
    const completed = assignments.filter(a => a.status === 'completed').length
    const paid = assignments.filter(a => a.status === 'paid').length
    
    return { total, pending, completed, paid }
  }

  const stats = getFilterStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Management</h2>
          <p className="text-gray-600">Track work hours and manage wage calculations</p>
        </div>
        <Button 
          onClick={fetchAssignments}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Completed ({stats.completed})
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Paid ({stats.paid})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No pending assignments</p>
                <p className="text-gray-500">All assignments have been completed or are in progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map(assignment => (
                <AssignmentTimeCard
                  key={assignment.id}
                  assignment={assignment}
                  onTimeUpdate={handleTimeUpdate}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No completed assignments</p>
                <p className="text-gray-500">Completed assignments will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map(assignment => (
                <AssignmentTimeCard
                  key={assignment.id}
                  assignment={assignment}
                  onTimeUpdate={handleTimeUpdate}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No paid assignments</p>
                <p className="text-gray-500">Paid assignments will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map(assignment => (
                <AssignmentTimeCard
                  key={assignment.id}
                  assignment={assignment}
                  onTimeUpdate={handleTimeUpdate}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No assignments found</p>
                <p className="text-gray-500">Assignments will appear here once created</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map(assignment => (
                <AssignmentTimeCard
                  key={assignment.id}
                  assignment={assignment}
                  onTimeUpdate={handleTimeUpdate}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
