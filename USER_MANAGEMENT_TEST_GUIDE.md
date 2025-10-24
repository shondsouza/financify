# User Management Testing Guide

## Test Checklist for Team Leader Creation Feature

### Prerequisites
✅ Financify platform is running on http://localhost:3000  
✅ Database migration `database_user_password_migration.sql` has been executed in Supabase  
✅ Admin account exists (admin@company.com)

---

## Test Scenario 1: Create New Team Leader

### Steps:
1. **Login as Admin**
   - Navigate to http://localhost:3000
   - Login with: `admin@company.com` / any password
   - Verify you're redirected to Admin Dashboard

2. **Navigate to User Management**
   - Click on "User Management" tab in the admin dashboard
   - Verify you see the User Management interface with:
     - Stats cards (Total, Active, Inactive)
     - Team leaders list
     - "Add Team Leader" button

3. **Create New Team Leader**
   - Click "Add Team Leader" button
   - Fill in the form:
     ```
     Name: Test Leader
     Email: test.leader@company.com
     Phone: +91-9999999999
     Password: (leave empty to auto-generate)
     ```
   - Click "Generate" to see auto-generated password
   - Click "Create Team Leader"

4. **Save Credentials**
   - Verify credentials dialog appears
   - Check that it shows:
     - Account details (name, email, phone)
     - Login credentials (email and password)
     - Copy buttons for each field
     - Security warning
   - Click "Copy All Credentials"
   - Verify clipboard contains both email and password
   - Click "I've Saved the Credentials"

5. **Verify in List**
   - Check that the new team leader appears in the list
   - Verify status badge shows "Active"
   - Verify stats updated (Total count increased)

---

## Test Scenario 2: Login with New Team Leader

### Steps:
1. **Logout from Admin**
   - Click logout button in dashboard header
   - Verify you're redirected to login page

2. **Login with New Credentials**
   - Enter the email from step 1: `test.leader@company.com`
   - Enter the password you saved
   - Click "Sign In"

3. **Verify Access**
   - Verify you're redirected to Team Leader Dashboard
   - Check you can see:
     - Available events
     - Your assignments
     - Earnings section
   - Verify admin-only features are NOT accessible

---

## Test Scenario 3: Search and Filter

### Steps (as Admin):
1. **Login as Admin**
   - Login with admin@company.com

2. **Search Functionality**
   - Go to User Management tab
   - Type "Test" in search box
   - Verify only matching team leaders appear
   - Clear search and verify all users reappear

3. **Status Filters**
   - Click "Active" filter button
   - Verify only active users shown
   - Click "All" to see all users again

---

## Test Scenario 4: Deactivate User

### Steps (as Admin):
1. **Navigate to User Management**
   - Find the test leader created earlier
   - Click the trash icon (deactivate button)

2. **Confirm Deactivation**
   - Verify confirmation dialog appears
   - Check it shows user's name
   - Click "Deactivate"

3. **Verify Deactivation**
   - Check status badge changes to "Inactive"
   - Verify stats updated (Active count decreased, Inactive increased)

4. **Test Login Prevention**
   - Logout
   - Try to login with deactivated user credentials
   - Verify error message: "Your account has been deactivated"

---

## Test Scenario 5: Reactivate User

### Steps (as Admin):
1. **Login as Admin**
   - Login with admin@company.com

2. **Filter Inactive Users**
   - Click "Inactive" filter
   - Find the deactivated test leader

3. **Reactivate**
   - Click the checkmark icon (reactivate button)
   - Verify status changes to "Active"

4. **Test Login Works**
   - Logout
   - Login with the test leader credentials
   - Verify access is restored

---

## Test Scenario 6: Duplicate Email Prevention

### Steps (as Admin):
1. **Try to Create Duplicate**
   - Click "Add Team Leader"
   - Use email that already exists: `test.leader@company.com`
   - Fill other fields
   - Click "Create Team Leader"

2. **Verify Error**
   - Check error message appears: "User with this email already exists"
   - Verify user is NOT created in the list

---

## Test Scenario 7: Form Validation

### Steps (as Admin):
1. **Test Required Fields**
   - Click "Add Team Leader"
   - Leave name field empty
   - Click "Create Team Leader"
   - Verify error: "Name must be at least 2 characters"

2. **Test Email Validation**
   - Enter invalid email: "notanemail"
   - Verify error: "Valid email is required"

3. **Test Phone Validation**
   - Enter short phone: "123"
   - Verify error: "Valid phone number is required"

---

## Expected Results Summary

### ✅ Success Criteria:
- [x] Admin can create new team leaders
- [x] Auto-generated passwords are secure (12 characters)
- [x] Credentials are displayed only once after creation
- [x] Copy to clipboard works for all credentials
- [x] New team leaders can login immediately
- [x] Search filters team leaders by name, email, or phone
- [x] Status filters work correctly (All, Active, Inactive)
- [x] Deactivation prevents login
- [x] Reactivation restores access
- [x] Duplicate emails are prevented
- [x] Form validation works for all required fields
- [x] Stats update correctly when users are added/deactivated

### ❌ Known Limitations (Demo):
- Passwords stored in plain text (not hashed)
- No password reset functionality
- No email notifications
- Demo accounts accept any password

---

## Database Verification

### Check Users in Supabase:

```sql
-- View all team leaders
SELECT id, name, email, phone, role, "isActive", "createdAt", password
FROM users
WHERE role = 'team_leader'
ORDER BY "createdAt" DESC;

-- Count active vs inactive
SELECT 
  "isActive",
  COUNT(*) as count
FROM users
WHERE role = 'team_leader'
GROUP BY "isActive";
```

---

## Troubleshooting

### If tests fail:

1. **Database Migration Not Run**
   - Run `database_user_password_migration.sql` in Supabase SQL Editor

2. **API Errors**
   - Check browser console for errors
   - Check terminal for server errors
   - Verify Supabase credentials in `.env.local`

3. **Clipboard Not Working**
   - Try manual copy/paste
   - Check browser permissions for clipboard access

4. **Login Issues**
   - Verify user exists in database
   - Check user is active
   - Verify password matches exactly

---

## Performance Testing

### Recommended Tests:
- Create 50+ team leaders (test pagination/performance)
- Search with various terms (test search speed)
- Toggle filters rapidly (test UI responsiveness)
- Create users in rapid succession (test rate limiting)

---

## Security Testing

### Recommended Tests:
- Try SQL injection in form fields
- Test XSS attacks in name/email fields
- Attempt to access admin features as team leader
- Test session expiration
- Try to create admin users via API directly

---

**Test Date**: ___________  
**Tested By**: ___________  
**Environment**: Development / Staging / Production  
**All Tests Passed**: [ ] Yes [ ] No  

**Notes**:
_________________________________
_________________________________
_________________________________
