#!/usr/bin/env python3
"""
Backend API Testing for Admin User Management Feature
Tests the admin user management APIs including authentication, user creation, and role updates.
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

class AdminUserManagementTester:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.admin_phone = "+919999999999"
        self.admin_name = "Dipak Parmar"
        self.admin_token = None
        self.admin_cookies = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def send_otp(self) -> bool:
        """Send OTP to admin phone number"""
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/send-otp",
                json={"phone": self.admin_phone, "name": self.admin_name},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    # In development mode, OTP is returned in response
                    self.otp = data.get("otp")
                    self.log_test("Send OTP", True, f"OTP sent successfully. OTP: {self.otp}")
                    return True
                else:
                    self.log_test("Send OTP", False, f"Failed to send OTP: {data.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test("Send OTP", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Send OTP", False, f"Exception: {str(e)}")
            return False

    def verify_otp_and_login(self) -> bool:
        """Verify OTP and get admin authentication token"""
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/verify-otp",
                json={"phone": self.admin_phone, "otp": self.otp, "name": self.admin_name},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.admin_token = data.get("token")
                    self.admin_cookies = response.cookies
                    user_info = data.get("user", {})
                    
                    if user_info.get("role") == "admin":
                        self.log_test("Admin Login", True, f"Admin logged in successfully", {
                            "user_id": user_info.get("id"),
                            "role": user_info.get("role"),
                            "has_token": bool(self.admin_token),
                            "has_cookies": bool(self.admin_cookies)
                        })
                        return True
                    else:
                        self.log_test("Admin Login", False, f"User role is {user_info.get('role')}, expected 'admin'")
                        return False
                else:
                    self.log_test("Admin Login", False, f"Login failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_get_all_users_as_admin(self) -> bool:
        """Test GET /api/admin/users as admin user"""
        try:
            response = requests.get(
                f"{self.base_url}/api/admin/users",
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                users = data.get("users", [])
                
                # Verify response structure
                if isinstance(users, list) and len(users) > 0:
                    # Check if admin user is in the list
                    admin_found = False
                    for user in users:
                        if user.get("phone") == self.admin_phone:
                            admin_found = True
                            # Verify required fields
                            required_fields = ["name", "phone", "role", "createdAt"]
                            missing_fields = [field for field in required_fields if field not in user]
                            
                            if missing_fields:
                                self.log_test("GET /api/admin/users", False, f"Missing fields in user object: {missing_fields}")
                                return False
                            break
                    
                    if admin_found:
                        self.log_test("GET /api/admin/users", True, f"Successfully fetched {len(users)} users", {
                            "user_count": len(users),
                            "admin_found": True,
                            "sample_user_fields": list(users[0].keys()) if users else []
                        })
                        return True
                    else:
                        self.log_test("GET /api/admin/users", False, "Admin user not found in users list")
                        return False
                else:
                    self.log_test("GET /api/admin/users", False, "No users returned or invalid response format")
                    return False
            else:
                self.log_test("GET /api/admin/users", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/users", False, f"Exception: {str(e)}")
            return False

    def test_get_users_unauthorized(self) -> bool:
        """Test GET /api/admin/users without authentication (should return 401)"""
        try:
            response = requests.get(f"{self.base_url}/api/admin/users", timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                self.log_test("GET /api/admin/users (Unauthorized)", True, "Correctly returned 401 for unauthenticated request", {
                    "status_code": response.status_code,
                    "error_message": data.get("error")
                })
                return True
            else:
                self.log_test("GET /api/admin/users (Unauthorized)", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/users (Unauthorized)", False, f"Exception: {str(e)}")
            return False

    def test_create_user_as_admin(self) -> bool:
        """Test POST /api/admin/users to create a new spa_owner user"""
        try:
            # Create a unique phone number for testing
            test_phone = f"+91{int(time.time()) % 10000000000}"
            test_user_data = {
                "name": "Test Spa Owner",
                "phone": test_phone,
                "role": "spa_owner"
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users",
                json=test_user_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get("success"):
                    user_info = data.get("user", {})
                    self.test_user_id = user_info.get("id")  # Store for later tests
                    self.test_user_phone = test_phone
                    
                    self.log_test("POST /api/admin/users (Create User)", True, "Successfully created spa_owner user", {
                        "user_id": user_info.get("id"),
                        "name": user_info.get("name"),
                        "phone": user_info.get("phone"),
                        "role": user_info.get("role"),
                        "status_code": response.status_code
                    })
                    return True
                else:
                    self.log_test("POST /api/admin/users (Create User)", False, f"Creation failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test("POST /api/admin/users (Create User)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users (Create User)", False, f"Exception: {str(e)}")
            return False

    def test_create_duplicate_user(self) -> bool:
        """Test POST /api/admin/users with duplicate phone number (should return 400)"""
        try:
            duplicate_user_data = {
                "name": "Duplicate User",
                "phone": self.test_user_phone,  # Use the same phone as previous test
                "role": "customer"
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users",
                json=duplicate_user_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                error_message = data.get("error", "")
                if "already exists" in error_message.lower():
                    self.log_test("POST /api/admin/users (Duplicate Phone)", True, "Correctly rejected duplicate phone number", {
                        "status_code": response.status_code,
                        "error_message": error_message
                    })
                    return True
                else:
                    self.log_test("POST /api/admin/users (Duplicate Phone)", False, f"Wrong error message: {error_message}")
                    return False
            else:
                self.log_test("POST /api/admin/users (Duplicate Phone)", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users (Duplicate Phone)", False, f"Exception: {str(e)}")
            return False

    def test_create_user_invalid_role(self) -> bool:
        """Test POST /api/admin/users with invalid role (should return 400)"""
        try:
            invalid_user_data = {
                "name": "Invalid Role User",
                "phone": f"+91{int(time.time()) % 10000000000}",
                "role": "invalid_role"
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users",
                json=invalid_user_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                error_message = data.get("error", "")
                if "invalid role" in error_message.lower():
                    self.log_test("POST /api/admin/users (Invalid Role)", True, "Correctly rejected invalid role", {
                        "status_code": response.status_code,
                        "error_message": error_message
                    })
                    return True
                else:
                    self.log_test("POST /api/admin/users (Invalid Role)", False, f"Wrong error message: {error_message}")
                    return False
            else:
                self.log_test("POST /api/admin/users (Invalid Role)", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users (Invalid Role)", False, f"Exception: {str(e)}")
            return False

    def test_create_user_missing_fields(self) -> bool:
        """Test POST /api/admin/users with missing required fields (should return 400)"""
        try:
            incomplete_user_data = {
                "name": "Incomplete User"
                # Missing phone and role
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users",
                json=incomplete_user_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                error_message = data.get("error", "")
                if "required" in error_message.lower():
                    self.log_test("POST /api/admin/users (Missing Fields)", True, "Correctly rejected missing required fields", {
                        "status_code": response.status_code,
                        "error_message": error_message
                    })
                    return True
                else:
                    self.log_test("POST /api/admin/users (Missing Fields)", False, f"Wrong error message: {error_message}")
                    return False
            else:
                self.log_test("POST /api/admin/users (Missing Fields)", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users (Missing Fields)", False, f"Exception: {str(e)}")
            return False

    def test_update_user_role(self) -> bool:
        """Test POST /api/admin/users/update-role to update user role"""
        try:
            if not hasattr(self, 'test_user_id'):
                self.log_test("POST /api/admin/users/update-role", False, "No test user ID available from previous test")
                return False
                
            update_data = {
                "userId": self.test_user_id,
                "newRole": "customer"
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users/update-role",
                json=update_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    user_info = data.get("user", {})
                    message = data.get("message", "")
                    
                    if user_info.get("role") == "customer":
                        self.log_test("POST /api/admin/users/update-role", True, "Successfully updated user role", {
                            "user_id": user_info.get("id"),
                            "old_role": "spa_owner",
                            "new_role": user_info.get("role"),
                            "message": message
                        })
                        return True
                    else:
                        self.log_test("POST /api/admin/users/update-role", False, f"Role not updated correctly: {user_info.get('role')}")
                        return False
                else:
                    self.log_test("POST /api/admin/users/update-role", False, f"Update failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test("POST /api/admin/users/update-role", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users/update-role", False, f"Exception: {str(e)}")
            return False

    def test_update_role_invalid_user(self) -> bool:
        """Test POST /api/admin/users/update-role with invalid user ID (should return 404)"""
        try:
            update_data = {
                "userId": "507f1f77bcf86cd799439011",  # Valid ObjectId format but non-existent
                "newRole": "spa_owner"
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users/update-role",
                json=update_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 404:
                data = response.json()
                error_message = data.get("error", "")
                if "not found" in error_message.lower():
                    self.log_test("POST /api/admin/users/update-role (Invalid User)", True, "Correctly returned 404 for non-existent user", {
                        "status_code": response.status_code,
                        "error_message": error_message
                    })
                    return True
                else:
                    self.log_test("POST /api/admin/users/update-role (Invalid User)", False, f"Wrong error message: {error_message}")
                    return False
            else:
                self.log_test("POST /api/admin/users/update-role (Invalid User)", False, f"Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users/update-role (Invalid User)", False, f"Exception: {str(e)}")
            return False

    def test_update_role_invalid_role(self) -> bool:
        """Test POST /api/admin/users/update-role with invalid role (should return 400)"""
        try:
            if not hasattr(self, 'test_user_id'):
                self.log_test("POST /api/admin/users/update-role (Invalid Role)", False, "No test user ID available")
                return False
                
            update_data = {
                "userId": self.test_user_id,
                "newRole": "invalid_role"
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users/update-role",
                json=update_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                error_message = data.get("error", "")
                if "invalid role" in error_message.lower():
                    self.log_test("POST /api/admin/users/update-role (Invalid Role)", True, "Correctly rejected invalid role", {
                        "status_code": response.status_code,
                        "error_message": error_message
                    })
                    return True
                else:
                    self.log_test("POST /api/admin/users/update-role (Invalid Role)", False, f"Wrong error message: {error_message}")
                    return False
            else:
                self.log_test("POST /api/admin/users/update-role (Invalid Role)", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users/update-role (Invalid Role)", False, f"Exception: {str(e)}")
            return False

    def test_update_role_missing_params(self) -> bool:
        """Test POST /api/admin/users/update-role with missing parameters (should return 400)"""
        try:
            update_data = {
                "userId": self.test_user_id if hasattr(self, 'test_user_id') else "test"
                # Missing newRole
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/users/update-role",
                json=update_data,
                cookies=self.admin_cookies,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                error_message = data.get("error", "")
                if "required" in error_message.lower():
                    self.log_test("POST /api/admin/users/update-role (Missing Params)", True, "Correctly rejected missing parameters", {
                        "status_code": response.status_code,
                        "error_message": error_message
                    })
                    return True
                else:
                    self.log_test("POST /api/admin/users/update-role (Missing Params)", False, f"Wrong error message: {error_message}")
                    return False
            else:
                self.log_test("POST /api/admin/users/update-role (Missing Params)", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/admin/users/update-role (Missing Params)", False, f"Exception: {str(e)}")
            return False

    def create_non_admin_user_and_test_access(self) -> bool:
        """Create a non-admin user and test that they get 403 errors"""
        try:
            # First, create a customer user
            customer_phone = f"+91{int(time.time()) % 10000000000}"
            
            # Send OTP for customer
            otp_response = requests.post(
                f"{self.base_url}/api/auth/send-otp",
                json={"phone": customer_phone, "name": "Test Customer"},
                timeout=10
            )
            
            if otp_response.status_code != 200:
                self.log_test("Create Non-Admin User", False, "Failed to send OTP for customer user")
                return False
                
            customer_otp = otp_response.json().get("otp")
            
            # Verify OTP and login as customer
            login_response = requests.post(
                f"{self.base_url}/api/auth/verify-otp",
                json={"phone": customer_phone, "otp": customer_otp, "name": "Test Customer"},
                timeout=10
            )
            
            if login_response.status_code != 200:
                self.log_test("Create Non-Admin User", False, "Failed to login as customer user")
                return False
                
            customer_cookies = login_response.cookies
            customer_data = login_response.json()
            
            if customer_data.get("user", {}).get("role") != "customer":
                self.log_test("Create Non-Admin User", False, f"Expected customer role, got {customer_data.get('user', {}).get('role')}")
                return False
            
            # Now test that customer gets 403 when accessing admin endpoints
            test_results = []
            
            # Test GET /api/admin/users
            get_response = requests.get(f"{self.base_url}/api/admin/users", cookies=customer_cookies, timeout=10)
            test_results.append(("GET /api/admin/users", get_response.status_code == 403))
            
            # Test POST /api/admin/users
            post_response = requests.post(
                f"{self.base_url}/api/admin/users",
                json={"name": "Test", "phone": "+919876543210", "role": "customer"},
                cookies=customer_cookies,
                timeout=10
            )
            test_results.append(("POST /api/admin/users", post_response.status_code == 403))
            
            # Test POST /api/admin/users/update-role
            update_response = requests.post(
                f"{self.base_url}/api/admin/users/update-role",
                json={"userId": "507f1f77bcf86cd799439011", "newRole": "spa_owner"},
                cookies=customer_cookies,
                timeout=10
            )
            test_results.append(("POST /api/admin/users/update-role", update_response.status_code == 403))
            
            all_passed = all(result[1] for result in test_results)
            
            if all_passed:
                self.log_test("Non-Admin Access Control", True, "All admin endpoints correctly returned 403 for non-admin user", {
                    "customer_role": customer_data.get("user", {}).get("role"),
                    "test_results": {name: "403" if passed else f"Expected 403, got other" for name, passed in test_results}
                })
                return True
            else:
                failed_tests = [name for name, passed in test_results if not passed]
                self.log_test("Non-Admin Access Control", False, f"Some endpoints did not return 403: {failed_tests}")
                return False
                
        except Exception as e:
            self.log_test("Non-Admin Access Control", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all admin user management tests"""
        print("🚀 Starting Admin User Management API Tests")
        print("=" * 60)
        
        # Authentication tests
        if not self.send_otp():
            print("❌ Cannot proceed without OTP. Exiting.")
            return False
            
        if not self.verify_otp_and_login():
            print("❌ Cannot proceed without admin authentication. Exiting.")
            return False
        
        # Admin API tests
        tests = [
            self.test_get_all_users_as_admin,
            self.test_get_users_unauthorized,
            self.test_create_user_as_admin,
            self.test_create_duplicate_user,
            self.test_create_user_invalid_role,
            self.test_create_user_missing_fields,
            self.test_update_user_role,
            self.test_update_role_invalid_user,
            self.test_update_role_invalid_role,
            self.test_update_role_missing_params,
            self.create_non_admin_user_and_test_access
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            time.sleep(0.5)  # Small delay between tests
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Admin User Management APIs are working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed. Please check the issues above.")
            return False

def main():
    """Main function to run the tests"""
    tester = AdminUserManagementTester()
    success = tester.run_all_tests()
    
    # Print summary for easy parsing
    print("\n" + "=" * 60)
    print("SUMMARY FOR TEST_RESULT.MD:")
    print("=" * 60)
    
    failed_tests = [result for result in tester.test_results if not result["success"]]
    
    if success:
        print("✅ ALL ADMIN USER MANAGEMENT APIS WORKING")
        print("- GET /api/admin/users: ✅ Working")
        print("- POST /api/admin/users: ✅ Working") 
        print("- POST /api/admin/users/update-role: ✅ Working")
        print("- Authentication & Authorization: ✅ Working")
    else:
        print("❌ SOME ADMIN USER MANAGEMENT APIS FAILED")
        for test in failed_tests:
            print(f"- {test['test']}: ❌ {test['message']}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())