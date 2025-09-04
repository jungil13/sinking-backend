import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAdminDashboard() {
  try {
    console.log('Testing Admin Dashboard API...\n');

    // First, let's login as admin to get a token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });

    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;

      // Test getting admin dashboard data
      console.log('\n2. Testing get admin dashboard...');
      const dashboardResponse = await axios.get(`${API_BASE}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (dashboardResponse.data.success) {
        console.log('✅ Admin dashboard API working!');
        console.log('\n📊 Dashboard Data:');
        console.log('Stats:', JSON.stringify(dashboardResponse.data.data.stats, null, 2));
        console.log('\nPending Approvals:', dashboardResponse.data.data.pendingApprovals.length);
        console.log('Recent Transactions:', dashboardResponse.data.data.recentTransactions.length);
        console.log('Monthly Overview:', dashboardResponse.data.data.monthlyOverview.length, 'months');
        
        // Show some sample data
        if (dashboardResponse.data.data.pendingApprovals.length > 0) {
          console.log('\n📋 Sample Pending Approval:');
          console.log(JSON.stringify(dashboardResponse.data.data.pendingApprovals[0], null, 2));
        }
        
        if (dashboardResponse.data.data.recentTransactions.length > 0) {
          console.log('\n💳 Sample Recent Transaction:');
          console.log(JSON.stringify(dashboardResponse.data.data.recentTransactions[0], null, 2));
        }
      } else {
        console.log('❌ Admin dashboard API failed:', dashboardResponse.data.message);
      }
    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Make sure you are logged in as an admin user');
    }
  }
}

testAdminDashboard();
