import { sendTestEmail, sendEmail } from './services/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');
  
  // Check if Mailtrap credentials are configured
  if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
    console.log('❌ Mailtrap credentials not configured!');
    console.log('Please add the following to your .env file:');
    console.log('MAILTRAP_USER=your_username');
    console.log('MAILTRAP_PASS=your_password');
    console.log('MAILTRAP_FROM_EMAIL=noreply@fundease.com');
    console.log('MAILTRAP_FROM_NAME=FundEase System');
    return;
  }
  
  console.log('✅ Mailtrap credentials found');
  console.log(`📧 From: ${process.env.MAILTRAP_FROM_NAME} <${process.env.MAILTRAP_FROM_EMAIL}>`);
  console.log(`🏠 Host: ${process.env.MAILTRAP_HOST}:${process.env.MAILTRAP_PORT}\n`);
  
  // Test email address (replace with your email for testing)
  const testEmail = 'test@example.com';
  
  try {
    console.log('📤 Sending test email...');
    
    // Test registration approved email
    const result = await sendEmail(testEmail, 'registrationApproved', {
      userName: 'John Doe',
      memberId: 123
    });
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📬 Check your Mailtrap inbox at: https://mailtrap.io/inboxes`);
    } else {
      console.log('❌ Failed to send test email:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing email service:', error.message);
  }
}

// Test different email templates
async function testAllEmailTemplates() {
  console.log('\n🧪 Testing All Email Templates...\n');
  
  const testEmail = 'test@example.com';
  const templates = [
    {
      type: 'registrationApproved',
      data: { userName: 'Jane Smith', memberId: 456 }
    },
    {
      type: 'registrationRejected',
      data: { userName: 'Bob Johnson', reason: 'Incomplete documentation' }
    },
    {
      type: 'memberSuspended',
      data: { userName: 'Alice Brown', reason: 'Violation of terms' }
    },
    {
      type: 'memberReactivated',
      data: { userName: 'Charlie Wilson', memberId: 789 }
    }
  ];
  
  for (const template of templates) {
    try {
      console.log(`📤 Testing ${template.type}...`);
      const result = await sendEmail(testEmail, template.type, template.data);
      
      if (result.success) {
        console.log(`✅ ${template.type} sent successfully`);
      } else {
        console.log(`❌ ${template.type} failed:`, result.message);
      }
    } catch (error) {
      console.error(`❌ Error with ${template.type}:`, error.message);
    }
  }
}

// Run tests
async function runTests() {
  await testEmailService();
  await testAllEmailTemplates();
  
  console.log('\n🎉 Email testing completed!');
  console.log('📬 Check your Mailtrap inbox to see the test emails.');
}

runTests().catch(console.error);
