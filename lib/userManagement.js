import { dbOperations } from './supabase'

// User management functions for Admin
export const userManagement = {
  // Create new team leader
  async createTeamLeader(userData) {
    const { name, email, phone, password } = userData
    
    // Generate unique user ID
    const userId = `tl-${Date.now()}`
    
    const newUser = {
      id: userId,
      name,
      email,
      phone,
      role: 'team_leader',
      password, // Store hashed password
      isActive: true,
      createdAt: new Date().toISOString()
    }
    
    // Insert into users table
    const { data, error } = await dbOperations.createUser(newUser)
    return { data, error }
  },

  // Get all team leaders
  async getTeamLeaders() {
    const { data, error } = await dbOperations.getUsers()
    if (error) return { data: [], error }
    
    // Filter only team leaders
    const teamLeaders = data.filter(user => user.role === 'team_leader')
    return { data: teamLeaders, error: null }
  },

  // Update team leader
  async updateTeamLeader(userId, updateData) {
    const { data, error } = await dbOperations.updateUser(userId, updateData)
    return { data, error }
  },

  // Deactivate team leader
  async deactivateTeamLeader(userId) {
    const { data, error } = await dbOperations.updateUser(userId, { isActive: false })
    return { data, error }
  },

  // Generate random password
  generatePassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  },

  // Validate user data
  validateUserData(userData) {
    const errors = {}
    
    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!userData.email || !userData.email.includes('@')) {
      errors.email = 'Valid email is required'
    }
    
    if (!userData.phone || userData.phone.trim().length < 10) {
      errors.phone = 'Valid phone number is required'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}
