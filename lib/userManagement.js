import { dbOperations } from './supabase'

// User management functions for Admin
export const userManagement = {
  // Create new team leader
  async createTeamLeader(userData) {
    const { name, email, phone, password } = userData
    
    const newUser = {
      name,
      email,
      phone,
      role: 'team_leader',
      password: password || this.generatePassword(), // Auto-generate if not provided
    }
    
    try {
      // Use API endpoint to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: { message: errorData.error || 'Failed to create user' } }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (err) {
      console.error('Create team leader error:', err)
      return { data: null, error: { message: 'Network error. Please try again.' } }
    }
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
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: { message: errorData.error || 'Failed to update user' } }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (err) {
      console.error('Update team leader error:', err)
      return { data: null, error: { message: 'Network error. Please try again.' } }
    }
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
