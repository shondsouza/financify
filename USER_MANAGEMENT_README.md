# User Management System - Team Leader Creation

## Overview
The User Management system allows administrators to create, manage, and monitor team leader accounts who can access the Financify platform. This feature provides complete control over user access and credentials.

## Features

### ✅ Create Team Leaders
- **Full Account Creation**: Name, email, phone, and password
- **Auto-Generated Passwords**: Secure 12-character passwords generated automatically
- **Custom Passwords**: Option to set custom passwords
- **Email Validation**: Prevents duplicate email addresses
- **Instant Access**: Team leaders can log in immediately after creation

### ✅ Credential Management
- **Secure Display**: Credentials shown only once after creation
- **Copy to Clipboard**: One-click copy for email, password, or both
- **Security Warnings**: Clear instructions to save credentials securely
- **Password Privacy**: Passwords are stored and validated during login

### ✅ User Management Dashboard
- **Real-time Statistics**: Total, active, and inactive team leader counts
- **Search Functionality**: Search by name, email, or phone number
- **Status Filters**: View all, active only, or inactive only
- **User Actions**: View, edit, deactivate, or reactivate users

### ✅ User Status Management
- **Deactivate Users**: Prevent access without deleting the account
- **Reactivate Users**: Restore access to previously deactivated users
- **Status Indicators**: Clear visual badges for active/inactive status
- **Confirmation Dialogs**: Prevent accidental deactivation

## User Flow

### 1. Admin Creates Team Leader

**Step 1: Navigate to User Management**
- Log in as admin
- Go to Admin Dashboard
- Click on "User Management" tab

**Step 2: Add New Team Leader**
- Click "Add Team Leader" button
- Fill in the form:
  - Full Name (required)
  - Email Address (required, must be unique)
  - Phone Number (required)
  - Password (optional - auto-generated if left empty)
- Click "Generate" button for a secure random password
- Submit the form

**Step 3: Save Credentials**
- Credentials dialog appears with:
  - Team leader's name, email, and phone
  - Login email and password
  - Copy buttons for each field
- **Important**: Copy and save these credentials securely
- Click "I've Saved the Credentials" to close

### 2. Team Leader First Login

**Step 1: Access Platform**
- Navigate to the Financify platform
- Enter the email address provided by admin
- Enter the password provided by admin

**Step 2: Successful Login**
- System validates credentials
- Checks if account is active
- Redirects to Team Leader Dashboard

**Step 3: Platform Access**
Team leaders can now:
- View available events
- Respond to event requests
- Track their assignments
- View earnings and wage breakdowns
- Access team chat

## Technical Implementation

### Database Schema

**Password Column Added to Users Table:**
```sql
-- Migration: database_user_password_migration.sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;
```

### API Endpoints

#### POST /api/users
Create a new team leader account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91-9876543210",
  "password": "SecurePass123",
  "role": "team_leader"
}
```

**Response:**
```json
{
  "id": "tl-1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91-9876543210",
  "role": "team_leader",
  "isActive": true,
  "createdAt": "2025-10-23T10:30:00Z"
}
```

**Error Responses:**
- `400`: Missing required fields or duplicate email
- `500`: Server error

#### PUT /api/users/:id
Update team leader information or status

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+91-9876543211",
  "isActive": false
}
```

#### GET /api/users
Get all users (filtered by role in frontend)

### Authentication System

**Enhanced Login Flow:**
1. User enters email and password
2. System queries database by email
3. Checks if user exists and is active
4. Validates password:
   - Demo accounts (admin@company.com, john@company.com, etc.) accept any password
   - New team leaders require correct password match
5. On success, stores user in localStorage
6. Redirects to appropriate dashboard

**Security Notes:**
- Passwords are currently stored in plain text for demo purposes
- **Production Recommendation**: Implement bcrypt or similar hashing
- Add password reset functionality
- Implement session management with JWT tokens

### Components

**Main Component:**
- `components/ui/user-management.jsx` - Full user management interface

**Library Functions:**
- `lib/userManagement.js` - User CRUD operations
- `lib/supabase.js` - Database operations

**Authentication:**
- `components/ui/auth-form.jsx` - Enhanced login with password validation

## Usage Examples

### Create Team Leader Programmatically

```javascript
import { userManagement } from '@/lib/userManagement'

const createNewTeamLeader = async () => {
  const { data, error } = await userManagement.createTeamLeader({
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+91-9876543222',
    password: '' // Will auto-generate
  })

  if (error) {
    console.error('Failed to create team leader:', error.message)
  } else {
    console.log('Team leader created:', data)
    console.log('Password:', data.password)
  }
}
```

### Search and Filter Team Leaders

```javascript
// Search is handled automatically in the UI
// Filter by status
const activeTeamLeaders = teamLeaders.filter(tl => tl.isActive)
const inactiveTeamLeaders = teamLeaders.filter(tl => !tl.isActive)
```

### Deactivate User

```javascript
const deactivateUser = async (userId) => {
  const { error } = await userManagement.deactivateTeamLeader(userId)
  if (!error) {
    console.log('User deactivated successfully')
  }
}
```

### Reactivate User

```javascript
const reactivateUser = async (userId) => {
  const { error } = await userManagement.updateTeamLeader(userId, { 
    isActive: true 
  })
  if (!error) {
    console.log('User reactivated successfully')
  }
}
```

## Security Best Practices

### Current Implementation (Demo)
✅ Email validation prevents duplicates  
✅ Active status checking prevents unauthorized access  
✅ Credentials shown only once after creation  
✅ Copy to clipboard for secure sharing  

### Production Recommendations
🔒 **Password Hashing**: Use bcrypt to hash passwords  
🔒 **Password Strength**: Enforce minimum complexity requirements  
🔒 **Session Management**: Implement JWT tokens  
🔒 **Rate Limiting**: Prevent brute force attacks  
🔒 **2FA**: Add two-factor authentication  
🔒 **Password Reset**: Email-based password recovery  
🔒 **Audit Logging**: Track user creation and modifications  
🔒 **HTTPS Only**: Enforce secure connections  

## Migration Steps

### 1. Run Database Migration
Execute the SQL migration in Supabase:

```sql
-- File: database_user_password_migration.sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

UPDATE users 
SET password = 'demo123' 
WHERE password IS NULL;
```

### 2. Update Existing Users
For demo accounts, you can keep the "any password" behavior, or set specific passwords:

```sql
UPDATE users 
SET password = 'admin123' 
WHERE email = 'admin@company.com';

UPDATE users 
SET password = 'john123' 
WHERE email = 'john@company.com';
```

### 3. Test the System
1. Log out from any existing session
2. Try logging in with admin account
3. Create a new team leader
4. Log out and log in with the new team leader credentials
5. Verify dashboard access and permissions

## Troubleshooting

### Issue: "User with this email already exists"
**Solution**: The email is already registered. Use a different email or update the existing user.

### Issue: "Invalid email or password"
**Possible Causes:**
1. Wrong email address entered
2. Wrong password entered
3. Account has been deactivated
4. User doesn't exist in database

**Solution**: 
- Verify email and password are correct
- Check user status in admin dashboard
- Contact administrator if account is deactivated

### Issue: Credentials not copying to clipboard
**Solution**: 
- Some browsers block clipboard access
- Manually select and copy the credentials
- Use the "Copy All Credentials" button

### Issue: Password not validating on login
**Solution**:
- Ensure database migration was run
- Check that password field exists in users table
- Verify password is stored correctly

## Future Enhancements

### Planned Features
- [ ] Password strength meter
- [ ] Password reset via email
- [ ] User profile editing
- [ ] Role permissions management
- [ ] Bulk user import (CSV)
- [ ] User activity logs
- [ ] Email notifications on account creation
- [ ] Custom password policies
- [ ] Session timeout configuration
- [ ] Multi-factor authentication

### Advanced Features
- [ ] OAuth integration (Google, Microsoft)
- [ ] SSO (Single Sign-On)
- [ ] LDAP/Active Directory integration
- [ ] IP whitelisting
- [ ] Device management
- [ ] Password expiration policies

## API Documentation

### Complete API Reference

#### Authentication
All API calls should include the user's authentication token (to be implemented).

#### Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create new user |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |

## Support

For technical support or questions:
- Check the troubleshooting section above
- Review the main project README.md
- Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Compatibility**: Next.js 14+, Supabase PostgreSQL
