#!/usr/bin/env python3
"""
Test script to verify the warm transfer system is working correctly.
Run this script to test all components and endpoints.
"""

import asyncio
import httpx
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

class WarmTransferTester:
    def __init__(self):
        self.session_data: Dict[str, Any] = {}
        
    async def test_server_health(self) -> bool:
        """Test if the server is running"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{BASE_URL}/")
                if response.status_code == 200:
                    print("✅ Server is running")
                    return True
                else:
                    print(f"❌ Server health check failed: {response.status_code}")
                    return False
        except Exception as e:
            print(f"❌ Server is not running: {e}")
            return False
    
    async def test_create_call(self) -> bool:
        """Test creating a new call session"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{BASE_URL}/api/create-call",
                    json={"caller_id": "test_caller_123"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.session_data = data
                    print("✅ Call creation successful")
                    print(f"   Session ID: {data.get('session_id')}")
                    print(f"   Room Name: {data.get('room_name')}")
                    return True
                else:
                    print(f"❌ Call creation failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    return False
        except Exception as e:
            print(f"❌ Call creation error: {e}")
            return False
    
    async def test_add_context(self) -> bool:
        """Test adding context to the call"""
        if not self.session_data.get('session_id'):
            print("❌ No session ID available for context test")
            return False
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{BASE_URL}/api/add-context",
                    json={
                        "session_id": self.session_data['session_id'],
                        "message": "Customer is asking about billing issues and wants to upgrade their plan."
                    }
                )
                
                if response.status_code == 200:
                    print("✅ Context addition successful")
                    return True
                else:
                    print(f"❌ Context addition failed: {response.status_code}")
                    return False
        except Exception as e:
            print(f"❌ Context addition error: {e}")
            return False
    
    async def test_initiate_transfer(self) -> bool:
        """Test initiating a warm transfer"""
        if not self.session_data.get('session_id'):
            print("❌ No session ID available for transfer test")
            return False
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{BASE_URL}/api/initiate-transfer",
                    json={
                        "session_id": self.session_data['session_id'],
                        "agent_b_id": "test_agent_b_456"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.session_data.update(data)
                    print("✅ Transfer initiation successful")
                    print(f"   Transfer Room: {data.get('transfer_room')}")
                    print(f"   Call Summary: {data.get('call_summary', 'N/A')[:100]}...")
                    return True
                else:
                    print(f"❌ Transfer initiation failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    return False
        except Exception as e:
            print(f"❌ Transfer initiation error: {e}")
            return False
    
    async def test_complete_transfer(self) -> bool:
        """Test completing the warm transfer"""
        if not self.session_data.get('session_id'):
            print("❌ No session ID available for transfer completion test")
            return False
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{BASE_URL}/api/complete-transfer",
                    json={"session_id": self.session_data['session_id']}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print("✅ Transfer completion successful")
                    print(f"   Message: {data.get('message')}")
                    return True
                else:
                    print(f"❌ Transfer completion failed: {response.status_code}")
                    return False
        except Exception as e:
            print(f"❌ Transfer completion error: {e}")
            return False
    
    async def test_call_status(self) -> bool:
        """Test getting call status"""
        if not self.session_data.get('session_id'):
            print("❌ No session ID available for status test")
            return False
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{BASE_URL}/api/call-status/{self.session_data['session_id']}"
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print("✅ Call status retrieval successful")
                    print(f"   Status: {data.get('status')}")
                    print(f"   Agent A: {data.get('agent_a')}")
                    print(f"   Agent B: {data.get('agent_b')}")
                    return True
                else:
                    print(f"❌ Call status retrieval failed: {response.status_code}")
                    return False
        except Exception as e:
            print(f"❌ Call status retrieval error: {e}")
            return False
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Warm Transfer System Tests")
        print("=" * 50)
        
        tests = [
            ("Server Health", self.test_server_health),
            ("Create Call", self.test_create_call),
            ("Add Context", self.test_add_context),
            ("Initiate Transfer", self.test_initiate_transfer),
            ("Complete Transfer", self.test_complete_transfer),
            ("Call Status", self.test_call_status),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Testing: {test_name}")
            try:
                result = await test_func()
                if result:
                    passed += 1
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {e}")
        
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Your warm transfer system is working perfectly!")
        else:
            print("⚠️  Some tests failed. Check the logs above for details.")
        
        return passed == total

async def main():
    tester = WarmTransferTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
