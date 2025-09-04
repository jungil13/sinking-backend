import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testMemberDashboard() {
  try {
    console.log('Testing Member Dashboard API...\n');
    
    // First, let's login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'member1', // or any valid member username
      password: 'admin123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Test the member dashboard endpoint
      console.log('\n2. Testing member dashboard...');
      const dashboardResponse = await axios.get(`${API_BASE}/member/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (dashboardResponse.data.success) {
        console.log('✅ Dashboard API working!');
        console.log('\nDashboard Data:');
        console.log('Stats:', JSON.stringify(dashboardResponse.data.data.stats, null, 2));
        console.log('Recent Activities:', JSON.stringify(dashboardResponse.data.data.recentActivities, null, 2));
      } else {
        console.log('❌ Dashboard API failed:', dashboardResponse.data.message);
      }
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMemberDashboard();
