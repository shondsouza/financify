'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Play, Square, Calculator, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function TimeTrackingForm({ assignment, onTimeUpdate, onClose }) {
  const [entryTime, setEntryTime] = useState('')
  const [exitTime, setExitTime] = useState('')
  const [actualHours, setActualHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wageBreakdown, setWageBreakdown] = useState(null)

  // Calculate actual hours when entry/exit times change
  useEffect(() => {
    if (entryTime && exitTime) {
      const entry = new Date(entryTime)
      const exit = new Date(exitTime)
      
      if (exit > entry) {
        const diffMs = exit - entry
        const diffHours = diffMs / (1000 * 60 * 60)
        setActualHours(Math.round(diffHours * 100) / 100)
        
        // Calculate wage breakdown
        calculateWageBreakdown(diffHours)
      } else {
        setActualHours(0)
        setWageBreakdown(null)
      }
    }
  }, [entryTime, exitTime])

  const calculateWageBreakdown = (hours) => {
    const basePay = 350.00
    const overtimeRate = 50.00
    const standardHours = 7.0
    
    let overtimePay = 0
    if (hours > standardHours) {
      overtimePay = (hours - standardHours) * overtimeRate
    }
    
    const totalWage = basePay + overtimePay
    
    setWageBreakdown({
      standardHours: Math.min(hours, standardHours),
      overtimeHours: Math.max(0, hours - standardHours),
      basePay,
      overtimePay,
      totalWage
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!entryTime || !exitTime) {
      setError('Please enter both entry and exit times')
      return
    }
    
    if (actualHours <= 0) {
      setError('Exit time must be after entry time')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entryTime,
          exitTime,
          actualHours
        })
      })
      
      if (response.ok) {
        const updatedAssignment = await response.json()
        onTimeUpdate(updatedAssignment)
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update time tracking')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const setCurrentTime = (type) => {
    const now = new Date()
    const timeString = now.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
    
    if (type === 'entry') {
      setEntryTime(timeString)
    } else {
      setExitTime(timeString)
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Clock className="h-5 w-5" />
          Time Tracking - {assignment.eventTitle}
        </CardTitle>
        <CardDescription>
          Record your entry and exit times to calculate accurate wages based on actual hours worked
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entry Time */}
            <div className="space-y-3">
              <Label htmlFor="entryTime" className="flex items-center gap-2">
                <Play className="h-4 w-4 text-green-600" />
                Entry Time
              </Label>
              <div className="flex gap-2">
                <Input
                  id="entryTime"
                  type="datetime-local"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTime('entry')}
                  className="whitespace-nowrap"
                >
                  Now
                </Button>
              </div>
              {entryTime && (
                <p className="text-sm text-gray-600">
                  Entered at: {formatTime(entryTime)}
                </p>
              )}
            </div>
            
            {/* Exit Time */}
            <div className="space-y-3">
              <Label htmlFor="exitTime" className="flex items-center gap-2">
                <Square className="h-4 w-4 text-red-600" />
                Exit Time
              </Label>
              <div className="flex gap-2">
                <Input
                  id="exitTime"
                  type="datetime-local"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTime('exit')}
                  className="whitespace-nowrap"
                >
                  Now
                </Button>
              </div>
              {exitTime && (
                <p className="text-sm text-gray-600">
                  Exited at: {formatTime(exitTime)}
                </p>
              )}
            </div>
          </div>
          
          {/* Hours Calculation */}
          {actualHours > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Hours Calculation</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Hours:</span>
                  <span className="ml-2 font-semibold text-blue-800">{actualHours} hours</span>
                </div>
                <div>
                  <span className="text-gray-600">Standard Hours:</span>
                  <span className="ml-2 font-semibold">{Math.min(actualHours, 7)} hours</span>
                </div>
                {actualHours > 7 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Overtime Hours:</span>
                    <Badge variant="outline" className="ml-2 text-orange-600 bg-orange-50">
                      +{(actualHours - 7).toFixed(1)} hours
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Wage Breakdown */}
          {wageBreakdown && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Wage Calculation</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Base Pay (7h):</span>
                  <span className="ml-2 font-semibold">₹{wageBreakdown.basePay}</span>
                </div>
                {wageBreakdown.overtimePay > 0 && (
                  <div>
                    <span className="text-gray-600">Overtime Pay:</span>
                    <span className="ml-2 font-semibold text-orange-600">₹{wageBreakdown.overtimePay}</span>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-green-200">
                  <span className="text-gray-600">Total Wage:</span>
                  <span className="ml-2 font-bold text-lg text-green-800">₹{wageBreakdown.totalWage}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || actualHours <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update Time Tracking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
