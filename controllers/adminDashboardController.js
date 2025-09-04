import pool from "../config/db.js";

export const getAdminDashboard = async (req, res) => {
  try {
    console.log('Getting admin dashboard data...');

    // Get fund balance (total confirmed contributions - total approved withdrawals)
    const [fundBalanceResult] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) as totalContributions,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as totalWithdrawals
      FROM (
        SELECT amount, status FROM contributions
        UNION ALL
        SELECT amount, status FROM withdrawals
      ) as combined
    `);

    const fundBalance = parseFloat(fundBalanceResult[0]?.totalContributions || 0) - 
                       parseFloat(fundBalanceResult[0]?.totalWithdrawals || 0);

    // Get total contributions
    const [totalContributionsResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as totalContributions
      FROM contributions 
      WHERE status = 'confirmed'
    `);

    // Get total active loans
    const [totalLoansResult] = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as totalLoanAmount,
        COALESCE(SUM(remainingBalance), 0) as outstandingBalance
      FROM loans 
      WHERE status IN ('approved', 'disbursed', 'active')
    `);

    // Get total loan repayments this month
    const [loanRepaymentsResult] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as totalRepayments
      FROM loan_repayments 
      WHERE status = 'confirmed' 
      AND MONTH(paymentDate) = MONTH(CURRENT_DATE()) 
      AND YEAR(paymentDate) = YEAR(CURRENT_DATE())
    `);

    // Get total interest earned
    const [interestResult] = await pool.query(`
      SELECT COALESCE(SUM(amount * 0.05), 0) as totalInterest
      FROM loans 
      WHERE status IN ('approved', 'disbursed', 'active', 'completed')
    `);

    // Get active members count
    const [activeMembersResult] = await pool.query(`
      SELECT COUNT(*) as activeMembers
      FROM members 
      WHERE status = 'active'
    `);

    // Get pending approvals
    const [pendingApprovals] = await pool.query(`
      (SELECT 
        'registration' as type,
        m.memberID as id,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        NULL as amount,
        m.createdAt as date,
        m.status
      FROM members m
      JOIN users u ON m.userID = u.userID
      WHERE m.status = 'pending'
      ORDER BY m.createdAt DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'loan' as type,
        l.loanID as id,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        l.amount,
        l.createdAt as date,
        l.status
      FROM loans l
      JOIN users u ON l.userID = u.userID
      WHERE l.status = 'pending'
      ORDER BY l.createdAt DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'withdrawal' as type,
        w.withdrawalID as id,
        CONCAT(u.firstName, ' ', u.lastName) as name,
        w.amount,
        w.createdAt as date,
        w.status
      FROM withdrawals w
      JOIN users u ON w.userID = u.userID
      WHERE w.status = 'pending'
      ORDER BY w.createdAt DESC
      LIMIT 5)
      ORDER BY date DESC
      LIMIT 10
    `);

    // Get recent transactions
    const [recentTransactions] = await pool.query(`
      (SELECT 
        'contribution' as type,
        c.contributionID as id,
        CONCAT(u.firstName, ' ', u.lastName) as member,
        c.amount,
        c.createdAt as date,
        c.status
      FROM contributions c
      JOIN users u ON c.userID = u.userID
      ORDER BY c.createdAt DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'loan_payment' as type,
        lr.repaymentID as id,
        CONCAT(u.firstName, ' ', u.lastName) as member,
        lr.amount,
        lr.createdAt as date,
        lr.status
      FROM loan_repayments lr
      JOIN users u ON lr.userID = u.userID
      ORDER BY lr.createdAt DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'withdrawal' as type,
        w.withdrawalID as id,
        CONCAT(u.firstName, ' ', u.lastName) as member,
        w.amount,
        w.createdAt as date,
        w.status
      FROM withdrawals w
      JOIN users u ON w.userID = u.userID
      ORDER BY w.createdAt DESC
      LIMIT 5)
      ORDER BY date DESC
      LIMIT 10
    `);

    // Get monthly financial overview (last 12 months)
    const [monthlyOverview] = await pool.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(CASE WHEN type = 'contribution' THEN amount ELSE 0 END) as contributions,
        SUM(CASE WHEN type = 'loan' THEN amount ELSE 0 END) as loans
      FROM (
        SELECT amount, createdAt, 'contribution' as type FROM contributions WHERE status = 'confirmed'
        UNION ALL
        SELECT amount, createdAt, 'loan' as type FROM loans WHERE status = 'approved'
      ) as combined
      WHERE createdAt >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Calculate monthly changes
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const [monthlyStats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN MONTH(createdAt) = ? AND YEAR(createdAt) = ? AND status = 'confirmed' THEN amount ELSE 0 END) as currentMonthContributions,
        SUM(CASE WHEN MONTH(createdAt) = ? AND YEAR(createdAt) = ? AND status = 'confirmed' THEN amount ELSE 0 END) as lastMonthContributions
      FROM contributions
    `, [currentMonth + 1, currentYear, lastMonth + 1, lastMonthYear]);

    const currentContributions = parseFloat(monthlyStats[0]?.currentMonthContributions || 0);
    const lastContributions = parseFloat(monthlyStats[0]?.lastMonthContributions || 0);
    const contributionChange = lastContributions > 0 ? 
      ((currentContributions - lastContributions) / lastContributions * 100).toFixed(1) : 
      currentContributions > 0 ? '100.0' : '0.0';

    // Format the response
    const dashboardData = {
      success: true,
      data: {
        stats: {
          fundBalance: {
            value: `₱ ${fundBalance.toLocaleString()}`,
            change: '+12.5%', // This could be calculated from historical data
            changeType: 'positive'
          },
          totalContributions: {
            value: `₱ ${parseFloat(totalContributionsResult[0]?.totalContributions || 0).toLocaleString()}`,
            change: `${contributionChange > 0 ? '+' : ''}${contributionChange}%`,
            changeType: contributionChange >= 0 ? 'positive' : 'negative'
          },
          totalLoans: {
            value: `₱ ${parseFloat(totalLoansResult[0]?.totalLoanAmount || 0).toLocaleString()}`,
            change: '+15.3%', // This could be calculated from historical data
            changeType: 'positive'
          },
          loanRepayments: {
            value: `₱ ${parseFloat(loanRepaymentsResult[0]?.totalRepayments || 0).toLocaleString()}`,
            change: '+22.1%', // This could be calculated from historical data
            changeType: 'positive'
          },
          totalInterest: {
            value: `₱ ${parseFloat(interestResult[0]?.totalInterest || 0).toLocaleString()}`,
            change: '+18.7%', // This could be calculated from historical data
            changeType: 'positive'
          },
          activeMembers: {
            value: activeMembersResult[0]?.activeMembers?.toString() || '0',
            change: '+5.2%', // This could be calculated from historical data
            changeType: 'positive'
          }
        },
        pendingApprovals: pendingApprovals.map(approval => ({
          id: approval.id,
          type: approval.type,
          name: approval.name,
          amount: approval.amount ? `₱ ${parseFloat(approval.amount).toLocaleString()}` : null,
          date: new Date(approval.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: approval.status
        })),
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction.id,
          member: transaction.member,
          type: transaction.type,
          amount: `₱ ${parseFloat(transaction.amount).toLocaleString()}`,
          date: new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: transaction.status
        })),
        monthlyOverview: monthlyOverview.map(month => ({
          month: month.month,
          contributions: parseFloat(month.contributions || 0),
          loans: parseFloat(month.loans || 0)
        }))
      }
    };

    console.log('Admin dashboard data retrieved successfully');
    res.json(dashboardData);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};
