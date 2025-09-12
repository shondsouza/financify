'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, Clock, Users, IndianRupee, TrendingUp } from 'lucide-react'

const WageBreakdownDisplay = ({ assignment, actualHours, staffCount }) => {
  const calculateDetailedWages = () => {
    // Base calculation
    const standardHours = 7
    const baseRate = 350
    const overtimeRate = 50
    const tlCommissionPerStaff = 25
    
    // Hours breakdown
    const regularHours = Math.min(actualHours, standardHours)
    const overtimeHours = Math.max(actualHours - standardHours, 0)
    
    // Pay calculations
    const basePay = (regularHours / standardHours) * baseRate
    const overtimePay = overtimeHours * overtimeRate
    const tlCommission = staffCount * tlCommissionPerStaff
    
    // Totals
    const grossWage = basePay + overtimePay
    const totalEarnings = grossWage + tlCommission
    
    // Efficiency metrics
    const hourlyRate = totalEarnings / actualHours
    const productivityBonus = overtimeHours > 0 ? overtimeHours * 10 : 0 // Bonus for overtime
    
    return {
      regularHours,
      overtimeHours,
      basePay,
      overtimePay,
      tlCommission,
      grossWage,
      totalEarnings,
      hourlyRate,
      productivityBonus,
      breakdown: {
        baseCalculation: `${regularHours} hours × ₹${(baseRate/standardHours).toFixed(2)}/hr`,
        overtimeCalculation: overtimeHours > 0 ? `${overtimeHours} hours × ₹${overtimeRate}/hr` : null,
        commissionCalculation: `${staffCount} staff × ₹${tlCommissionPerStaff}/staff`
      }
    }
  }

  const wages = calculateDetailedWages()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hours Breakdown Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Clock className="h-5 w-5" />
            Hours Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium">Regular Hours</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {wages.regularHours} / 7 hrs
            </Badge>
          </div>
          {wages.overtimeHours > 0 && (
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="font-medium">Overtime Hours</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                +{wages.overtimeHours} hrs
              </Badge>
            </div>
          )}
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="font-medium">Total Hours</span>
            <Badge className="bg-blue-600 text-white">
              {actualHours} hrs
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Wage Calculation Card */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Calculator className="h-5 w-5" />
            Wage Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <div>
                <span className="font-medium">Base Pay</span>
                <p className="text-xs text-gray-600">{wages.breakdown.baseCalculation}</p>
              </div>
              <span className="font-bold text-green-600">₹{wages.basePay.toFixed(2)}</span>
            </div>
            
            {wages.overtimePay > 0 && (
              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div>
                  <span className="font-medium">Overtime Pay</span>
                  <p className="text-xs text-gray-600">{wages.breakdown.overtimeCalculation}</p>
                </div>
                <span className="font-bold text-orange-600">₹{wages.overtimePay.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <div>
                <span className="font-medium">TL Commission</span>
                <p className="text-xs text-gray-600">{wages.breakdown.commissionCalculation}</p>
              </div>
              <span className="font-bold text-purple-600">₹{wages.tlCommission.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
              <div>
                <span className="font-bold text-lg">Total Earnings</span>
                <p className="text-xs opacity-90">₹{wages.hourlyRate.toFixed(2)}/hour average</p>
              </div>
              <span className="font-bold text-2xl">₹{wages.totalEarnings.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WageBreakdownDisplay
