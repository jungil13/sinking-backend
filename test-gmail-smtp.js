import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGmailSMTP() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  // Check if Gmail credentials are configured
  if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
    console.log('❌ Gmail credentials not configured!');
    console.log('Please add the following to your .env file:');
    console.log('MAILTRAP_HOST=smtp.gmail.com');
    console.log('MAILTRAP_PORT=587');
    console.log('MAILTRAP_USER=your-gmail-address@gmail.com');
    console.log('MAILTRAP_PASS=your-16-character-app-password');
    console.log('MAILTRAP_FROM_EMAIL=your-gmail-address@gmail.com');
    console.log('MAILTRAP_FROM_NAME=FundEase System');
    return;
  }

  console.log('✅ Gmail credentials found');
  console.log(`📧 From: ${process.env.MAILTRAP_FROM_NAME} <${process.env.MAILTRAP_FROM_EMAIL}>`);
  console.log(`🏠 Host: ${process.env.MAILTRAP_HOST}:${process.env.MAILTRAP_PORT}`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Verify connection
    console.log('\n🔍 Verifying Gmail SMTP connection...');
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified successfully!');

    // Send test email
    console.log('\n📤 Sending test email...');
    const testEmail = {
      from: `"${process.env.MAILTRAP_FROM_NAME}" <${process.env.MAILTRAP_FROM_EMAIL}>`,
      to: process.env.MAILTRAP_USER, // Send to yourself for testing
      subject: '🧪 FundEase Gmail SMTP Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Gmail SMTP Test Successful!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Hello from FundEase!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              This is a test email to verify that Gmail SMTP is working correctly with your FundEase application.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0;">✅ Configuration Details:</h3>
              <ul style="color: #666; margin: 0;">
                <li><strong>SMTP Host:</strong> ${process.env.MAILTRAP_HOST}</li>
                <li><strong>SMTP Port:</strong> ${process.env.MAILTRAP_PORT}</li>
                <li><strong>From Email:</strong> ${process.env.MAILTRAP_FROM_EMAIL}</li>
                <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you received this email, your Gmail SMTP configuration is working perfectly! 
              Your FundEase application can now send real emails to users' Gmail inboxes.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📬 Check your Gmail inbox for the test email!');
    console.log('\n🎉 Gmail SMTP is now configured and working!');

  } catch (error) {
    console.error('❌ Gmail SMTP test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Ensure 2-Factor Authentication is enabled on your Google account');
      console.log('3. Verify the App Password was generated correctly');
    } else if (error.message.includes('Connection timeout')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the SMTP host and port settings');
      console.log('3. Make sure your firewall isn\'t blocking the connection');
    }
  }
}

testGmailSMTP();
