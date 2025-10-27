import jsPDF from 'jspdf'

// Simple PDF generator without autoTable dependency
export const generateSimpleWageSlip = async (assignment) => {
  try {
    if (!assignment) {
      throw new Error('Assignment data is required')
    }

    const pdf = new jsPDF()
    
    // Color scheme
    const primaryColor = [59, 130, 246] // Blue
    const accentColor = [59, 130, 246] // Blue (same as primary)
    
    // Helper function to add colored rectangle
    const addColoredRect = (x, y, width, height, color) => {
      pdf.setFillColor(color[0], color[1], color[2])
      pdf.rect(x, y, width, height, 'F')
    }
    
    // Header Section
    addColoredRect(0, 0, 210, 40, primaryColor)
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont(undefined, 'bold')
    pdf.text('WAGE SLIP', 105, 18, { align: 'center' })
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    pdf.text('Smart Finance & Workforce Tracker', 105, 28, { align: 'center' })
    pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 35, { align: 'center' })
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
    
    // Employee Information Section
    let yPos = 55
    addColoredRect(15, yPos - 5, 180, 8, [243, 244, 246])
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('EMPLOYEE INFORMATION', 20, yPos)
    
    yPos += 15
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'normal')
    
    const employeeInfo = [
      ['Team Leader Name:', assignment.teamLeader?.name || 'Unknown'],
      ['Employee ID:', (assignment.teamLeader?._id || assignment.id || 'N/A').toString().substring(0, 8).toUpperCase()],
      ['Email:', assignment.teamLeader?.email || 'Not provided'],
      ['Phone:', assignment.teamLeader?.phone || 'Not provided']
    ]
    
    employeeInfo.forEach(([label, value]) => {
      pdf.setFont(undefined, 'bold')
      pdf.text(label, 20, yPos)
      pdf.setFont(undefined, 'normal')
      pdf.text(value, 80, yPos)
      yPos += 7
    })
    
    // Event Information Section
    yPos += 10
    addColoredRect(15, yPos - 5, 180, 8, [243, 244, 246])
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('EVENT INFORMATION', 20, yPos)
    
    yPos += 15
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'normal')
    
    const eventInfo = [
      ['Event Title:', assignment.event?.title || assignment.eventTitle || 'N/A'],
      ['Client:', assignment.event?.client || assignment.client || 'N/A'],
      ['Event Date:', new Date(assignment.event?.eventDate || assignment.eventDate || new Date()).toLocaleDateString('en-IN')],
      ['Location:', assignment.event?.location || assignment.location || 'N/A'],
      ['Staff Managed:', `${assignment.staffAssigned || assignment.staffCount || 0} people`]
    ]
    
    eventInfo.forEach(([label, value]) => {
      pdf.setFont(undefined, 'bold')
      pdf.text(label, 20, yPos)
      pdf.setFont(undefined, 'normal')
      pdf.text(value, 80, yPos)
      yPos += 7
    })
    
    // Calculate wages
    const standardHours = 7
    const baseRate = 350
    const overtimeRate = 50
    const tlCommissionPerStaff = 25
    
    const actualHours = parseFloat(assignment.actualHours || assignment.assignedHours || 0)
    const regularHours = Math.min(actualHours, standardHours)
    const overtimeHours = Math.max(actualHours - standardHours, 0)
    
    const basePay = (regularHours / standardHours) * baseRate
    const overtimePay = overtimeHours * overtimeRate
    const staffCount = parseInt(assignment.staffAssigned || assignment.staffCount || 0)
    const tlCommission = staffCount * tlCommissionPerStaff
    const totalEarnings = basePay + overtimePay + tlCommission
    
    // Hours Breakdown Section
    yPos += 15
    addColoredRect(15, yPos - 5, 180, 8, [243, 244, 246])
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('HOURS BREAKDOWN', 20, yPos)
    
    yPos += 15
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'normal')
    
    // Hours breakdown table
    const hoursData = [
      { type: 'Regular Hours', hours: regularHours, rate: `Rs.${(baseRate/standardHours).toFixed(2)}/hr`, calculation: `${regularHours.toFixed(1)} x Rs.${(baseRate/standardHours).toFixed(2)}`, amount: `Rs.${basePay.toFixed(2)}` }
    ]
    
    if (overtimeHours > 0) {
      hoursData.push({
        type: 'Overtime Hours',
        hours: overtimeHours,
        rate: `Rs.${overtimeRate}/hr`,
        calculation: `${overtimeHours.toFixed(1)} x Rs.${overtimeRate}`,
        amount: `Rs.${overtimePay.toFixed(2)}`
      })
    }
    
    hoursData.push({
      type: 'TL Commission',
      hours: '-',
      rate: `Rs.${tlCommissionPerStaff}/staff`,
      calculation: `${staffCount} x Rs.${tlCommissionPerStaff}`,
      amount: `Rs.${tlCommission.toFixed(2)}`
    })
    
    // Draw table manually
    hoursData.forEach((row, index) => {
      const rowY = yPos + (index * 15)
      
      // Draw row background
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251)
        pdf.rect(15, rowY - 3, 180, 12, 'F')
      }
      
      // Draw borders
      pdf.setDrawColor(200, 200, 200)
      pdf.rect(15, rowY - 3, 180, 12)
      
      // Add text
      pdf.setFont(undefined, 'bold')
      pdf.text(row.type, 20, rowY + 3)
      pdf.setFont(undefined, 'normal')
      pdf.text(row.hours.toString(), 80, rowY + 3)
      pdf.text(row.rate, 100, rowY + 3)
      pdf.text(row.calculation, 140, rowY + 3)
      pdf.text(row.amount, 170, rowY + 3)
    })
    
    yPos += (hoursData.length * 15) + 20
    
    // Summary Section
    addColoredRect(15, yPos - 5, 180, 8, accentColor)
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('WAGE SUMMARY', 20, yPos)
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
    yPos += 15
    
    // Summary box
    addColoredRect(15, yPos, 180, 35, [219, 234, 254])
    pdf.setDrawColor(59, 130, 246)
    pdf.setLineWidth(2)
    pdf.rect(15, yPos, 180, 35)
    
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    pdf.text(`Gross Wage (Base + Overtime):`, 25, yPos + 10)
    pdf.text(`Rs.${(basePay + overtimePay).toFixed(2)}`, 160, yPos + 10)
    
    pdf.text(`Team Leader Commission:`, 25, yPos + 20)
    pdf.text(`Rs.${tlCommission.toFixed(2)}`, 160, yPos + 20)
    
    pdf.setFontSize(16)
    pdf.setFont(undefined, 'bold')
    pdf.text(`TOTAL EARNINGS:`, 25, yPos + 30)
    pdf.text(`Rs.${totalEarnings.toFixed(2)}`, 160, yPos + 30)
    
    // Performance Metrics
    yPos += 50
    addColoredRect(15, yPos - 5, 180, 8, [243, 244, 246])
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('PERFORMANCE METRICS', 20, yPos)
    
    yPos += 15
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'normal')
    
    const averageHourlyRate = actualHours > 0 ? totalEarnings / actualHours : 0
    const efficiencyRating = actualHours <= 8 ? 'Excellent' : actualHours <= 10 ? 'Good' : 'Overtime'
    
    const metricsInfo = [
      ['Average Hourly Rate:', `Rs.${averageHourlyRate.toFixed(2)}/hour`],
      ['Efficiency Rating:', efficiencyRating],
      ['Staff Productivity:', `Rs.${(totalEarnings/Math.max(staffCount, 1)).toFixed(2)} per staff managed`],
      ['Work Date:', new Date(assignment.loggedAt || new Date()).toLocaleDateString('en-IN')]
    ]
    
    metricsInfo.forEach(([label, value]) => {
      pdf.setFont(undefined, 'bold')
      pdf.text(label, 20, yPos)
      pdf.setFont(undefined, 'normal')
      pdf.text(value, 80, yPos)
      yPos += 7
    })
    
    // Save the PDF
    const teamLeaderName = (assignment.teamLeader?.name || 'Unknown').replace(/\s+/g, '-')
    const fileName = `wage-slip-${teamLeaderName}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    return fileName
    
  } catch (error) {
    console.error('Error generating simple PDF:', error)
    throw new Error(`Failed to generate PDF: ${error.message}`)
  }
}
