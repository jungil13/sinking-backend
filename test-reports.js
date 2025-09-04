import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testReports() {
  try {
    console.log('Testing Reports API...\n');

    // First, let's login as admin to get a token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });

    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;

      // Test getting reports data for different periods
      console.log('\n2. Testing get reports data for this month...');
      const monthResponse = await axios.get(`${API_BASE}/reports?period=month`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (monthResponse.data.success) {
        console.log('✅ Monthly reports API working!');
        console.log('\n📊 Monthly Reports Data:');
        console.log('Key Metrics:', JSON.stringify(monthResponse.data.data.keyMetrics, null, 2));
        console.log('Member Activity:', JSON.stringify(monthResponse.data.data.memberActivity, null, 2));
        console.log('Financial Summary:', JSON.stringify(monthResponse.data.data.financialSummary, null, 2));
        console.log('Recent Transactions:', monthResponse.data.data.recentTransactions.length);
        console.log('Monthly Overview:', monthResponse.data.data.monthlyOverview.length, 'months');
      } else {
        console.log('❌ Monthly reports API failed:', monthResponse.data.message);
      }

      // Test quarterly reports
      console.log('\n3. Testing get reports data for this quarter...');
      const quarterResponse = await axios.get(`${API_BASE}/reports?period=quarter`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (quarterResponse.data.success) {
        console.log('✅ Quarterly reports API working!');
        console.log('Quarterly data retrieved successfully');
      }

      // Test yearly reports
      console.log('\n4. Testing get reports data for this year...');
      const yearResponse = await axios.get(`${API_BASE}/reports?period=year`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (yearResponse.data.success) {
        console.log('✅ Yearly reports API working!');
        console.log('Yearly data retrieved successfully');
      }

      // Test custom date range
      console.log('\n5. Testing get reports data for custom date range...');
      const customResponse = await axios.get(`${API_BASE}/reports?period=custom&startDate=2024-01-01&endDate=2024-12-31`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (customResponse.data.success) {
        console.log('✅ Custom date range reports API working!');
        console.log('Custom date range data retrieved successfully');
      }

      // Test export functionality
      console.log('\n6. Testing export report...');
      const exportResponse = await axios.post(`${API_BASE}/reports/export`, {
        format: 'excel',
        period: 'month'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (exportResponse.data.success) {
        console.log('✅ Export reports API working!');
        console.log('Export Response:', exportResponse.data.message);
        console.log('Download URL:', exportResponse.data.data.downloadUrl);
      } else {
        console.log('❌ Export reports API failed:', exportResponse.data.message);
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

testReports();
