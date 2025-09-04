import express from 'express';
import auth from '../middleware/auth.js';
import {
  getDashboardStats,
  getPendingLoans,
  getRecentActivities,
  getMembersOverview,
  getMemberDetails,
  approveLoan,
  rejectLoan
} from '../controllers/committeeController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/pending-loans', getPendingLoans);
router.get('/dashboard/recent-activities', getRecentActivities);
router.get('/dashboard/members-overview', getMembersOverview);

// Member routes
router.get('/members/:memberId', getMemberDetails);

// Approval routes
router.post('/loans/:loanId/approve', approveLoan);
router.post('/loans/:loanId/reject', rejectLoan);

export default router;
