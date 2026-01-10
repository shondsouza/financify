# PDF Generation Troubleshooting Guide

## Common Issues and Solutions

### 1. **jsPDF AutoTable Plugin Issues**

**Problem**: `pdf.autoTable is not a function` or similar errors
**Solution**: The code now includes fallback mechanisms

```javascript
// The system automatically falls back to simple PDF generation
try {
  await generateProfessionalWageSlip(assignment)
} catch (error) {
  console.warn('Professional PDF generator failed, using simple generator:', error)
  await generateSimpleWageSlip(assignment)
}
```

### 2. **Data Validation Issues**

**Problem**: PDF generation fails due to missing or invalid data
**Solution**: Added comprehensive data validation

```javascript
// All generators now include validation
if (!assignment) {
  throw new Error('Assignment data is required')
}

const actualHours = parseFloat(assignment.actualHours || assignment.assignedHours || 0)
if (isNaN(actualHours) || actualHours < 0) {
  throw new Error('Invalid actual hours value')
}
```

### 3. **Browser Compatibility Issues**

**Problem**: PDF generation doesn't work in certain browsers
**Solution**: 
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check if popup blockers are enabled
- Verify that the browser supports PDF generation

### 4. **Import/Module Issues**

**Problem**: `Cannot resolve module 'jspdf-autotable'`
**Solution**: 
```bash
# Reinstall dependencies
npm install jspdf jspdf-autotable html2canvas react-to-print
```

### 5. **Memory Issues with Large PDFs**

**Problem**: Browser crashes when generating large PDFs
**Solution**: The simple PDF generator uses less memory and is more stable

## Debugging Steps

### Step 1: Check Browser Console
Open browser developer tools and look for errors:
```javascript
// Check for these common errors:
- "pdf.autoTable is not a function"
- "Cannot read property 'name' of undefined"
- "Invalid actual hours value"
```

### Step 2: Test with Sample Data
```javascript
// Test with minimal data
const testAssignment = {
  id: 'test-123',
  actualHours: 8,
  staffAssigned: 3,
  teamLeader: { name: 'Test User' },
  event: { title: 'Test Event', client: 'Test Client' }
}

await generateSimpleWageSlip(testAssignment)
```

### Step 3: Check Dependencies
```bash
# Verify all packages are installed
npm list jspdf jspdf-autotable html2canvas react-to-print
```

### Step 4: Test Individual Components
```javascript
// Test PDF generation in isolation
import { generateSimpleWageSlip } from '@/utils/simplePdfGenerator'

// This should work even if autoTable fails
await generateSimpleWageSlip(assignment)
```

## Error Handling Improvements

### 1. **Graceful Fallbacks**
- Professional PDF generator fails → Simple PDF generator
- AutoTable fails → Manual table generation
- Data missing → Default values

### 2. **User-Friendly Error Messages**
```javascript
try {
  await generateProfessionalWageSlip(assignment)
} catch (error) {
  console.error('Error generating PDF:', error)
  setError('Failed to generate PDF. Please try again.')
}
```

### 3. **Loading States**
```javascript
const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

// Show loading state during generation
{isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF Wage Slip'}
```

## Testing the PDF Generation

### 1. **Test with Different Data Scenarios**
```javascript
// Test with minimal data
const minimalAssignment = {
  id: 'test-1',
  actualHours: 7,
  staffAssigned: 1
}

// Test with overtime
const overtimeAssignment = {
  id: 'test-2',
  actualHours: 9,
  staffAssigned: 5
}

// Test with missing data
const incompleteAssignment = {
  id: 'test-3'
  // Missing other fields
}
```

### 2. **Test in Different Browsers**
- Chrome (recommended)
- Firefox
- Safari
- Edge

### 3. **Test on Different Devices**
- Desktop
- Mobile
- Tablet

## Performance Optimization

### 1. **Use Simple PDF Generator for Better Performance**
```javascript
// For better performance and compatibility
await generateSimpleWageSlip(assignment)
```

### 2. **Lazy Load PDF Generators**
```javascript
// Load PDF generators only when needed
const generatePDF = async () => {
  const { generateSimpleWageSlip } = await import('@/utils/simplePdfGenerator')
  await generateSimpleWageSlip(assignment)
}
```

## Common Solutions

### Solution 1: Clear Browser Cache
```bash
# Clear browser cache and reload
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Solution 2: Reinstall Dependencies
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Solution 3: Use Simple PDF Generator
```javascript
// Replace professional generator with simple one
import { generateSimpleWageSlip } from '@/utils/simplePdfGenerator'

// Use simple generator instead
await generateSimpleWageSlip(assignment)
```

### Solution 4: Check Assignment Data Structure
```javascript
// Ensure assignment has required fields
const validAssignment = {
  id: 'assignment-123',
  actualHours: 8.5,
  staffAssigned: 3,
  teamLeader: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  event: {
    title: 'Corporate Event',
    client: 'ABC Corp',
    eventDate: '2024-01-15',
    location: 'Mumbai'
  }
}
```

## Success Indicators

✅ **PDF downloads successfully**  
✅ **No console errors**  
✅ **All data displays correctly**  
✅ **Professional formatting**  
✅ **Works across all browsers**  

## Support

If you continue to experience issues:

1. Check the browser console for specific error messages
2. Test with the simple PDF generator first
3. Verify all required data is present
4. Try in a different browser
5. Clear browser cache and reload

The system is designed to be robust with multiple fallback mechanisms to ensure PDF generation works in all scenarios.
