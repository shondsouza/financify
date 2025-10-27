import jsPDF from 'jspdf'

export const generateWageSlipPDF = async (assignment) => {
  const pdf = new jsPDF()
  
  // Add company header
  pdf.setFontSize(20)
  pdf.text('Smart Finance & Workforce Tracker', 20, 30)
  pdf.setFontSize(16)
  pdf.text('Wage Slip', 20, 45)
  
  // Add date
  pdf.setFontSize(10)
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 55)
  
  // Employee details
  pdf.setFontSize(12)
  pdf.text(`Team Leader: ${assignment.teamLeader?.name || 'Unknown'}`, 20, 75)
  pdf.text(`Event: ${assignment.event?.title || assignment.eventTitle || 'N/A'}`, 20, 85)
  pdf.text(`Client: ${assignment.event?.client || assignment.client || 'N/A'}`, 20, 95)
  pdf.text(`Date: ${new Date(assignment.event?.eventDate || assignment.eventDate || new Date()).toLocaleDateString('en-IN')}`, 20, 105)
  pdf.text(`Location: ${assignment.event?.location || assignment.location || 'N/A'}`, 20, 115)
  
  // Hours breakdown
  pdf.text('Hours Breakdown:', 20, 135)
  const actualHours = assignment.actualHours || assignment.assignedHours || 0
  const standardHours = Math.min(actualHours, 7)
  const overtimeHours = Math.max(actualHours - 7, 0)
  
  pdf.text(`Regular Hours: ${standardHours}`, 30, 145)
  if (overtimeHours > 0) {
    pdf.text(`Overtime Hours: ${overtimeHours}`, 30, 155)
  }
  pdf.text(`Staff Managed: ${assignment.staffAssigned || assignment.staffCount || 0}`, 30, 165)
  
  // Wage calculation
  pdf.text('Wage Calculation:', 20, 185)
  const basePay = assignment.basePay || 350
  const overtimePay = assignment.overtimePay || 0
  const tlCommission = assignment.tlCommission || ((assignment.staffAssigned || assignment.staffCount || 0) * 25)
  const totalWage = assignment.totalWage || (basePay + overtimePay + tlCommission)
  
  pdf.text(`Base Pay (Rs.350 for 7hrs): Rs.${basePay.toFixed(2)}`, 30, 195)
  if (overtimePay > 0) {
    pdf.text(`Overtime Pay (Rs.50/hr): Rs.${overtimePay.toFixed(2)}`, 30, 205)
  }
  pdf.text(`TL Commission (Rs.25/staff): Rs.${tlCommission.toFixed(2)}`, 30, 215)
  
  // Total wage
  pdf.setFontSize(14)
  pdf.text(`Total Wage: Rs.${totalWage.toFixed(2)}`, 20, 235)
  
  // Add signature line
  pdf.setFontSize(10)
  pdf.text('Authorized Signature: _________________', 20, 255)
  pdf.text('Date: _________________', 20, 265)
  
  // Add footer
  pdf.setFontSize(8)
  pdf.text('This is a computer generated wage slip.', 20, 280)
  pdf.text('For any discrepancies, contact the administration.', 20, 285)
  
  // Save PDF
  const fileName = `wage-slip-${(assignment.teamLeader?.name || 'unknown').replace(/\s+/g, '-').toLowerCase()}-${assignment.id}.pdf`
  pdf.save(fileName)
}
