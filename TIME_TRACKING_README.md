# 🕐 Time Tracking & Salary Calculation System

## Overview
The Finance Tracker now includes comprehensive time tracking functionality that allows team leaders to record their actual entry and exit times for events. This ensures accurate salary calculations based on real hours worked rather than estimated hours.

## ✨ New Features Added

### 1. **Time Tracking Form**
- **Entry Time**: Record when staff started working
- **Exit Time**: Record when staff finished working
- **Automatic Hours Calculation**: System calculates actual hours worked
- **Real-time Wage Preview**: See salary breakdown before submitting

### 2. **Enhanced Database Schema**
- Added `entryTime` and `exitTime` fields to `staff_assignments` table
- Automatic `actualHours` calculation based on time difference
- Status updates to 'completed' when time is tracked

### 3. **Updated UI Components**
- **Team Leader Dashboard**: New "Track Time" button for assignments
- **Admin Dashboard**: Time tracking column showing entry/exit times
- **Real-time Updates**: Immediate reflection of time changes

## 🚀 How to Use

### **For Team Leaders:**

1. **Login** with your team leader account (e.g., `john@company.com`)
2. **Go to "My Assignments"** tab
3. **Click "Track Time"** button on any assigned event
4. **Enter Entry Time**: When you started working
   - Use the "Now" button for current time
   - Or manually select date and time
5. **Enter Exit Time**: When you finished working
   - Use the "Now" button for current time
   - Or manually select date and time
6. **Review Calculation**: System shows:
   - Total hours worked
   - Standard hours (up to 7)
   - Overtime hours (beyond 7)
   - Wage breakdown
7. **Submit**: Click "Update Time Tracking"

### **For Admins:**

1. **Login** with admin account (`admin@company.com`)
2. **Go to "Assignments & Wages"** tab
3. **View Time Tracking Column**: Shows entry/exit times for each assignment
4. **Monitor Completion**: See which assignments have time tracked
5. **Review Wages**: Accurate calculations based on actual hours

## 💰 Salary Calculation Rules

### **Base Structure:**
- **Standard Duty**: 7 hours = ₹350 base pay
- **Overtime Rate**: ₹50 per hour (beyond 7 hours)

### **Examples:**
```
7 hours worked = ₹350 (base pay only)
8 hours worked = ₹400 (₹350 + ₹50 overtime)
10 hours worked = ₹500 (₹350 + ₹150 overtime)
12 hours worked = ₹600 (₹350 + ₹250 overtime)
```

### **Automatic Updates:**
- When time is tracked, wages are recalculated automatically
- Assignment status changes to 'completed'
- Overtime is calculated and added to base pay

## 🗄️ Database Migration

### **If you have an existing database:**

1. **Run the migration script** in Supabase SQL Editor:
   ```sql
   -- Copy and paste content from database_migration.sql
   ```

2. **Verify the changes**:
   - Check that `entryTime` and `exitTime` columns exist
   - Confirm existing data is preserved

### **For new installations:**
- Use the updated `database_setup.sql` which includes time tracking fields

## 🔧 Technical Implementation

### **New API Endpoints:**
```
PUT /api/assignments/{id}/time
Body: {
  "entryTime": "2025-01-20T09:00:00Z",
  "exitTime": "2025-01-20T17:30:00Z",
  "actualHours": 8.5
}
```

### **New Components:**
- `TimeTrackingForm`: Main time entry interface
- Enhanced `TeamLeaderDashboard`: Time tracking integration
- Enhanced `AdminDashboard`: Time tracking display

### **Database Functions:**
- `updateAssignmentTime()`: Updates time and recalculates wages
- Automatic status management
- Real-time wage calculations

## 📱 User Experience Features

### **Smart Time Entry:**
- **"Now" Buttons**: Quick current time entry
- **Validation**: Ensures exit time is after entry time
- **Real-time Preview**: See wage impact as you type

### **Visual Indicators:**
- **Green Play Icon**: Entry time
- **Red Square Icon**: Exit time
- **Status Badges**: Completed, Pending, etc.
- **Overtime Highlights**: Orange badges for overtime hours

### **Responsive Design:**
- Works on desktop, tablet, and mobile
- Touch-friendly interface for field operations
- Clear visual hierarchy and feedback

## 🎯 Business Benefits

### **Accuracy:**
- **100% Accurate** wage calculations based on real hours
- **Eliminates Guesswork** from salary processing
- **Transparent Breakdown** of base pay vs overtime

### **Efficiency:**
- **Real-time Updates** without manual calculations
- **Automated Status Management** (assigned → completed)
- **Instant Wage Calculations** for payroll processing

### **Compliance:**
- **Audit Trail** of actual work hours
- **Legal Compliance** for wage calculations
- **Transparent Records** for disputes

## 🚨 Important Notes

### **Data Integrity:**
- Entry time must be before exit time
- System validates time ranges automatically
- Cannot edit time after assignment is marked as 'paid'

### **Status Flow:**
```
assigned → in_progress → completed → paid
```
- Time tracking automatically moves status to 'completed'
- Admin can then mark as 'paid' when payment is processed

### **Backup & Recovery:**
- Always backup your database before running migrations
- Test in development environment first
- Monitor for any data inconsistencies

## 🔮 Future Enhancements

### **Planned Features:**
- **GPS Location Tracking** for field verification
- **Photo Verification** of work completion
- **Break Time Tracking** for long shifts
- **Mobile App** for easier time entry
- **Integration** with payroll systems

### **Advanced Analytics:**
- **Productivity Metrics** based on time vs output
- **Cost Analysis** by event type and duration
- **Performance Benchmarks** for team leaders

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify database migration was successful
3. Ensure all components are properly imported
4. Test with demo accounts first

---

**Time tracking is now fully integrated into your Finance Tracker system!** 🎉

Team leaders can accurately record their work hours, and admins get real-time visibility into actual time worked and accurate wage calculations.
