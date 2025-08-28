#!/usr/bin/env python3
"""
Backend API Test Suite for Smart Finance & Workforce Tracker
Tests all core API endpoints and business logic
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import os

# Get base URL from environment
BASE_URL = "https://orgfinance.preview.emergentagent.com/api"

class FinanceTrackerAPITest:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.created_event_id = None
        self.created_assignment_id = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_api_health_check(self):
        """Test 1: API Health Check - GET /api/"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "Smart Finance & Workforce Tracker API" in data.get('message', ''):
                    self.log_result("API Health Check", True, "API is active and responding correctly")
                    return True
                else:
                    self.log_result("API Health Check", False, "API responding but incorrect message", data)
                    return False
            else:
                self.log_result("API Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("API Health Check", False, "Connection failed", str(e))
            return False
    
    def test_dashboard_stats(self):
        """Test 2: Dashboard Stats - GET /api/dashboard/stats"""
        try:
            response = requests.get(f"{self.base_url}/dashboard/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['totalEvents', 'openEvents', 'completedEvents', 'totalRevenue', 'totalWages', 'totalHours', 'activeAssignments']
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_result("Dashboard Stats", True, f"All required metrics present: {list(data.keys())}")
                    return True
                else:
                    self.log_result("Dashboard Stats", False, f"Missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("Dashboard Stats", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Dashboard Stats", False, "Request failed", str(e))
            return False
    
    def test_users_management(self):
        """Test 3: Users Management - GET /api/users"""
        try:
            response = requests.get(f"{self.base_url}/users", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if users have required fields and roles
                    user = data[0]
                    required_fields = ['id', 'email', 'name', 'role']
                    missing_fields = [field for field in required_fields if field not in user]
                    
                    if not missing_fields:
                        roles = [u.get('role') for u in data]
                        has_admin = 'admin' in roles
                        has_team_leader = 'team_leader' in roles
                        
                        if has_admin and has_team_leader:
                            self.log_result("Users Management", True, f"Found {len(data)} users with proper roles (admin & team_leader)")
                            return True
                        else:
                            self.log_result("Users Management", False, f"Missing required roles. Found: {set(roles)}")
                            return False
                    else:
                        self.log_result("Users Management", False, f"Users missing fields: {missing_fields}", user)
                        return False
                else:
                    self.log_result("Users Management", False, "No users found or invalid response format", data)
                    return False
            else:
                self.log_result("Users Management", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Users Management", False, "Request failed", str(e))
            return False
    
    def test_events_get(self):
        """Test 4a: Events CRUD - GET /api/events"""
        try:
            response = requests.get(f"{self.base_url}/events", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        event = data[0]
                        required_fields = ['id', 'title', 'client', 'eventDate', 'location', 'status']
                        missing_fields = [field for field in required_fields if field not in event]
                        
                        if not missing_fields:
                            # Check for nested responses and assignments
                            has_responses = 'responses' in event
                            has_assignments = 'assignments' in event
                            self.log_result("Events GET", True, f"Found {len(data)} events with proper structure (responses: {has_responses}, assignments: {has_assignments})")
                            return True
                        else:
                            self.log_result("Events GET", False, f"Events missing fields: {missing_fields}", event)
                            return False
                    else:
                        self.log_result("Events GET", True, "No events found (empty list is valid)")
                        return True
                else:
                    self.log_result("Events GET", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Events GET", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Events GET", False, "Request failed", str(e))
            return False
    
    def test_events_create(self):
        """Test 4b: Events CRUD - POST /api/events"""
        try:
            # Create test event data
            future_date = (datetime.now() + timedelta(days=7)).isoformat()
            event_data = {
                "title": "Test Corporate Event",
                "client": "Test Client Ltd",
                "eventType": "Corporate Event",
                "eventDate": future_date,
                "location": "Test Venue, Mumbai",
                "staffNeeded": 5,
                "expectedRevenue": 25000.00,
                "budgetAllocated": 18000.00,
                "requirements": "Audio/Visual setup required",
                "createdBy": "admin-1"
            }
            
            response = requests.post(f"{self.base_url}/events", 
                                   json=event_data, 
                                   headers={'Content-Type': 'application/json'},
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('title') == event_data['title']:
                    self.created_event_id = data['id']
                    self.log_result("Events CREATE", True, f"Event created successfully with ID: {data['id']}")
                    return True
                else:
                    self.log_result("Events CREATE", False, "Event created but response invalid", data)
                    return False
            else:
                self.log_result("Events CREATE", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Events CREATE", False, "Request failed", str(e))
            return False
    
    def test_event_responses_create(self):
        """Test 5a: Event Response System - POST /api/events/{id}/responses"""
        if not self.created_event_id:
            self.log_result("Event Response CREATE", False, "No event ID available for testing")
            return False
            
        try:
            response_data = {
                "teamLeaderId": "tl-1",
                "available": True,
                "staffCount": 3,
                "message": "Available with 3 staff members for the event"
            }
            
            response = requests.post(f"{self.base_url}/events/{self.created_event_id}/responses",
                                   json=response_data,
                                   headers={'Content-Type': 'application/json'},
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('eventId') == self.created_event_id and data.get('teamLeaderId') == 'tl-1':
                    self.log_result("Event Response CREATE", True, f"Team Leader response created successfully")
                    return True
                else:
                    self.log_result("Event Response CREATE", False, "Response created but data invalid", data)
                    return False
            else:
                self.log_result("Event Response CREATE", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Event Response CREATE", False, "Request failed", str(e))
            return False
    
    def test_event_responses_get(self):
        """Test 5b: Event Response System - GET /api/events/{id}/responses"""
        if not self.created_event_id:
            self.log_result("Event Response GET", False, "No event ID available for testing")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/events/{self.created_event_id}/responses", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        response_item = data[0]
                        required_fields = ['id', 'eventId', 'teamLeaderId', 'available']
                        missing_fields = [field for field in required_fields if field not in response_item]
                        
                        if not missing_fields:
                            self.log_result("Event Response GET", True, f"Found {len(data)} responses with proper structure")
                            return True
                        else:
                            self.log_result("Event Response GET", False, f"Response missing fields: {missing_fields}", response_item)
                            return False
                    else:
                        self.log_result("Event Response GET", True, "No responses found (empty list is valid)")
                        return True
                else:
                    self.log_result("Event Response GET", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Event Response GET", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Event Response GET", False, "Request failed", str(e))
            return False
    
    def test_staff_assignment_create(self):
        """Test 6: Staff Assignment & Wage Calculation - POST /api/assignments"""
        if not self.created_event_id:
            self.log_result("Staff Assignment CREATE", False, "No event ID available for testing")
            return False
            
        try:
            assignment_data = {
                "eventId": self.created_event_id,
                "teamLeaderId": "tl-1",
                "staffAssigned": 3,
                "assignedHours": 8.5,  # Test overtime calculation
                "commission": 500.00,
                "notes": "Test assignment with overtime"
            }
            
            response = requests.post(f"{self.base_url}/assignments",
                                   json=assignment_data,
                                   headers={'Content-Type': 'application/json'},
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify wage calculation logic
                expected_base_pay = 350.00
                expected_overtime_hours = 8.5 - 7.0  # 1.5 hours
                expected_overtime_pay = expected_overtime_hours * 50.00  # 75.00
                expected_total_wage = expected_base_pay + expected_overtime_pay  # 425.00
                
                if (data.get('basePay') == expected_base_pay and 
                    data.get('overtimePay') == expected_overtime_pay and
                    data.get('totalWage') == expected_total_wage):
                    
                    self.created_assignment_id = data.get('id')
                    self.log_result("Staff Assignment CREATE", True, 
                                  f"Assignment created with correct wage calculation: Base ₹{expected_base_pay}, Overtime ₹{expected_overtime_pay}, Total ₹{expected_total_wage}")
                    return True
                else:
                    self.log_result("Staff Assignment CREATE", False, 
                                  f"Wage calculation incorrect. Expected: Base ₹{expected_base_pay}, Overtime ₹{expected_overtime_pay}, Total ₹{expected_total_wage}. Got: {data}")
                    return False
            else:
                self.log_result("Staff Assignment CREATE", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Staff Assignment CREATE", False, "Request failed", str(e))
            return False
    
    def test_wage_calculation_standard_hours(self):
        """Test 6b: Wage Calculation for Standard Hours (7 hours = ₹350)"""
        if not self.created_event_id:
            self.log_result("Wage Calculation Standard", False, "No event ID available for testing")
            return False
            
        try:
            assignment_data = {
                "eventId": self.created_event_id,
                "teamLeaderId": "tl-2",
                "staffAssigned": 2,
                "assignedHours": 7.0,  # Standard hours
                "commission": 0.00,
                "notes": "Test standard hours wage calculation"
            }
            
            response = requests.post(f"{self.base_url}/assignments",
                                   json=assignment_data,
                                   headers={'Content-Type': 'application/json'},
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify standard wage calculation
                expected_base_pay = 350.00
                expected_overtime_pay = 0.00
                expected_total_wage = 350.00
                
                if (data.get('basePay') == expected_base_pay and 
                    data.get('overtimePay') == expected_overtime_pay and
                    data.get('totalWage') == expected_total_wage):
                    
                    self.log_result("Wage Calculation Standard", True, 
                                  f"Standard hours wage calculation correct: ₹{expected_total_wage} for 7 hours")
                    return True
                else:
                    self.log_result("Wage Calculation Standard", False, 
                                  f"Standard wage calculation incorrect. Expected: ₹{expected_total_wage}. Got: {data}")
                    return False
            else:
                self.log_result("Wage Calculation Standard", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Wage Calculation Standard", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Smart Finance & Workforce Tracker Backend API Tests")
        print("=" * 70)
        
        tests = [
            self.test_api_health_check,
            self.test_dashboard_stats,
            self.test_users_management,
            self.test_events_get,
            self.test_events_create,
            self.test_event_responses_create,
            self.test_event_responses_get,
            self.test_staff_assignment_create,
            self.test_wage_calculation_standard_hours
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
        
        print("\n" + "=" * 70)
        print(f"📊 TEST SUMMARY: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All backend API tests PASSED!")
            return True
        else:
            print(f"⚠️  {total - passed} tests FAILED")
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
            return False

if __name__ == "__main__":
    print(f"Testing API at: {BASE_URL}")
    tester = FinanceTrackerAPITest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)