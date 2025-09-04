import nodemailer from 'nodemailer';

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'smtp.gmail.com',
    port: process.env.MAILTRAP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  registrationApproved: (data) => ({
    subject: '🎉 Welcome to FundEase - Your Registration Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to FundEase!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Congratulations, ${data.userName || 'Valued Member'}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Great news! Your membership application has been <strong style="color: #28a745;">approved</strong> by our admin team.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Your Member Details:</h3>
            <p style="margin: 5px 0;"><strong>Member ID:</strong> MEM${(data.memberId || '000').toString().padStart(3, '0')}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You can now access all member features including:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.6;">
            <li>Make contributions to the fund</li>
            <li>Apply for loans</li>
            <li>Request withdrawals</li>
            <li>View your transaction history</li>
            <li>Access member dashboard</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  registrationRejected: (data) => ({
    subject: 'FundEase - Registration Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">FundEase</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName || 'Valued Applicant'},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for your interest in joining FundEase. After careful review, we regret to inform you that your membership application has been <strong style="color: #dc3545;">not approved</strong> at this time.
          </p>
          
          ${data.reason ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #dc3545; margin-top: 0;">Reason for Rejection:</h3>
            <p style="margin: 5px 0; color: #666;">${data.reason}</p>
          </div>
          ` : ''}
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We encourage you to:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.6;">
            <li>Review your application information</li>
            <li>Ensure all required documents are complete</li>
            <li>Contact our admin team for clarification</li>
            <li>Consider reapplying in the future</li>
          </ul>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            If you believe this decision was made in error or have additional information to provide, please contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  memberSuspended: (data) => ({
    subject: '⚠️ FundEase - Account Suspension Notice',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Account Suspension Notice</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName || 'Valued Member'},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We are writing to inform you that your FundEase membership has been <strong style="color: #f59e0b;">suspended</strong> effective immediately.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0;">Suspension Details:</h3>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Suspended</span></p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${data.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            During this suspension period, you will not be able to:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.6;">
            <li>Access your member dashboard</li>
            <li>Make new contributions</li>
            <li>Apply for loans</li>
            <li>Request withdrawals</li>
            <li>Use member services</li>
          </ul>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            To resolve this suspension, please contact our admin team immediately to discuss the matter and understand the steps needed for reinstatement.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  memberReactivated: (data) => ({
    subject: '✅ FundEase - Account Reactivated Successfully!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Account Reactivated!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Welcome back, ${data.userName || 'Valued Member'}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Great news! Your FundEase membership has been <strong style="color: #10b981;">reactivated</strong> and you now have full access to all member services.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #10b981; margin-top: 0;">Your Account Status:</h3>
            <p style="margin: 5px 0;"><strong>Member ID:</strong> MEM${(data.memberId || '000').toString().padStart(3, '0')}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">Active</span></p>
            <p style="margin: 5px 0;"><strong>Reactivated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You can now access all member features including:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.6;">
            <li>Make contributions to the fund</li>
            <li>Apply for loans</li>
            <li>Request withdrawals</li>
            <li>View your transaction history</li>
            <li>Access member dashboard</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access Your Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for your patience during the review process. We're glad to have you back as an active member of FundEase.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: '🔐 FundEase - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName || 'Valued User'}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your FundEase account. Click the button below to reset your password.
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Important Security Notice</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>This link will expire in 15 minutes</li>
              <li>You will need to enter your current password to reset</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>
          
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Reset Token:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${data.resetToken}</code>
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Expires:</strong> ${new Date(Date.now() + 15 * 60 * 1000).toLocaleString()}
            </p>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${data.resetLink}" style="color: #667eea; word-break: break-all;">${data.resetLink}</a>
          </p>
        </div>
      </div>
    `
  }),

  passwordResetSuccess: (data) => ({
    subject: '✅ FundEase - Password Reset Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Successful!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName || 'Valued User'}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your password has been successfully reset. You can now log in to your FundEase account with your new password.
          </p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">✅ Security Confirmation</h3>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Your password has been updated</li>
              <li>All reset tokens have been cleared</li>
              <li>Your account is secure</li>
            </ul>
          </div>
          
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Reset Date:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Completed</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Log In to Your Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            If you didn't make this change or have any concerns about your account security, please contact our support team immediately.
          </p>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for using FundEase!
          </p>
        </div>
      </div>
    `
  }),

  withdrawalApproved: (data) => ({
    subject: '✅ FundEase - Withdrawal Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Withdrawal Approved!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName || 'Valued Member'}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Great news! Your withdrawal request has been <strong style="color: #10b981;">approved</strong> by the treasurer.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #10b981; margin-top: 0;">Withdrawal Details:</h3>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₱${data.amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${data.reason}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">Approved</span></p>
            <p style="margin: 5px 0;"><strong>Approved Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${data.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            The approved amount will be processed and made available to you according to our standard procedures. Please check your account or contact the treasurer for more details about the disbursement timeline.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Your Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you have any questions about this withdrawal, please contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  withdrawalRejected: (data) => ({
    subject: '❌ FundEase - Withdrawal Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Withdrawal Rejected</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName || 'Valued Member'},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We regret to inform you that your withdrawal request has been <strong style="color: #dc3545;">rejected</strong> by the treasurer.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #dc3545; margin-top: 0;">Withdrawal Details:</h3>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₱${data.amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${data.reason}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc3545;">Rejected</span></p>
            <p style="margin: 5px 0;"><strong>Rejection Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Rejection Reason:</strong> ${data.rejectionReason}</p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            If you believe this decision was made in error or have additional information to provide, please contact the treasurer or our support team for clarification.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You may also consider submitting a new withdrawal request with updated information or documentation.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Your Account
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  loanApproved: (data) => ({
    subject: '🎉 FundEase - Loan Application Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Loan Approved!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Congratulations, ${data.userName || 'Valued Member'}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Excellent news! Your loan application has been <strong style="color: #10b981;">approved</strong> by ${data.approvedBy || 'the committee'}.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #10b981; margin-top: 0;">Loan Details:</h3>
            <p style="margin: 5px 0;"><strong>Loan Amount:</strong> ₱${data.amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${data.reason}</p>
            <p style="margin: 5px 0;"><strong>Interest Rate:</strong> ${(data.interestRate * 100).toFixed(2)}%</p>
            <p style="margin: 5px 0;"><strong>Term:</strong> ${data.termMonths} months</p>
            <p style="margin: 5px 0;"><strong>Monthly Payment:</strong> ₱${data.monthlyPayment.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981;">Approved</span></p>
            <p style="margin: 5px 0;"><strong>Approved Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${data.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Wait for loan disbursement processing</li>
              <li>Review loan terms and conditions</li>
              <li>Set up payment reminders</li>
              <li>Contact treasurer for disbursement timeline</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            The loan will be processed according to our standard procedures. Please contact the treasurer for information about the disbursement timeline and any required documentation.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Your Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you have any questions about this loan approval, please contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  loanRejected: (data) => ({
    subject: '❌ FundEase - Loan Application Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Loan Rejected</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName || 'Valued Member'},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We regret to inform you that your loan application has been <strong style="color: #dc3545;">rejected</strong> by ${data.rejectedBy || 'the committee'}.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #dc3545; margin-top: 0;">Loan Application Details:</h3>
            <p style="margin: 5px 0;"><strong>Requested Amount:</strong> ₱${data.amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${data.reason}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc3545;">Rejected</span></p>
            <p style="margin: 5px 0;"><strong>Rejection Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Rejection Reason:</strong> ${data.rejectionReason}</p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We understand this may be disappointing. Here are some steps you can take:
          </p>
          
          <ul style="color: #666; font-size: 16px; line-height: 1.6;">
            <li>Review the rejection reason and address any concerns</li>
            <li>Consider applying for a smaller loan amount</li>
            <li>Improve your contribution history</li>
            <li>Contact the committee for clarification</li>
            <li>Reapply in the future with updated information</li>
          </ul>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            If you believe this decision was made in error or have additional information to provide, please contact our support team for further assistance.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Your Account
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from FundEase. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, templateType, data) => {
  try {
    const transporter = createTransporter();
    
    if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
      console.warn('Mailtrap credentials not configured. Email not sent.');
      return { success: false, message: 'Email service not configured' };
    }

    const template = emailTemplates[templateType];
    if (!template) {
      throw new Error(`Email template '${templateType}' not found`);
    }

    const emailContent = typeof template === 'function' ? template(data) : template;

    const mailOptions = {
      from: `"${process.env.MAILTRAP_FROM_NAME || 'FundEase System'}" <${process.env.MAILTRAP_FROM_EMAIL || 'noreply@fundease.com'}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully' 
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email' 
    };
  }
};

// Test email function
export const sendTestEmail = async (to) => {
  return await sendEmail(to, 'registrationApproved', {
    userName: 'Test User',
    memberId: 123
  });
};

export default {
  sendEmail,
  sendTestEmail,
  emailTemplates
};
