import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const dbOperations = {
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
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()
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
    // Calculate wages based on hours
    const basePay = 350.00
    const overtimeRate = 50.00
    const standardHours = 7.0
    
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
      const basePay = 350.00
      const overtimeRate = 50.00
      const standardHours = 7.0
      
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