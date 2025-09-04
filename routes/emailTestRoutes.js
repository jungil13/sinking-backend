import express from 'express';
import { sendTestEmail, sendEmail } from '../services/emailService.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Test email endpoint (admin only)
router.post('/test', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { email, templateType, data } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // If templateType is provided, use it; otherwise send test email
    if (templateType) {
      const result = await sendEmail(email, templateType, data || {});
      res.json(result);
    } else {
      const result = await sendTestEmail(email);
      res.json(result);
    }

  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Get available email templates
router.get('/templates', auth, (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const templates = [
      {
        type: 'registrationApproved',
        name: 'Registration Approved',
        description: 'Sent when a user registration is approved',
        requiredData: ['userName', 'memberId']
      },
      {
        type: 'registrationRejected',
        name: 'Registration Rejected',
        description: 'Sent when a user registration is rejected',
        requiredData: ['userName', 'reason']
      },
      {
        type: 'memberSuspended',
        name: 'Member Suspended',
        description: 'Sent when a member account is suspended',
        requiredData: ['userName', 'reason']
      },
      {
        type: 'memberReactivated',
        name: 'Member Reactivated',
        description: 'Sent when a member account is reactivated',
        requiredData: ['userName', 'memberId']
      }
    ];

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates',
      error: error.message
    });
  }
});

export default router;
