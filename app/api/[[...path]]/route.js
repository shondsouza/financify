import { NextResponse } from 'next/server'
import { dbOperations } from '../../../lib/supabase.js'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Smart Finance & Workforce Tracker API", 
        status: "active",
        timestamp: new Date().toISOString()
      }))
    }

    // Dashboard stats - GET /api/dashboard/stats
    if (route === '/dashboard/stats' && method === 'GET') {
      const stats = await dbOperations.getDashboardStats()
      return handleCORS(NextResponse.json(stats))
    }

    // Users endpoints - GET /api/users
    if (route === '/users' && method === 'GET') {
      const { data, error } = await dbOperations.getUsers()
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // User by ID - GET /api/users/[id]
    if (route.startsWith('/users/') && method === 'GET') {
      const userId = path[1]
      const { data, error } = await dbOperations.getUserById(userId)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Events endpoints - GET /api/events
    if (route === '/events' && method === 'GET') {
      const { data, error } = await dbOperations.getEvents()
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Create event - POST /api/events
    if (route === '/events' && method === 'POST') {
      const body = await request.json()
      
      if (!body.title || !body.client || !body.eventDate || !body.location) {
        return handleCORS(NextResponse.json(
          { error: "Missing required fields: title, client, eventDate, location" },
          { status: 400 }
        ))
      }

      const eventData = {
        id: `event-${Date.now()}`,
        title: body.title,
        client: body.client,
        eventType: body.eventType || 'General',
        eventDate: body.eventDate,
        location: body.location,
        staffNeeded: parseInt(body.staffNeeded) || 1,
        expectedRevenue: parseFloat(body.expectedRevenue) || 0,
        budgetAllocated: parseFloat(body.budgetAllocated) || 0,
        requirements: body.requirements || '',
        createdBy: body.createdBy,
        status: 'open'
      }

      const { data, error } = await dbOperations.createEvent(eventData)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Update event status - PUT /api/events/[id]/status
    if (route.match(/^\/events\/[^\/]+\/status$/) && method === 'PUT') {
      const eventId = path[1]
      const body = await request.json()
      
      const { data, error } = await dbOperations.updateEventStatus(eventId, body.status)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Event responses - GET /api/events/[id]/responses
    if (route.match(/^\/events\/[^\/]+\/responses$/) && method === 'GET') {
      const eventId = path[1]
      const { data, error } = await dbOperations.getEventResponses(eventId)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Create event response - POST /api/events/[id]/responses
    if (route.match(/^\/events\/[^\/]+\/responses$/) && method === 'POST') {
      const eventId = path[1]
      const body = await request.json()
      
      if (!body.teamLeaderId || typeof body.available !== 'boolean') {
        return handleCORS(NextResponse.json(
          { error: "Missing required fields: teamLeaderId, available" },
          { status: 400 }
        ))
      }

      const responseData = {
        id: `response-${Date.now()}`,
        eventId,
        teamLeaderId: body.teamLeaderId,
        available: body.available,
        staffCount: parseInt(body.staffCount) || 0,
        message: body.message || ''
      }

      const { data, error } = await dbOperations.createEventResponse(responseData)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Create staff assignment - POST /api/assignments
    if (route === '/assignments' && method === 'POST') {
      const body = await request.json()
      
      if (!body.eventId || !body.teamLeaderId || !body.staffAssigned) {
        return handleCORS(NextResponse.json(
          { error: "Missing required fields: eventId, teamLeaderId, staffAssigned" },
          { status: 400 }
        ))
      }

      const assignmentData = {
        id: `assignment-${Date.now()}`,
        eventId: body.eventId,
        teamLeaderId: body.teamLeaderId,
        staffAssigned: parseInt(body.staffAssigned),
        assignedHours: parseFloat(body.assignedHours) || 7.0,
        actualHours: parseFloat(body.actualHours) || parseFloat(body.assignedHours) || 7.0,
        commission: parseFloat(body.commission) || 0,
        notes: body.notes || ''
      }

      const { data, error } = await dbOperations.createStaffAssignment(assignmentData)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Update assignment - PUT /api/assignments/[id]
    if (route.match(/^\/assignments\/[^\/]+$/) && method === 'PUT') {
      const assignmentId = path[1]
      const body = await request.json()
      
      const { data, error } = await dbOperations.updateStaffAssignment(assignmentId, body)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute