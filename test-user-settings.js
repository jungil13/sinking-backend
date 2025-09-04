import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testUserSettings() {
  try {
    console.log('Testing User Settings API...\n');

    // First, let's login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin', // or any valid member username
      password: 'admin123'
    });

    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;

      // Test getting user profile
      console.log('\n2. Testing get user profile...');
      const profileResponse = await axios.get(`${API_BASE}/user/settings/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.data.success) {
        console.log('✅ Get profile API working!');
        console.log('Profile Data:', JSON.stringify(profileResponse.data.data, null, 2));
      } else {
        console.error('❌ Get profile API failed:', profileResponse.data.message);
      }

      // Test updating user profile
      console.log('\n3. Testing update user profile...');
      const updateData = {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        email: 'john.updated@email.com',
        phone: '+63 912 345 6789',
        address: '123 Updated Street, Quezon City, Metro Manila',
        employment: 'Senior Software Engineer',
        monthlyIncome: 80000,
        emergencyContact: 'Jane Doe Updated',
        emergencyPhone: '+63 923 456 7890'
      };

      const updateResponse = await axios.put(`${API_BASE}/user/settings/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (updateResponse.data.success) {
        console.log('✅ Update profile API working!');
        console.log('Update Response:', updateResponse.data.message);
      } else {
        console.error('❌ Update profile API failed:', updateResponse.data.message);
      }

      // Test changing password
      console.log('\n4. Testing change password...');
      const passwordData = {
        currentPassword: 'admin123',
        newPassword: 'newpassword123'
      };

      const passwordResponse = await axios.put(`${API_BASE}/user/settings/password`, passwordData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (passwordResponse.data.success) {
        console.log('✅ Change password API working!');
        console.log('Password Change Response:', passwordResponse.data.message);
      } else {
        console.error('❌ Change password API failed:', passwordResponse.data.message);
      }

      // Test password reset request
      console.log('\n5. Testing password reset request...');
      const resetResponse = await axios.post(`${API_BASE}/user/settings/password-reset`, {
        email: 'john.updated@email.com'
      });

      if (resetResponse.data.success) {
        console.log('✅ Password reset request API working!');
        console.log('Reset Response:', resetResponse.data.message);
      } else {
        console.error('❌ Password reset request API failed:', resetResponse.data.message);
      }

    } else {
      console.error('❌ Login failed: No token received.');
    }
  } catch (error) {
    console.error('🚨 API Test Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testUserSettings();
