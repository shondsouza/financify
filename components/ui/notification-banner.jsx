'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, X, Bell } from 'lucide-react'

export default function NotificationBanner({ events = [] }) {
  const [todayEvents, setTodayEvents] = useState([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check for events happening today (date only, ignoring time)
    const today = new Date()
    const todayDateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
    
    const eventsToday = events.filter(event => {
      if (!event.eventDate) return false
      
      const eventDate = new Date(event.eventDate)
      const eventDateString = eventDate.toISOString().split('T')[0]
      
      return eventDateString === todayDateString
    })

    setTodayEvents(eventsToday)
  }, [events])

  if (!isVisible || todayEvents.length === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 animate-pulse" />
              <span className="font-semibold text-lg">Today's Events</span>
            </div>
            <span className="text-blue-100">
              {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''} happening today
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-3 space-y-2">
          {todayEvents.map((event) => (
            <Alert key={event.id} className="border-white/20 bg-white/10 text-white">
              <Calendar className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{event.title}</span>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(event.eventDate).toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="text-sm text-blue-100">
                  {event.staffNeeded} staff needed
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  )
}
