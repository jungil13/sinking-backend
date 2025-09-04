import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test the registration API endpoints
async function testRegistrationAPI() {
  try {
    console.log('🧪 Testing Registration API...\n');

    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful\n');

    // Test getting registrations
    console.log('2. Testing GET /api/admin/registrations...');
    const registrationsResponse = await axios.get(`${API_BASE}/admin/registrations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Registrations fetched successfully');
    console.log(`📊 Found ${registrationsResponse.data.length} registrations:`);
    registrationsResponse.data.forEach(reg => {
      console.log(`   - ${reg.name} (${reg.email}) - Status: ${reg.status}`);
    });
    console.log('');

    // Test getting registration stats
    console.log('3. Testing GET /api/admin/registrations/stats...');
    const statsResponse = await axios.get(`${API_BASE}/admin/registrations/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Registration stats fetched successfully');
    console.log('📈 Statistics:', statsResponse.data);
    console.log('');

    console.log('🎉 All tests passed! Registration API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRegistrationAPI();
