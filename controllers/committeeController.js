import pool from "../config/db.js";
import { sendEmail } from "../services/emailService.js";

// Get dashboard statistics for Committee
const getDashboardStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get fund balance
    const [fundBalanceResult] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN c.status = 'confirmed' THEN c.amount ELSE 0 END), 0) as totalContributions,
        COALESCE(SUM(CASE WHEN w.status = 'approved' THEN w.amount ELSE 0 END), 0) as totalWithdrawals,
        COALESCE(SUM(CASE WHEN l.status IN ('approved', 'disbursed', 'completed') THEN l.amount * l.interestRate ELSE 0 END), 0) as totalInterest
      FROM contributions c
      CROSS JOIN withdrawals w
      CROSS JOIN loans l
    `);

    // Get active members count
    const [activeMembersResult] = await connection.query(`
      SELECT COUNT(*) as activeMembers
      FROM members 
      WHERE status = 'active'
    `);

    // Get pending loans count
    const [pendingLoansResult] = await connection.query(`
      SELECT COUNT(*) as pendingLoans
      FROM loans 
      WHERE status = 'pending'
    `);

    // Get new loans today
    const [newLoansTodayResult] = await connection.query(`
      SELECT COUNT(*) as newLoansToday
      FROM loans 
      WHERE status = 'pending' AND DATE(createdAt) = CURDATE()
    `);

    // Calculate fund balance
    const contributions = (await connection.query(`SELECT COALESCE(SUM(amount), 0) as totalContributions FROM contributions WHERE status = 'confirmed'`))[0][0].totalContributions;
    const withdrawals = (await connection.query(`SELECT COALESCE(SUM(amount), 0) as totalWithdrawals FROM withdrawals WHERE status = 'approved'`))[0][0].totalWithdrawals;
    const interest = (await connection.query(`SELECT COALESCE(SUM(amount * interestRate), 0) as totalInterest FROM loans WHERE status IN ('approved', 'disbursed', 'completed')`))[0][0].totalInterest;
    
    const fundBalance = contributions - withdrawals + interest;

    const stats = {
      fundBalance: fundBalance,
      activeMembers: activeMembersResult[0].activeMembers,
      pendingLoans: pendingLoansResult[0].pendingLoans,
      newLoansToday: newLoansTodayResult[0].newLoansToday
    };

    connection.release();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching committee dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get pending loan approvals
const getPendingLoans = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [loans] = await connection.query(`
      SELECT 
        l.loanID as id,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        l.amount,
        l.reason as purpose,
        l.createdAt as date,
        l.status,
        l.interestRate,
        l.termMonths,
        l.monthlyPayment,
        m.monthlyIncome,
        m.employment
      FROM loans l
      JOIN members m ON l.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      WHERE l.status = 'pending'
      ORDER BY l.createdAt DESC
    `);

    connection.release();
    res.json({ success: true, data: loans });
  } catch (error) {
    console.error('Error fetching pending loans:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get recent member activities
const getRecentActivities = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get recent contributions
    const [contributions] = await connection.query(`
      SELECT 
        c.contributionID as id,
        CONCAT(u.firstName, ' ', u.lastName) as member,
        'contribution' as type,
        c.amount,
        c.contributionDate as date,
        c.status,
        c.createdAt
      FROM contributions c
      JOIN members m ON c.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      ORDER BY c.createdAt DESC
      LIMIT 10
    `);

    // Get recent loan payments
    const [loanPayments] = await connection.query(`
      SELECT 
        lr.repaymentID as id,
        CONCAT(u.firstName, ' ', u.lastName) as member,
        'loan_payment' as type,
        lr.amount,
        lr.paymentDate as date,
        lr.status,
        lr.createdAt
      FROM loan_repayments lr
      JOIN loans l ON lr.loanID = l.loanID
      JOIN members m ON l.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      ORDER BY lr.createdAt DESC
      LIMIT 10
    `);

    // Combine and sort all activities
    const allActivities = [...contributions, ...loanPayments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    connection.release();
    res.json({ success: true, data: allActivities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get members overview
const getMembersOverview = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [members] = await connection.query(`
      SELECT 
        m.memberID as id,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        m.status,
        COALESCE(SUM(CASE WHEN c.status = 'confirmed' THEN c.amount ELSE 0 END), 0) as totalContributions,
        COALESCE(SUM(CASE WHEN l.status IN ('approved', 'disbursed', 'completed') THEN l.amount ELSE 0 END), 0) as totalLoans,
        m.membershipDate,
        m.employment,
        m.monthlyIncome
      FROM members m
      JOIN users u ON m.userID = u.userID
      LEFT JOIN contributions c ON m.memberID = c.memberID
      LEFT JOIN loans l ON m.memberID = l.memberID
      WHERE m.status = 'active'
      GROUP BY m.memberID, u.firstName, u.lastName, m.status, m.membershipDate, m.employment, m.monthlyIncome
      ORDER BY m.membershipDate DESC
      LIMIT 20
    `);

    connection.release();
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching members overview:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get member details
const getMemberDetails = async (req, res) => {
  try {
    const { memberId } = req.params;
    const connection = await pool.getConnection();
    
    // Get member basic info
    const [memberRows] = await connection.query(`
      SELECT 
        m.memberID,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        u.email,
        m.phone,
        m.address,
        m.employment,
        m.monthlyIncome,
        m.emergencyContact,
        m.emergencyPhone,
        m.status,
        m.membershipDate,
        m.createdAt
      FROM members m
      JOIN users u ON m.userID = u.userID
      WHERE m.memberID = ?
    `, [memberId]);

    if (memberRows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const member = memberRows[0];

    // Get member's contributions
    const [contributions] = await connection.query(`
      SELECT 
        contributionID,
        amount,
        paymentMethod,
        status,
        contributionDate,
        createdAt
      FROM contributions
      WHERE memberID = ?
      ORDER BY createdAt DESC
    `, [memberId]);

    // Get member's loans
    const [loans] = await connection.query(`
      SELECT 
        loanID,
        amount,
        remainingBalance,
        reason,
        status,
        interestRate,
        termMonths,
        monthlyPayment,
        createdAt
      FROM loans
      WHERE memberID = ?
      ORDER BY createdAt DESC
    `, [memberId]);

    // Get member's loan repayments
    const [repayments] = await connection.query(`
      SELECT 
        lr.repaymentID,
        lr.amount,
        lr.paymentMethod,
        lr.status,
        lr.paymentDate,
        lr.createdAt,
        l.reason as loanReason
      FROM loan_repayments lr
      JOIN loans l ON lr.loanID = l.loanID
      WHERE l.memberID = ?
      ORDER BY lr.createdAt DESC
    `, [memberId]);

    // Get member's withdrawals
    const [withdrawals] = await connection.query(`
      SELECT 
        withdrawalID,
        amount,
        reason,
        status,
        date,
        createdAt
      FROM withdrawals
      WHERE memberID = ?
      ORDER BY createdAt DESC
    `, [memberId]);

    const memberDetails = {
      ...member,
      contributions,
      loans,
      repayments,
      withdrawals
    };

    connection.release();
    res.json({ success: true, data: memberDetails });
  } catch (error) {
    console.error('Error fetching member details:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Approve loan
const approveLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { notes } = req.body;
    const connection = await pool.getConnection();
    
    await connection.beginTransaction();

    // Update loan status
    await connection.query(
      'UPDATE loans SET status = ?, approvedBy = ?, approvedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE loanID = ?',
      ['approved', req.user.userID, loanId]
    );

    // Get loan details for notification
    const [loanRows] = await connection.query(`
      SELECT 
        l.amount,
        l.reason,
        l.interestRate,
        l.termMonths,
        l.monthlyPayment,
        u.email,
        u.firstName,
        u.lastName
      FROM loans l
      JOIN members m ON l.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      WHERE l.loanID = ?
    `, [loanId]);

    if (loanRows.length > 0) {
      const loan = loanRows[0];
      
      // Create notification
      await connection.query(
        'INSERT INTO notifications (userID, title, message, type) VALUES (?, ?, ?, ?)',
        [req.user.userID, 'Loan Approved', `Your loan application of ₱${loan.amount.toLocaleString()} has been approved by the screening committee.`, 'success']
      );

      // Send email notification
      await sendEmail(loan.email, 'loanApproved', {
        userName: `${loan.firstName} ${loan.lastName}`,
        amount: loan.amount,
        reason: loan.reason,
        interestRate: loan.interestRate,
        termMonths: loan.termMonths,
        monthlyPayment: loan.monthlyPayment,
        notes: notes || 'No additional notes provided.',
        approvedBy: 'Screening Committee'
      });
    }

    await connection.commit();
    connection.release();
    
    res.json({ success: true, message: 'Loan approved successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error approving loan:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Reject loan
const rejectLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { reason } = req.body;
    const connection = await pool.getConnection();
    
    await connection.beginTransaction();

    // Update loan status
    await connection.query(
      'UPDATE loans SET status = ?, approvedBy = ?, approvedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE loanID = ?',
      ['rejected', req.user.userID, loanId]
    );

    // Get loan details for notification
    const [loanRows] = await connection.query(`
      SELECT 
        l.amount,
        l.reason,
        u.email,
        u.firstName,
        u.lastName
      FROM loans l
      JOIN members m ON l.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      WHERE l.loanID = ?
    `, [loanId]);

    if (loanRows.length > 0) {
      const loan = loanRows[0];
      
      // Create notification
      await connection.query(
        'INSERT INTO notifications (userID, title, message, type) VALUES (?, ?, ?, ?)',
        [req.user.userID, 'Loan Rejected', `Your loan application of ₱${loan.amount.toLocaleString()} has been rejected by the screening committee. Reason: ${reason}`, 'error']
      );

      // Send email notification
      await sendEmail(loan.email, 'loanRejected', {
        userName: `${loan.firstName} ${loan.lastName}`,
        amount: loan.amount,
        reason: loan.reason,
        rejectionReason: reason,
        rejectedBy: 'Screening Committee'
      });
    }

    await connection.commit();
    connection.release();
    
    res.json({ success: true, message: 'Loan rejected successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error rejecting loan:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export {
  getDashboardStats,
  getPendingLoans,
  getRecentActivities,
  getMembersOverview,
  getMemberDetails,
  approveLoan,
  rejectLoan
};
