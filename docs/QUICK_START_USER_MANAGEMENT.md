# 🚀 Quick Start Guide: User Management

> **5-Minute Setup Guide for Creating Team Leaders**

---

## ⚡ Prerequisites (One-time Setup)

### 1. Run Database Migration
Open Supabase SQL Editor and execute:

```sql
-- Add password column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Set default password for existing users
UPDATE users 
SET password = 'demo123' 
WHERE password IS NULL;
```

✅ **Done!** You're ready to create team leaders.

---

## 👤 Creating Your First Team Leader

### Step 1: Login as Admin (10 seconds)
```
URL: http://localhost:3000
Email: admin@company.com
Password: (any text)
```

### Step 2: Open User Management (5 seconds)
- Click **"User Management"** tab in the admin dashboard

### Step 3: Create Team Leader (30 seconds)
1. Click **"Add Team Leader"** button
2. Fill in the form:
   ```
   Name: John Doe
   Email: john.doe@company.com
   Phone: +91-9876543210
   Password: (leave empty)
   ```
3. Click **"Generate"** button (auto-creates secure password)
4. Click **"Create Team Leader"**

### Step 4: Save Credentials (15 seconds)
1. Credentials dialog appears
2. Click **"Copy All Credentials"** button
3. Paste into secure location (email, password manager, etc.)
4. Click **"I've Saved the Credentials"**

✅ **Done!** Team leader account created.

---

## 🔑 Sharing Credentials with Team Leader

### Option 1: Email (Recommended)
```
Subject: Your Financify Platform Access

Hi [Name],

Your account has been created for the Financify platform.

Login URL: http://your-domain.com
Email: [email]
Password: [password]

Please change your password after first login.

Best regards,
Admin Team
```

### Option 2: Secure Message
Use your organization's secure messaging system to share credentials.

### Option 3: In-Person
Show the credentials dialog and have the team leader note them down.

---

## 🎯 What Team Leaders Can Do

Once logged in, team leaders can:

✅ **View Available Events**
- See all open events
- Check event details, location, and requirements

✅ **Respond to Events**
- Indicate availability
- Specify staff count they can provide
- Add messages/notes

✅ **Track Assignments**
- View assigned events
- See assignment details
- Track status

✅ **Monitor Earnings**
- View wage breakdowns
- Check payment status
- See historical earnings

✅ **Team Communication**
- Access secure chat
- Communicate with admin and other team leaders

---

## 🔧 Common Admin Tasks

### Search for a Team Leader
1. Go to User Management tab
2. Type name, email, or phone in search box
3. Results filter automatically

### Filter by Status
Click filter buttons:
- **All**: Shows all team leaders
- **Active**: Shows only active accounts
- **Inactive**: Shows only deactivated accounts

### Deactivate a Team Leader
1. Find the user in the list
2. Click the **trash icon** (🗑️)
3. Confirm deactivation
4. User can no longer login

### Reactivate a Team Leader
1. Click **"Inactive"** filter
2. Find the user
3. Click the **checkmark icon** (✓)
4. User can login again

---

## 📋 Best Practices

### ✅ Do's
- Generate passwords automatically for better security
- Save credentials immediately after creation
- Share credentials through secure channels
- Deactivate users instead of deleting
- Use search to find users quickly
- Review inactive users periodically

### ❌ Don'ts
- Don't share credentials in plain text emails (unless encrypted)
- Don't reuse passwords across accounts
- Don't forget to save credentials before closing dialog
- Don't create accounts with fake emails
- Don't delete users (use deactivate instead)

---

## 🐛 Troubleshooting

### "User with this email already exists"
**Solution**: The email is already registered. Use a different email or check if user already exists.

### Team Leader Can't Login
**Check:**
1. Email is spelled correctly
2. Password is correct (case-sensitive)
3. Account is Active (not deactivated)
4. Database migration was run

### Credentials Not Copying
**Solution**: 
- Manual copy: Select text and Ctrl+C
- Try different browser
- Check clipboard permissions

### Can't See User Management Tab
**Solution**: Make sure you're logged in as admin, not team leader.

---

## 📊 Quick Reference

### Password Requirements
- **Length**: 12 characters (auto-generated)
- **Characters**: Letters + Numbers
- **Security**: Randomly generated

### User Statuses
| Status | Meaning | Can Login? |
|--------|---------|------------|
| Active | Account enabled | ✅ Yes |
| Inactive | Account disabled | ❌ No |

### Filter Counts
```
All      → Total team leaders
Active   → Can login
Inactive → Cannot login
```

---

## 🎬 Video Tutorial (Coming Soon)

_Placeholder for video walkthrough of user creation process_

---

## 📞 Need Help?

### Documentation
- 📖 [Full User Management Guide](./USER_MANAGEMENT_README.md)
- 🧪 [Testing Guide](./USER_MANAGEMENT_TEST_GUIDE.md)
- 🔄 [Workflow Diagrams](./USER_MANAGEMENT_WORKFLOW.md)
- ⚙️ [Implementation Details](./USER_MANAGEMENT_IMPLEMENTATION.md)

### Support
- 💬 Contact: Admin Support Team
- 📧 Email: support@yourcompany.com
- 🐛 Report Issues: GitHub Issues

---

## 🎓 Next Steps

Once comfortable with basic user management:

1. **Bulk Operations** - Create multiple users
2. **User Editing** - Update user information
3. **Advanced Filtering** - Complex search queries
4. **Reporting** - Export user lists
5. **Security** - Implement password policies

---

**Remember**: Always save credentials securely before closing the dialog! They cannot be recovered later.

---

_Last Updated: October 2025 | Version 1.0_
