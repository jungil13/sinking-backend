import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testNotifications() {
  try {
    console.log('Testing Notifications API...\n');

    // First, let's login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin', // or any valid member username
      password: 'admin123'
    });

    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;

      // Test getting user notifications
      console.log('\n2. Testing get user notifications...');
      const notificationsResponse = await axios.get(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (notificationsResponse.data.success) {
        console.log('✅ Get notifications API working!');
        console.log('Notifications Data:', JSON.stringify(notificationsResponse.data.data, null, 2));
      } else {
        console.error('❌ Get notifications API failed:', notificationsResponse.data.message);
      }

      // Test getting status updates
      console.log('\n3. Testing get status updates...');
      const statusResponse = await axios.get(`${API_BASE}/notifications/status-updates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statusResponse.data.success) {
        console.log('✅ Get status updates API working!');
        console.log('Status Updates Data:', JSON.stringify(statusResponse.data.data, null, 2));
      } else {
        console.error('❌ Get status updates API failed:', statusResponse.data.message);
      }

      // Test creating a notification
      console.log('\n4. Testing create notification...');
      const createResponse = await axios.post(`${API_BASE}/notifications`, {
        userID: loginResponse.data.user.id,
        title: 'Test Notification',
        message: 'This is a test notification created via API',
        type: 'info'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (createResponse.data.success) {
        console.log('✅ Create notification API working!');
        console.log('Created Notification ID:', createResponse.data.data.notificationID);
        
        const notificationID = createResponse.data.data.notificationID;

        // Test marking notification as read
        console.log('\n5. Testing mark notification as read...');
        const markReadResponse = await axios.put(`${API_BASE}/notifications/${notificationID}/read`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (markReadResponse.data.success) {
          console.log('✅ Mark notification as read API working!');
          console.log('Mark Read Response:', markReadResponse.data.message);
        } else {
          console.error('❌ Mark notification as read API failed:', markReadResponse.data.message);
        }

        // Test deleting notification
        console.log('\n6. Testing delete notification...');
        const deleteResponse = await axios.delete(`${API_BASE}/notifications/${notificationID}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (deleteResponse.data.success) {
          console.log('✅ Delete notification API working!');
          console.log('Delete Response:', deleteResponse.data.message);
        } else {
          console.error('❌ Delete notification API failed:', deleteResponse.data.message);
        }
      } else {
        console.error('❌ Create notification API failed:', createResponse.data.message);
      }

      // Test marking all notifications as read
      console.log('\n7. Testing mark all notifications as read...');
      const markAllReadResponse = await axios.put(`${API_BASE}/notifications/mark-all-read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (markAllReadResponse.data.success) {
        console.log('✅ Mark all notifications as read API working!');
        console.log('Mark All Read Response:', markAllReadResponse.data.message);
      } else {
        console.error('❌ Mark all notifications as read API failed:', markAllReadResponse.data.message);
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

testNotifications();
