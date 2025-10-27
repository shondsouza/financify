import jsPDF from 'jspdf'

export const generateProfessionalInvoice = async (assignment) => {
  try {
    if (!assignment) {
      throw new Error('Assignment data is required')
    }

    const pdf = new jsPDF()
    
    // Color scheme matching the invoice image
    const primaryColor = [59, 130, 246] // Blue
    const textColor = [0, 0, 0] // Black
    const lightGray = [243, 244, 246] // Light gray for backgrounds
    
    // Helper functions
    const addLine = (x1, y1, x2, y2, color = primaryColor, width = 1) => {
      pdf.setDrawColor(color[0], color[1], color[2])
      pdf.setLineWidth(width)
      pdf.line(x1, y1, x2, y2)
    }
    
    const addColoredRect = (x, y, width, height, color) => {
      pdf.setFillColor(color[0], color[1], color[2])
      pdf.rect(x, y, width, height, 'F')
    }
    
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 10, fontStyle = 'normal', color = textColor, align = 'left' } = options
      pdf.setFontSize(fontSize)
      pdf.setFont(undefined, fontStyle)
      pdf.setTextColor(color[0], color[1], color[2])
      pdf.text(text, x, y, { align })
    }

    // Generate invoice number and dates
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`
    const issueDate = new Date().toLocaleDateString('en-GB')
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') // 30 days from now
    
    // Calculate wages properly
    const standardHours = 7
    const baseRate = 350
    const overtimeRate = 50
    const tlCommissionPerStaff = 25
    
    const actualHours = parseFloat(assignment.actualHours || assignment.assignedHours || 0)
    const regularHours = Math.min(actualHours, standardHours)
    const overtimeHours = Math.max(actualHours - standardHours, 0)
    
    // Fixed calculations
    const basePay = actualHours >= standardHours ? baseRate : (actualHours / standardHours) * baseRate
    const overtimePay = overtimeHours * overtimeRate
    const staffCount = parseInt(assignment.staffAssigned || assignment.staffCount || 0)
    const tlCommission = staffCount * tlCommissionPerStaff
    const subtotal = basePay + overtimePay + tlCommission
    
    // Calculate tax (assuming 5% GST)
    const taxRate = 0.05
    const tax = subtotal * taxRate
    const total = subtotal + tax
    
    // Calculate deposit (10% of total)
    const depositRate = 0.10
    const deposit = total * depositRate

    // Header Section
    addText('Smart Finance & Workforce Tracker', 20, 20, { fontSize: 16, fontStyle: 'bold' })
    addText('Professional Event Management Services', 20, 28, { fontSize: 10, color: [107, 114, 128] })
    addText('123 Business Street, Tech City, India 560001', 20, 34, { fontSize: 9, color: [107, 114, 128] })
    addText('Phone: +91-9876543210 | Email: admin@smartfinancetracker.com', 20, 40, { fontSize: 9, color: [107, 114, 128] })

    // Invoice Details (Top Right)
    addText('INVOICE', 150, 20, { fontSize: 20, fontStyle: 'bold', align: 'right' })
    addText(`Date Issued: ${issueDate}`, 150, 30, { fontSize: 10, align: 'right' })
    addText(`Invoice Number: ${invoiceNumber}`, 150, 36, { fontSize: 10, align: 'right' })
    addText(`Amount Due: Rs.${total.toFixed(2)}`, 150, 42, { fontSize: 12, fontStyle: 'bold', align: 'right' })
    addText(`Due Date: ${dueDate}`, 150, 48, { fontSize: 10, align: 'right' })

    // Billed To Section
    addText('Billed To:', 20, 65, { fontSize: 12, fontStyle: 'bold' })
    addText(assignment.event?.client || assignment.client || 'Event Client', 20, 72, { fontSize: 11, fontStyle: 'bold' })
    addText(assignment.event?.location || assignment.location || 'Event Location', 20, 78, { fontSize: 10 })
    addText('Event Management Services', 20, 84, { fontSize: 10 })
    addText('Phone: +91-9876543211', 20, 90, { fontSize: 10 })

    // Blue separator line
    addLine(20, 100, 190, 100, primaryColor, 2)

    // Services Table Header
    addText('DESCRIPTION', 20, 110, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
    addText('RATE', 100, 110, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
    addText('QTY', 130, 110, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
    addText('AMOUNT', 160, 110, { fontSize: 10, fontStyle: 'bold', color: primaryColor })

    // Services Table Content
    let yPos = 120

    // Base Service
    addText('Event Management Services', 20, yPos, { fontSize: 10, fontStyle: 'bold' })
    addText('Professional event coordination and staff management.', 20, yPos + 6, { fontSize: 9, color: [107, 114, 128] })
    addText(`Rs.${baseRate}`, 100, yPos, { fontSize: 10 })
    addText('1', 130, yPos, { fontSize: 10 })
    addText(`Rs.${basePay.toFixed(2)}`, 160, yPos, { fontSize: 10 })
    addText('+Tax', 100, yPos + 6, { fontSize: 8, color: [107, 114, 128] })
    yPos += 15

    // Overtime Service (if applicable)
    if (overtimeHours > 0) {
      addText('Overtime Services', 20, yPos, { fontSize: 10, fontStyle: 'bold' })
      addText('Additional hours beyond standard 7-hour duty.', 20, yPos + 6, { fontSize: 9, color: [107, 114, 128] })
      addText(`Rs.${overtimeRate}`, 100, yPos, { fontSize: 10 })
      addText(overtimeHours.toFixed(1), 130, yPos, { fontSize: 10 })
      addText(`Rs.${overtimePay.toFixed(2)}`, 160, yPos, { fontSize: 10 })
      addText('+Tax', 100, yPos + 6, { fontSize: 8, color: [107, 114, 128] })
      yPos += 15
    }

    // Team Leader Commission
    addText('Team Leadership', 20, yPos, { fontSize: 10, fontStyle: 'bold' })
    addText(`Management of ${staffCount} staff members for event execution.`, 20, yPos + 6, { fontSize: 9, color: [107, 114, 128] })
    addText(`Rs.${tlCommissionPerStaff}`, 100, yPos, { fontSize: 10 })
    addText(staffCount.toString(), 130, yPos, { fontSize: 10 })
    addText(`Rs.${tlCommission.toFixed(2)}`, 160, yPos, { fontSize: 10 })
    addText('+Tax', 100, yPos + 6, { fontSize: 8, color: [107, 114, 128] })
    yPos += 20

    // Blue separator line
    addLine(20, yPos, 190, yPos, primaryColor, 2)
    yPos += 10

    // Summary Section (Right aligned)
    const summaryX = 120
    addText('Subtotal:', summaryX, yPos, { fontSize: 10, align: 'right' })
    addText(`Rs.${subtotal.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
    yPos += 8

    addText('Tax (5% GST):', summaryX, yPos, { fontSize: 10, align: 'right' })
    addText(`+Rs.${tax.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
    yPos += 8

    addText('Total:', summaryX, yPos, { fontSize: 12, fontStyle: 'bold', align: 'right' })
    addText(`Rs.${total.toFixed(2)}`, 190, yPos, { fontSize: 12, fontStyle: 'bold', align: 'right' })
    yPos += 15

    // Blue separator line
    addLine(20, yPos, 190, yPos, primaryColor, 2)
    yPos += 10

    // Deposit Section
    addText('Deposit Requested:', summaryX, yPos, { fontSize: 10, align: 'right' })
    addText(`Rs.${deposit.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
    yPos += 8

    addText('Deposit Due:', summaryX, yPos, { fontSize: 10, fontStyle: 'bold', align: 'right' })
    addText(`Rs.${deposit.toFixed(2)}`, 190, yPos, { fontSize: 10, fontStyle: 'bold', align: 'right' })
    yPos += 20

    // Event Details Section
    addText('Event Details:', 20, yPos, { fontSize: 12, fontStyle: 'bold' })
    yPos += 10
    addText(`Event: ${assignment.event?.title || assignment.eventTitle || 'N/A'}`, 20, yPos, { fontSize: 10 })
    yPos += 6
    addText(`Date: ${new Date(assignment.event?.eventDate || assignment.eventDate || new Date()).toLocaleDateString('en-IN')}`, 20, yPos, { fontSize: 10 })
    yPos += 6
    addText(`Team Leader: ${assignment.teamLeader?.name || 'Unknown'}`, 20, yPos, { fontSize: 10 })
    yPos += 6
    addText(`Staff Managed: ${staffCount} people`, 20, yPos, { fontSize: 10 })
    yPos += 6
    addText(`Hours Worked: ${actualHours.toFixed(1)} hours`, 20, yPos, { fontSize: 10 })

    // Payment Terms
    yPos += 20
    addText('Payment Terms:', 20, yPos, { fontSize: 12, fontStyle: 'bold' })
    yPos += 10
    addText('• Payment due within 30 days of invoice date', 20, yPos, { fontSize: 9 })
    yPos += 6
    addText('• Late payments may incur additional charges', 20, yPos, { fontSize: 9 })
    yPos += 6
    addText('• For payment queries, contact admin@smartfinancetracker.com', 20, yPos, { fontSize: 9 })

    // Footer
    yPos = 280
    addLine(0, yPos, 210, yPos, [107, 114, 128], 1)
    addColoredRect(0, yPos, 210, 15, [107, 114, 128])
    addText('Thank you for your business!', 105, yPos + 8, { fontSize: 10, color: [255, 255, 255], align: 'center' })
    addText(`Document ID: ${assignment.id || 'N/A'} | Generated: ${new Date().toLocaleString('en-IN')}`, 105, yPos + 12, { fontSize: 8, color: [255, 255, 255], align: 'center' })

    // Save the PDF
    const teamLeaderName = (assignment.teamLeader?.name || 'Unknown').replace(/\s+/g, '-')
    const fileName = `invoice-${teamLeaderName}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    return fileName
    
  } catch (error) {
    console.error('Error generating professional invoice:', error)
    throw new Error(`Failed to generate invoice: ${error.message}`)
  }
}

// Additional function for wage slip (simpler version)
export const generateWageSlipInvoice = async (assignment) => {
  try {
    if (!assignment) {
      throw new Error('Assignment data is required')
    }

    const pdf = new jsPDF()
    
    // Color scheme
    const primaryColor = [59, 130, 246] // Blue
    const textColor = [0, 0, 0] // Black
    
    // Helper functions
    const addLine = (x1, y1, x2, y2, color = primaryColor, width = 1) => {
      pdf.setDrawColor(color[0], color[1], color[2])
      pdf.setLineWidth(width)
      pdf.line(x1, y1, x2, y2)
    }
    
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 10, fontStyle = 'normal', color = textColor, align = 'left' } = options
      pdf.setFontSize(fontSize)
      pdf.setFont(undefined, fontStyle)
      pdf.setTextColor(color[0], color[1], color[2])
      pdf.text(text, x, y, { align })
    }

    // Generate wage slip number
    const wageSlipNumber = `WS-${Date.now().toString().slice(-6)}`
    const issueDate = new Date().toLocaleDateString('en-GB')
    
    // Calculate wages properly
    const standardHours = 7
    const baseRate = 350
    const overtimeRate = 50
    const tlCommissionPerStaff = 25
    
    const actualHours = parseFloat(assignment.actualHours || assignment.assignedHours || 0)
    const regularHours = Math.min(actualHours, standardHours)
    const overtimeHours = Math.max(actualHours - standardHours, 0)
    
    // Fixed calculations
    const basePay = actualHours >= standardHours ? baseRate : (actualHours / standardHours) * baseRate
    const overtimePay = overtimeHours * overtimeRate
    const staffCount = parseInt(assignment.staffAssigned || assignment.staffCount || 0)
    const tlCommission = staffCount * tlCommissionPerStaff
    const subtotal = basePay + overtimePay + tlCommission
    
    // Calculate tax (assuming 5% GST)
    const taxRate = 0.05
    const tax = subtotal * taxRate
    const total = subtotal + tax

    // Header
    addText('WAGE SLIP', 105, 20, { fontSize: 20, fontStyle: 'bold', align: 'center' })
    addText('Smart Finance & Workforce Tracker', 105, 28, { fontSize: 12, align: 'center' })
    addText(`Generated: ${issueDate}`, 105, 34, { fontSize: 10, align: 'center' })

    // Employee Details
    addText('Employee Details:', 20, 50, { fontSize: 12, fontStyle: 'bold' })
    addText(`Name: ${assignment.teamLeader?.name || 'Unknown'}`, 20, 58, { fontSize: 10 })
    addText(`ID: ${(assignment.teamLeader?._id || assignment.id || 'N/A').toString().substring(0, 8).toUpperCase()}`, 20, 64, { fontSize: 10 })
    addText(`Event: ${assignment.event?.title || assignment.eventTitle || 'N/A'}`, 20, 70, { fontSize: 10 })
    addText(`Date: ${new Date(assignment.event?.eventDate || assignment.eventDate || new Date()).toLocaleDateString('en-IN')}`, 20, 76, { fontSize: 10 })

    // Wage Details Table
    addLine(20, 90, 190, 90, primaryColor, 2)
    addText('DESCRIPTION', 20, 100, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
    addText('HOURS', 100, 100, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
    addText('RATE', 130, 100, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
    addText('AMOUNT', 160, 100, { fontSize: 10, fontStyle: 'bold', color: primaryColor })

    let yPos = 110

    // Base Pay
    addText('Base Pay (7hrs)', 20, yPos, { fontSize: 10 })
    addText(regularHours.toFixed(1), 100, yPos, { fontSize: 10 })
    addText(`Rs.${baseRate}`, 130, yPos, { fontSize: 10 })
    addText(`Rs.${basePay.toFixed(2)}`, 160, yPos, { fontSize: 10 })
    yPos += 8

    // Overtime (if applicable)
    if (overtimeHours > 0) {
      addText('Overtime', 20, yPos, { fontSize: 10 })
      addText(overtimeHours.toFixed(1), 100, yPos, { fontSize: 10 })
      addText(`Rs.${overtimeRate}`, 130, yPos, { fontSize: 10 })
      addText(`Rs.${overtimePay.toFixed(2)}`, 160, yPos, { fontSize: 10 })
      yPos += 8
    }

    // TL Commission
    addText('Team Leader Commission', 20, yPos, { fontSize: 10 })
    addText(staffCount.toString(), 100, yPos, { fontSize: 10 })
    addText(`Rs.${tlCommissionPerStaff}`, 130, yPos, { fontSize: 10 })
    addText(`Rs.${tlCommission.toFixed(2)}`, 160, yPos, { fontSize: 10 })
    yPos += 15

    // Summary
    addLine(20, yPos, 190, yPos, primaryColor, 2)
    yPos += 10

    addText('Subtotal:', 120, yPos, { fontSize: 10, align: 'right' })
    addText(`Rs.${subtotal.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
    yPos += 8

    addText('Tax (5% GST):', 120, yPos, { fontSize: 10, align: 'right' })
    addText(`+Rs.${tax.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
    yPos += 8

    addText('Total Earnings:', 120, yPos, { fontSize: 12, fontStyle: 'bold', align: 'right' })
    addText(`Rs.${total.toFixed(2)}`, 190, yPos, { fontSize: 12, fontStyle: 'bold', align: 'right' })

    // Footer
    yPos = 280
    addLine(0, yPos, 210, yPos, [107, 114, 128], 1)
    addText('This is a system-generated wage slip.', 105, yPos + 8, { fontSize: 9, align: 'center' })
    addText(`Wage Slip #${wageSlipNumber}`, 105, yPos + 12, { fontSize: 8, align: 'center' })

    // Save the PDF
    const teamLeaderName = (assignment.teamLeader?.name || 'Unknown').replace(/\s+/g, '-')
    const fileName = `wage-slip-${teamLeaderName}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    return fileName
    
  } catch (error) {
    console.error('Error generating wage slip:', error)
    throw new Error(`Failed to generate wage slip: ${error.message}`)
  }
}
