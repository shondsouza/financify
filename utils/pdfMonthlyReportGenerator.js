import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generateMonthlyReport = async (monthData) => {
  try {
    // Validate monthData
    if (!monthData) {
      throw new Error('Month data is required')
    }

    const pdf = new jsPDF()
  
  // Colors
  const primaryColor = [59, 130, 246]
  const successColor = [16, 185, 129]
  const warningColor = [245, 158, 11]
  
  // Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.rect(0, 0, 210, 45, 'F')
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(26)
  pdf.setFont(undefined, 'bold')
  pdf.text('MONTHLY FINANCIAL REPORT', 105, 20, { align: 'center' })
  
  pdf.setFontSize(14)
  pdf.text(`${monthData.monthYear}`, 105, 30, { align: 'center' })
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 105, 38, { align: 'center' })
  
  pdf.setTextColor(0, 0, 0)
  
  // Executive Summary
  let yPos = 65
  pdf.setFontSize(16)
  pdf.setFont(undefined, 'bold')
  pdf.text('EXECUTIVE SUMMARY', 20, yPos)
  
  yPos += 15
  
  // Summary metrics in colored boxes
  const summaryMetrics = [
    { label: 'Total Events', value: monthData.totalEvents, color: primaryColor },
    { label: 'Total Revenue', value: `₹${monthData.totalRevenue.toLocaleString()}`, color: successColor },
    { label: 'Total Wages', value: `₹${monthData.totalWages.toLocaleString()}`, color: warningColor },
    { label: 'Net Profit', value: `₹${(monthData.totalRevenue - monthData.totalWages).toLocaleString()}`, color: successColor }
  ]
  
  summaryMetrics.forEach((metric, index) => {
    const x = 20 + (index % 2) * 85
    const y = yPos + Math.floor(index / 2) * 25
    
    pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2])
    pdf.rect(x, y, 80, 20, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text(metric.label, x + 5, y + 8)
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text(metric.value, x + 5, y + 15)
    pdf.setFont(undefined, 'normal')
  })
  
  pdf.setTextColor(0, 0, 0)
  yPos += 60
  
  // Event Performance Table
  pdf.setFontSize(16)
  pdf.setFont(undefined, 'bold')
  pdf.text('EVENT PERFORMANCE', 20, yPos)
  yPos += 10
  
  const eventTableData = (monthData.events || []).map(event => [
    event.title || 'N/A',
    event.client || 'N/A',
    new Date(event.eventDate || new Date()).toLocaleDateString('en-IN'),
    (event.staffCount || 0).toString(),
    `₹${(event.revenue || 0).toLocaleString()}`,
    `₹${(event.wages || 0).toLocaleString()}`,
    `₹${((event.revenue || 0) - (event.wages || 0)).toLocaleString()}`
  ])
  
  try {
    pdf.autoTable({
      startY: yPos,
      head: [['Event', 'Client', 'Date', 'Staff', 'Revenue', 'Wages', 'Profit']],
      body: eventTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    })
  } catch (autoTableError) {
    console.warn('AutoTable plugin not available for events table:', autoTableError)
    // Fallback to manual table
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.text('Event Performance:', 20, yPos)
    yPos += 10
    
    eventTableData.forEach((row, index) => {
      pdf.setFont(undefined, 'normal')
      pdf.text(`${row[0]} - ${row[1]}: ${row[6]}`, 25, yPos)
      yPos += 6
    })
    yPos += 10
  }
  
  // Add new page if needed
  pdf.addPage()
  
  // Team Leader Performance
  yPos = 30
  pdf.setFontSize(16)
  pdf.setFont(undefined, 'bold')
  pdf.text('TEAM LEADER PERFORMANCE', 20, yPos)
  yPos += 10
  
  const tlTableData = (monthData.teamLeaders || []).map(tl => [
    tl.name || 'Unknown',
    (tl.eventsAssigned || 0).toString(),
    `${tl.totalHours || 0} hrs`,
    `₹${(tl.totalEarnings || 0).toLocaleString()}`,
    `${tl.avgRating || 0}/5`,
    tl.efficiency || 'N/A'
  ])
  
  try {
    pdf.autoTable({
      startY: yPos,
      head: [['Team Leader', 'Events', 'Hours', 'Earnings', 'Rating', 'Efficiency']],
      body: tlTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'center' }
      },
      margin: { left: 15, right: 15 }
    })
  } catch (autoTableError) {
    console.warn('AutoTable plugin not available for team leaders table:', autoTableError)
    // Fallback to manual table
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.text('Team Leader Performance:', 20, yPos)
    yPos += 10
    
    tlTableData.forEach((row, index) => {
      pdf.setFont(undefined, 'normal')
      pdf.text(`${row[0]}: ${row[3]} (${row[1]} events)`, 25, yPos)
      yPos += 6
    })
    yPos += 10
  }
  
  // Save
  const fileName = `monthly-report-${(monthData.monthYear || 'Unknown').replace(' ', '-')}.pdf`
  pdf.save(fileName)
  
  return fileName
  
  } catch (error) {
    console.error('Error generating monthly report:', error)
    throw new Error(`Failed to generate monthly report: ${error.message}`)
  }
}
