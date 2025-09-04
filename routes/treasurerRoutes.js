import express from 'express';
import auth from '../middleware/auth.js';
import {
  getDashboardStats,
  getPendingWithdrawals,
  getPendingLoans,
  getRecentTransactions,
  approveWithdrawal,
  rejectWithdrawal,
  approveLoan,
  rejectLoan
} from '../controllers/treasurerController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/pending-withdrawals', getPendingWithdrawals);
router.get('/dashboard/pending-loans', getPendingLoans);
router.get('/dashboard/recent-transactions', getRecentTransactions);

// Approval routes
router.post('/withdrawals/:withdrawalId/approve', approveWithdrawal);
router.post('/withdrawals/:withdrawalId/reject', rejectWithdrawal);
router.post('/loans/:loanId/approve', approveLoan);
router.post('/loans/:loanId/reject', rejectLoan);

export default router;
