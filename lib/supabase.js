import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const dbOperations = {
  // Wage Settings
  async getWageSettings() {
    const { data, error } = await supabase
      .from('wage_settings')
      .select('*')
      .eq('id', 'default')
      .single()
    return { data, error }
  },

  async upsertWageSettings(settings) {
    const payload = {
      id: 'default',
      basePay: settings.basePay,
      standardHours: settings.standardHours,
      overtimeRate: settings.overtimeRate,
      updatedAt: new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('wage_settings')
      .upsert([payload], { onConflict: 'id' })
      .select()
      .single()
    return { data, error }
  },
  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
    return { data: data || [], error }
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    return { data, error }
  },

  async ensureAdminUser() {
    // Check if admin user exists, if not create it
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'admin-1')
      .single()
    
    if (existingUser) {
      return { data: existingUser, error: null }
    }
    
    // Create admin user if it doesn't exist
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: 'admin-1',
        email: 'admin@company.com',
        name: 'System Admin',
        role: 'admin',
        phone: '+91-9876543210',
        isActive: true
      }])
      .select()
      .single()
    
    return { data, error }
  },

  async ensureTeamLeaderUser() {
    // Check if team leader user exists, if not create it
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'tl-1')
      .single()
    
    if (existingUser) {
      return { data: existingUser, error: null }
    }
    
    // Create team leader user if it doesn't exist
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: 'tl-1',
        email: 'john@company.com',
        name: 'John Smith',
        role: 'team_leader',
        phone: '+91-9876543211',
        isActive: true
      }])
      .select()
      .single()
    
    return { data, error }
  },

  // User Management Functions
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    return { data, error }
  },

  async updateUser(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Events
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        createdByUser:users!createdBy(name, email),
        responses:event_responses(*, teamLeader:users(name, email)),
        assignments:staff_assignments(*, teamLeader:users(name, email))
      `)
      .order('eventDate', { ascending: true })
    return { data: data || [], error }
  },

  async createEvent(eventData) {
    console.log('Supabase createEvent called with:', eventData)
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Key exists:', !!supabaseAnonKey)
    
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()
    
    console.log('Supabase createEvent result:', { data, error })
    return { data, error }
  },

  async updateEventStatus(id, status) {
    const { data, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteEvent(id) {
    // First delete related records (cascade delete)
    const { error: responsesError } = await supabase
      .from('event_responses')
      .delete()
      .eq('eventId', id)
    
    if (responsesError) {
      console.error('Error deleting event responses:', responsesError)
    }

    const { error: assignmentsError } = await supabase
      .from('staff_assignments')
      .delete()
      .eq('eventId', id)
    
    if (assignmentsError) {
      console.error('Error deleting staff assignments:', assignmentsError)
    }

    // Then delete the event
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Event Responses
  async getEventResponses(eventId) {
    const { data, error } = await supabase
      .from('event_responses')
      .select(`
        *,
        teamLeader:users(name, email, phone)
      `)
      .eq('eventId', eventId)
    return { data: data || [], error }
  },

  async createEventResponse(responseData) {
    const { data, error } = await supabase
      .from('event_responses')
      .upsert([responseData], { 
        onConflict: 'eventId,teamLeaderId' 
      })
      .select()
      .single()
    return { data, error }
  },

  // Staff Assignments
  async createStaffAssignment(assignmentData) {
    // Load wage settings, fallback to defaults
    let basePay = 350.00
    let overtimeRate = 50.00
    let standardHours = 7.0
    try {
      const { data: wage } = await dbOperations.getWageSettings()
      if (wage) {
        basePay = parseFloat(wage.basePay) || basePay
        overtimeRate = parseFloat(wage.overtimeRate) || overtimeRate
        standardHours = parseFloat(wage.standardHours) || standardHours
      }
    } catch (_) {}
    
    const actualHours = assignmentData.actualHours || assignmentData.assignedHours || standardHours
    let totalWage = basePay
    let overtimePay = 0
    
    if (actualHours > standardHours) {
      overtimePay = (actualHours - standardHours) * overtimeRate
      totalWage = basePay + overtimePay
    }

    const finalAssignmentData = {
      ...assignmentData,
      basePay,
      overtimePay,
      totalWage,
      actualHours
    }

    const { data, error } = await supabase
      .from('staff_assignments')
      .insert([finalAssignmentData])
      .select()
      .single()
    return { data, error }
  },

  async updateStaffAssignment(id, updateData) {
    // Recalculate wages if hours changed
    if (updateData.actualHours) {
      // Load wage settings, fallback to defaults
      let basePay = 350.00
      let overtimeRate = 50.00
      let standardHours = 7.0
      try {
        const { data: wage } = await dbOperations.getWageSettings()
        if (wage) {
          basePay = parseFloat(wage.basePay) || basePay
          overtimeRate = parseFloat(wage.overtimeRate) || overtimeRate
          standardHours = parseFloat(wage.standardHours) || standardHours
        }
      } catch (_) {}
      
      let totalWage = basePay
      let overtimePay = 0
      
      if (updateData.actualHours > standardHours) {
        overtimePay = (updateData.actualHours - standardHours) * overtimeRate
        totalWage = basePay + overtimePay
      }

      updateData.basePay = basePay
      updateData.overtimePay = overtimePay
      updateData.totalWage = totalWage
    }

    const { data, error } = await supabase
      .from('staff_assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async updateAssignmentTime(id, timeData) {
    // Get assignment to find staff count for TL commission
    const { data: assignment } = await supabase
      .from('staff_assignments')
      .select('staffAssigned')
      .eq('id', id)
      .single()

    // Calculate wages based on actual hours using settings
    let basePay = 350.00
    let overtimeRate = 50.00
    let standardHours = 7.0
    let tlCommissionRate = 25.00
    try {
      const { data: wage } = await dbOperations.getWageSettings()
      if (wage) {
        basePay = parseFloat(wage.basePay) || basePay
        overtimeRate = parseFloat(wage.overtimeRate) || overtimeRate
        standardHours = parseFloat(wage.standardHours) || standardHours
      }
    } catch (_) {}
    
    let totalWage = basePay
    let overtimePay = 0
    
    if (timeData.actualHours > standardHours) {
      overtimePay = (timeData.actualHours - standardHours) * overtimeRate
    }

    // Calculate TL commission
    const staffCount = assignment?.staffAssigned || 0
    const tlCommission = staffCount * tlCommissionRate
    totalWage = basePay + overtimePay + tlCommission

    const updateData = {
      ...timeData,
      basePay,
      overtimePay,
      tlCommission,
      totalWage,
      status: 'completed' // Mark as completed when time is tracked
    }

    const { data, error } = await supabase
      .from('staff_assignments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        events:eventId (
          title,
          client,
          eventDate,
          location,
          eventType
        ),
        teamLeader:teamLeaderId (
          name,
          email
        )
      `)
      .single()
    return { data, error }
  },

  async getTeamLeaderAssignments(teamLeaderId) {
    console.log('DB: Querying assignments for team leader ID:', teamLeaderId)
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        events:eventId (
          title,
          client,
          eventDate,
          location,
          eventType
        )
      `)
      .eq('teamLeaderId', teamLeaderId)
      .order('assignedAt', { ascending: false })
    console.log('DB: Query result:', { data, error })
    return { data, error }
  },

  // Get assignments by status
  async getPendingAssignments() {
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        events:eventId (
          title,
          client,
          eventDate,
          location,
          eventType
        ),
        teamLeader:teamLeaderId (
          name,
          email
        )
      `)
      .eq('status', 'assigned')
      .order('assignedAt', { ascending: false })
    return { data: data || [], error }
  },

  async getCompletedAssignments() {
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        events:eventId (
          title,
          client,
          eventDate,
          location,
          eventType
        ),
        teamLeader:teamLeaderId (
          name,
          email
        )
      `)
      .eq('status', 'completed')
      .order('assignedAt', { ascending: false })
    return { data: data || [], error }
  },

  async getPaidAssignments() {
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        events:eventId (
          title,
          client,
          eventDate,
          location,
          eventType
        ),
        teamLeader:teamLeaderId (
          name,
          email
        )
      `)
      .eq('status', 'paid')
      .order('assignedAt', { ascending: false })
    return { data: data || [], error }
  },

  async getAllAssignments() {
    const { data, error } = await supabase
      .from('staff_assignments')
      .select(`
        *,
        events:eventId (
          title,
          client,
          eventDate,
          location,
          eventType
        ),
        teamLeader:teamLeaderId (
          name,
          email
        )
      `)
      .order('assignedAt', { ascending: false })
    return { data: data || [], error }
  },

  // Dashboard Analytics
  async getDashboardStats() {
    // Get events by status
    const { data: events } = await supabase
      .from('events')
      .select('status, expectedRevenue')

    // Get total assignments and wages
    const { data: assignments } = await supabase
      .from('staff_assignments')
      .select('totalWage, status, actualHours')

    const stats = {
      totalEvents: events?.length || 0,
      openEvents: events?.filter(e => e.status === 'open').length || 0,
      completedEvents: events?.filter(e => e.status === 'completed').length || 0,
      totalRevenue: events?.reduce((sum, e) => sum + (parseFloat(e.expectedRevenue) || 0), 0) || 0,
      totalWages: assignments?.reduce((sum, a) => sum + (parseFloat(a.totalWage) || 0), 0) || 0,
      totalHours: assignments?.reduce((sum, a) => sum + (parseFloat(a.actualHours) || 0), 0) || 0,
      activeAssignments: assignments?.filter(a => a.status !== 'paid').length || 0
    }

    return stats
  }
}