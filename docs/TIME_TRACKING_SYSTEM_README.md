# Time Tracking & Wage Calculation System

## Overview
Complete time tracking and wage calculation system for the Smart Finance & Workforce Tracker. This system allows administrators to log actual work hours, calculate wages automatically, and generate professional PDF wage slips.

## Features

### ✅ Enhanced Time Tracking Form
- **Real-time wage calculation** with base pay, overtime, and TL commission
- **Break time tracking** (in minutes)
- **Admin notes** for additional comments
- **Automatic wage breakdown** showing:
  - Base pay: ₹350 for 7 hours
  - Overtime pay: ₹50 per hour beyond 7 hours
  - TL commission: ₹25 per staff member managed

### ✅ Time Management Dashboard
- **Filter tabs** for different assignment statuses:
  - Pending: Assignments needing time entry
  - Completed: Assignments with logged time
  - Paid: Assignments marked as paid
  - All: View all assignments
- **Real-time updates** when assignments are modified
- **Search and filter** capabilities

### ✅ Assignment Time Cards
- **Individual assignment management** with detailed information
- **Time entry modal** with enhanced form
- **PDF generation** for wage slips
- **Status management** (mark as paid)
- **Detailed view** with all assignment information

### ✅ PDF Wage Slip Generation
- **Professional formatting** with company branding
- **Complete wage breakdown** including all components
- **Automatic filename** generation
- **Signature lines** for authorization

### ✅ API Endpoints
- `GET /api/assignments/pending` - Get assignments needing time entry
- `GET /api/assignments/completed` - Get completed assignments
- `GET /api/assignments/paid` - Get paid assignments
- `PUT /api/assignments/[id]/time` - Update time tracking with wage calculation
- `PUT /api/assignments/[id]` - Update assignment status

## Database Schema Updates

### New Fields Added to `staff_assignments` Table:
```sql
-- Time tracking fields
entry_time TIMESTAMP
exit_time TIMESTAMP
break_time INTEGER DEFAULT 0
admin_notes TEXT

-- Wage calculation fields
base_pay DECIMAL(10,2) DEFAULT 350.00
overtime_pay DECIMAL(10,2) DEFAULT 0.00
tl_commission DECIMAL(10,2) DEFAULT 0.00
total_wage DECIMAL(10,2) DEFAULT 0.00

-- Tracking fields
logged_by UUID REFERENCES users(id)
logged_at TIMESTAMP
```

## User Flow

### 1. Admin Access
- Navigate to "Time Management" tab in admin dashboard
- View assignments by status (Pending, Completed, Paid, All)

### 2. Log Time for Assignment
- Click "Log Time" on any pending assignment
- Enter entry and exit times (or use "Now" buttons)
- Add break time if applicable
- Add admin notes if needed
- View real-time wage calculation
- Submit to save time entry

### 3. Generate Wage Slip
- Click "Generate PDF" on completed assignments
- PDF automatically downloads with professional formatting
- Contains complete wage breakdown and signature lines

### 4. Mark as Paid
- Click "Mark as Paid" on completed assignments
- Updates status to "paid" for payment tracking

## Wage Calculation Formula

```
Base Pay = ₹350 (for 7 hours)
Overtime Pay = (Actual Hours - 7) × ₹50
TL Commission = Staff Count × ₹25
Total Wage = Base Pay + Overtime Pay + TL Commission
```

## Components Structure

```
components/ui/
├── time-tracking-form.jsx          # Enhanced time entry form
├── time-management-dashboard.jsx   # Main dashboard with filters
├── assignment-time-card.jsx        # Individual assignment cards
└── admin-dashboard.jsx             # Updated with Time Management tab

utils/
└── pdfGenerator.js                 # PDF generation utility
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install jspdf html2canvas react-to-print
```

### 2. Database Migration
Run the migration script to add new fields:
```sql
-- Execute database_time_tracking_migration.sql
```

### 3. Environment Variables
Ensure your Supabase configuration is properly set up in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Examples

### Time Entry
```jsx
<TimeTrackingForm
  assignment={assignment}
  onTimeUpdate={handleTimeUpdate}
  onClose={handleClose}
/>
```

### Dashboard
```jsx
<TimeManagementDashboard />
```

### PDF Generation
```javascript
import { generateWageSlipPDF } from '@/utils/pdfGenerator'

// Generate PDF for an assignment
await generateWageSlipPDF(assignment)
```

## API Usage

### Get Pending Assignments
```javascript
const response = await fetch('/api/assignments/pending')
const assignments = await response.json()
```

### Update Time Tracking
```javascript
const response = await fetch(`/api/assignments/${assignmentId}/time`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entryTime: '2024-01-15T09:00:00',
    exitTime: '2024-01-15T17:30:00',
    actualHours: 8.5,
    breakTime: 30,
    adminNotes: 'Great work on the event setup'
  })
})
```

## Error Handling

- **Form validation** for required fields
- **API error handling** with user-friendly messages
- **PDF generation errors** with fallback options
- **Database constraint** validation

## Performance Optimizations

- **Real-time calculations** without API calls
- **Efficient database queries** with proper indexing
- **Lazy loading** for large assignment lists
- **Optimistic updates** for better UX

## Security Considerations

- **Input validation** on all forms
- **SQL injection prevention** with parameterized queries
- **Access control** for admin-only features
- **Data sanitization** before PDF generation

## Future Enhancements

- **Bulk time entry** for multiple assignments
- **Time tracking reports** and analytics
- **Email notifications** for completed assignments
- **Mobile app** for field time tracking
- **Integration** with payroll systems

## Troubleshooting

### Common Issues

1. **PDF not generating**: Check browser popup blockers
2. **Time calculation errors**: Verify entry/exit time format
3. **Database errors**: Ensure migration script was run
4. **API errors**: Check Supabase connection and permissions

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true')
```

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatibility**: Next.js 14+, React 18+, Supabase
