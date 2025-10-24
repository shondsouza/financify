"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, Users, UserPlus, Eye, EyeOff, Copy, Trash2, Edit, 
  Phone, Mail, Calendar, Shield, CheckCircle, XCircle, Search, Filter 
} from 'lucide-react'
import { userManagement } from '@/lib/userManagement'

export default function UserManagement() {
  const [teamLeaders, setTeamLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCredentials, setShowCredentials] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Form data for creating new team leader
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [createdUser, setCreatedUser] = useState(null)

  // Load team leaders
  const loadTeamLeaders = async () => {
    setLoading(true)
    try {
      const { data, error } = await userManagement.getTeamLeaders()
      if (error) {
        console.error('Failed to load team leaders:', error)
      } else {
        setTeamLeaders(data || [])
      }
    } catch (error) {
      console.error('Error loading team leaders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeamLeaders()
  }, [])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form data
    const validation = userManagement.validateUserData(formData)
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    setSubmitting(true)
    setFormErrors({})

    try {
      // Generate password if not provided
      const password = formData.password || userManagement.generatePassword()
      
      const { data, error } = await userManagement.createTeamLeader({
        ...formData,
        password
      })

      if (error) {
        setFormErrors({ submit: error.message || 'Failed to create team leader' })
      } else {
        // Show success with credentials
        setCreatedUser({ ...data, password })
        setFormData({ name: '', email: '', phone: '', password: '' })
        setShowCreateForm(false)
        loadTeamLeaders() // Refresh list
      }
    } catch (error) {
      console.error('Create user error:', error)
      setFormErrors({ submit: 'Failed to create team leader. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle user deactivation
  const handleDeactivate = async (userId) => {
    try {
      const { error } = await userManagement.deactivateTeamLeader(userId)
      if (error) {
        console.error('Failed to deactivate user:', error)
        alert('Failed to deactivate user. Please try again.')
      } else {
        loadTeamLeaders() // Refresh list
        setShowDeleteDialog(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error deactivating user:', error)
      alert('Failed to deactivate user. Please try again.')
    }
  }

  // Handle user reactivation
  const handleReactivate = async (userId) => {
    try {
      const { error } = await userManagement.updateTeamLeader(userId, { isActive: true })
      if (error) {
        console.error('Failed to reactivate user:', error)
        alert('Failed to reactivate user. Please try again.')
      } else {
        loadTeamLeaders() // Refresh list
      }
    } catch (error) {
      console.error('Error reactivating user:', error)
      alert('Failed to reactivate user. Please try again.')
    }
  }

  // Copy credentials to clipboard
  const copyCredentials = (text) => {
    navigator.clipboard.writeText(text)
    // Show a brief success indication
    alert('Copied to clipboard!')
  }

  // Copy full credentials
  const copyFullCredentials = (user) => {
    const credentials = `Email: ${user.email}\nPassword: ${user.password}`
    navigator.clipboard.writeText(credentials)
    alert('Credentials copied to clipboard!')
  }

  // Generate new password
  const generatePassword = () => {
    const newPassword = userManagement.generatePassword(12) // Longer password for better security
    setFormData(prev => ({ ...prev, password: newPassword }))
  }

  // Filter team leaders based on search and status
  const filteredTeamLeaders = teamLeaders.filter(tl => {
    // Status filter
    if (filterStatus === 'active' && !tl.isActive) return false
    if (filterStatus === 'inactive' && tl.isActive) return false
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        tl.name.toLowerCase().includes(search) ||
        tl.email.toLowerCase().includes(search) ||
        (tl.phone && tl.phone.includes(search))
      )
    }
    
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Leader Management</h2>
          <p className="text-gray-600">Create and manage team leader accounts</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Add Team Leader</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Team Leaders</p>
                <p className="text-2xl font-bold">{teamLeaders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {teamLeaders.filter(tl => tl.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold">
                  {teamLeaders.filter(tl => !tl.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Leaders List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Leaders</CardTitle>
          <CardDescription>Manage team leader accounts and credentials</CardDescription>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({teamLeaders.length})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active ({teamLeaders.filter(tl => tl.isActive).length})
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive ({teamLeaders.filter(tl => !tl.isActive).length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTeamLeaders.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No team leaders match your search criteria' 
                  : 'No team leaders found'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamLeaders.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCredentials({ ...showCredentials, [user.id]: !showCredentials[user.id] })}
                          title="View credentials"
                        >
                          {showCredentials[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteDialog(true)
                            }}
                            title="Deactivate user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReactivate(user.id)}
                            title="Reactivate user"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Team Leader Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team Leader</DialogTitle>
            <DialogDescription>
              Add a new team leader with login credentials
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
              {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
              {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
              {formErrors.phone && <p className="text-sm text-red-600">{formErrors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Auto-generated if empty"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
            </div>

            {formErrors.submit && (
              <Alert>
                <AlertDescription className="text-red-600">{formErrors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Team Leader'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Display */}
      {createdUser && (
        <Dialog open={!!createdUser} onOpenChange={() => setCreatedUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Team Leader Created Successfully
              </DialogTitle>
              <DialogDescription>
                Save these credentials securely. The team leader will use them to log in to the Financify platform.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* User Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Account Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Name:</span>
                    <span className="text-blue-900">{createdUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Email:</span>
                    <span className="text-blue-900">{createdUser.email}</span>
                  </div>
                  {createdUser.phone && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 font-medium">Phone:</span>
                      <span className="text-blue-900">{createdUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Login Credentials */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Login Credentials
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Input value={createdUser.email} readOnly className="bg-white" />
                      <Button size="sm" variant="outline" onClick={() => copyCredentials(createdUser.email)} title="Copy email">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Password</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={createdUser.password} 
                        readOnly 
                        className="bg-white font-mono text-lg tracking-wider" 
                      />
                      <Button size="sm" variant="outline" onClick={() => copyCredentials(createdUser.password)} title="Copy password">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => copyFullCredentials(createdUser)}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy All Credentials
                  </Button>
                </div>
              </div>
              
              <Alert className="border-yellow-300 bg-yellow-50">
                <Shield className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Important Security Notice:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Share these credentials securely with the team leader</li>
                    <li>The password cannot be recovered later</li>
                    <li>Recommend the team leader to change their password after first login</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                copyFullCredentials(createdUser)
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy & Close
              </Button>
              <Button onClick={() => setCreatedUser(null)}>
                I've Saved the Credentials
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Team Leader</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {selectedUser?.name}? They will no longer be able to access the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeactivate(selectedUser?.id)}>
              Deactivate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
