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

    // Create user - POST /api/users
    if (route === '/users' && method === 'POST') {
      const body = await request.json()
      
      if (!body.name || !body.email) {
        return handleCORS(NextResponse.json(
          { error: "Missing required fields: name, email" },
          { status: 400 }
        ))
      }

      // Check if user already exists
      const { data: existingUser } = await dbOperations.getUserByEmail(body.email)
      if (existingUser) {
        return handleCORS(NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        ))
      }

      const userData = {
        id: `tl-${Date.now()}`,
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        role: body.role || 'team_leader',
        password: body.password || 'defaultPassword123',
        isActive: true
      }

      const { data, error } = await dbOperations.createUser(userData)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Update user - PUT /api/users/[id]
    if (route.startsWith('/users/') && method === 'PUT') {
      const userId = path[1]
      const body = await request.json()
      
      const { data, error } = await dbOperations.updateUser(userId, body)
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

    // Wage settings endpoints
    // GET /api/wage-settings
    if (route === '/wage-settings' && method === 'GET') {
      const { data, error } = await dbOperations.getWageSettings()
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // PUT /api/wage-settings
    if (route === '/wage-settings' && method === 'PUT') {
      const body = await request.json()
      const { basePay, standardHours, overtimeRate } = body || {}
      if (
        basePay === undefined || standardHours === undefined || overtimeRate === undefined
      ) {
        return handleCORS(NextResponse.json(
          { error: 'Missing fields: basePay, standardHours, overtimeRate' },
          { status: 400 }
        ))
      }
      const { data, error } = await dbOperations.upsertWageSettings({
        basePay: parseFloat(basePay),
        standardHours: parseFloat(standardHours),
        overtimeRate: parseFloat(overtimeRate)
      })
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // GET /api/team-leader-assignments/:teamLeaderId
    if (route.startsWith('/team-leader-assignments/') && method === 'GET') {
      const teamLeaderId = route.split('/')[2]
      console.log('API: Getting assignments for team leader ID:', teamLeaderId)
      if (!teamLeaderId) {
        return handleCORS(NextResponse.json({ error: "Team leader ID required" }, { status: 400 }))
      }

      const { data, error } = await dbOperations.getTeamLeaderAssignments(teamLeaderId)
      console.log('API: Database query result:', { data, error })
      if (error) {
        console.error('API: Database error:', error)
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

    // Update time tracking - PUT /api/assignments/[id]/time
    if (route.match(/^\/assignments\/[^\/]+\/time$/) && method === 'PUT') {
      const assignmentId = path[1]
      const body = await request.json()
      
      if (!body.entryTime || !body.exitTime || !body.actualHours) {
        return handleCORS(NextResponse.json(
          { error: "Missing required fields: entryTime, exitTime, actualHours" },
          { status: 400 }
        ))
      }

      const timeData = {
        entryTime: body.entryTime,
        exitTime: body.exitTime,
        actualHours: parseFloat(body.actualHours),
        breakTime: parseInt(body.breakTime) || 0,
        adminNotes: body.adminNotes || ''
      }

      const { data, error } = await dbOperations.updateAssignmentTime(assignmentId, timeData)
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Get pending assignments - GET /api/assignments/pending
    if (route === '/assignments/pending' && method === 'GET') {
      const { data, error } = await dbOperations.getPendingAssignments()
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Get completed assignments - GET /api/assignments/completed
    if (route === '/assignments/completed' && method === 'GET') {
      const { data, error } = await dbOperations.getCompletedAssignments()
      if (error) {
        return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      return handleCORS(NextResponse.json(data))
    }

    // Get paid assignments - GET /api/assignments/paid
    if (route === '/assignments/paid' && method === 'GET') {
      const { data, error } = await dbOperations.getPaidAssignments()
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