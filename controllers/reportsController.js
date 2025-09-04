import pool from "../config/db.js";

export const getReportsData = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    console.log('Getting reports data for period:', period, 'startDate:', startDate, 'endDate:', endDate);

    // Determine date range based on period
    let dateFilter = '';
    let params = [];
    
    if (period === 'month') {
      dateFilter = 'WHERE MONTH(createdAt) = MONTH(CURRENT_DATE()) AND YEAR(createdAt) = YEAR(CURRENT_DATE())';
    } else if (period === 'quarter') {
      dateFilter = 'WHERE QUARTER(createdAt) = QUARTER(CURRENT_DATE()) AND YEAR(createdAt) = YEAR(CURRENT_DATE())';
    } else if (period === 'year') {
      dateFilter = 'WHERE YEAR(createdAt) = YEAR(CURRENT_DATE())';
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = 'WHERE DATE(createdAt) BETWEEN ? AND ?';
      params = [startDate, endDate];
    }
    
    // If no period specified, default to all time
    if (!dateFilter) {
      dateFilter = '';
    }

    // Get fund balance and financial metrics
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) as totalContributions,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as totalWithdrawals,
        COALESCE(SUM(CASE WHEN status IN ('approved', 'disbursed', 'active') THEN amount ELSE 0 END), 0) as totalLoans,
        COALESCE(SUM(CASE WHEN status IN ('approved', 'disbursed', 'active', 'completed') THEN amount * 0.05 ELSE 0 END), 0) as totalInterest
      FROM (
        SELECT amount, status, createdAt FROM contributions
        UNION ALL
        SELECT amount, status, createdAt FROM withdrawals
        UNION ALL
        SELECT amount, status, createdAt FROM loans
      ) as combined
      ${dateFilter}
    `;
    
    console.log('Fund metrics query:', query);
    console.log('Query params:', params);
    
    const [fundMetrics] = await pool.query(query, params);

    // Get member activity metrics
    const [memberMetrics] = await pool.query(`
      SELECT 
        COUNT(DISTINCT CASE WHEN m.status = 'active' THEN m.memberID END) as activeMembers,
        COUNT(DISTINCT CASE WHEN MONTH(m.createdAt) = MONTH(CURRENT_DATE()) AND YEAR(m.createdAt) = YEAR(CURRENT_DATE()) THEN m.memberID END) as newMembers,
        COUNT(DISTINCT CASE WHEN l.status = 'pending' THEN l.loanID END) as loanApplications,
        COUNT(DISTINCT CASE WHEN w.status = 'pending' THEN w.withdrawalID END) as withdrawalRequests
      FROM members m
      LEFT JOIN loans l ON m.memberID = l.memberID
      LEFT JOIN withdrawals w ON m.memberID = w.memberID
    `);

    // Get average metrics - handle date filtering separately for each table
    let averageQuery;
    if (dateFilter) {
      // If date filter is applied, we need to handle it carefully due to JOIN
      // Remove the "WHERE" from dateFilter since we're adding it manually
      const cleanDateFilter = dateFilter.replace('WHERE ', '');
      // Replace all instances of 'createdAt' with 'c.createdAt' for the contributions table
      const cleanDateFilterForContributions = cleanDateFilter.replace(/createdAt/g, 'c.createdAt');
      averageQuery = `
        SELECT 
          COALESCE(AVG(CASE WHEN c.status = 'confirmed' THEN c.amount END), 0) as averageContribution,
          COALESCE(AVG(CASE WHEN l.status IN ('approved', 'disbursed', 'active') THEN l.amount END), 0) as averageLoanAmount,
          COALESCE(
            (SELECT COUNT(*) FROM loan_repayments lr 
             JOIN loans l2 ON lr.loanID = l2.loanID 
             WHERE lr.status = 'confirmed' AND l2.status IN ('approved', 'disbursed', 'active')
            ) * 100.0 / 
            (SELECT COUNT(*) FROM loans l3 WHERE l3.status IN ('approved', 'disbursed', 'active')), 0
          ) as loanRepaymentRate
        FROM contributions c
        LEFT JOIN loans l ON c.memberID = l.memberID
        WHERE ${cleanDateFilterForContributions}
      `;
    } else {
      // No date filter, use the original query
      averageQuery = `
        SELECT 
          COALESCE(AVG(CASE WHEN c.status = 'confirmed' THEN c.amount END), 0) as averageContribution,
          COALESCE(AVG(CASE WHEN l.status IN ('approved', 'disbursed', 'active') THEN l.amount END), 0) as averageLoanAmount,
          COALESCE(
            (SELECT COUNT(*) FROM loan_repayments lr 
             JOIN loans l2 ON lr.loanID = l2.loanID 
             WHERE lr.status = 'confirmed' AND l2.status IN ('approved', 'disbursed', 'active')
            ) * 100.0 / 
            (SELECT COUNT(*) FROM loans l3 WHERE l3.status IN ('approved', 'disbursed', 'active')), 0
          ) as loanRepaymentRate
        FROM contributions c
        LEFT JOIN loans l ON c.memberID = l.memberID
      `;
    }
    
    console.log('Average metrics query:', averageQuery);
    console.log('Query params for average:', params);
    
    const [averageMetrics] = await pool.query(averageQuery, params);

    // Get recent transactions  
    const transactionsQuery = `
      (SELECT 
        'contribution' as type,
        c.contributionID as id,
        c.createdAt as date,
        CONCAT(u.firstName, ' ', u.lastName) as memberName,
        CONCAT('MEM', LPAD(m.memberID, 3, '0')) as memberId,
        c.amount,
        c.status
      FROM contributions c
      JOIN members m ON c.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      ${dateFilter ? dateFilter.replace(/createdAt/g, 'c.createdAt') : ''}
      ORDER BY c.createdAt DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'loan' as type,
        l.loanID as id,
        l.createdAt as date,
        CONCAT(u.firstName, ' ', u.lastName) as memberName,
        CONCAT('MEM', LPAD(m.memberID, 3, '0')) as memberId,
        l.amount,
        l.status
      FROM loans l
      JOIN members m ON l.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      ${dateFilter ? dateFilter.replace(/createdAt/g, 'l.createdAt') : ''}
      ORDER BY l.createdAt DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'withdrawal' as type,
        w.withdrawalID as id,
        w.createdAt as date,
        CONCAT(u.firstName, ' ', u.lastName) as memberName,
        CONCAT('MEM', LPAD(m.memberID, 3, '0')) as memberId,
        w.amount,
        w.status
      FROM withdrawals w
      JOIN members m ON w.memberID = m.memberID
      JOIN users u ON m.userID = u.userID
      ${dateFilter ? dateFilter.replace(/createdAt/g, 'w.createdAt') : ''}
      ORDER BY w.createdAt DESC
      LIMIT 5)
      ORDER BY date DESC
      LIMIT 10
    `;
    
    console.log('Transactions query:', transactionsQuery);
    const [recentTransactions] = await pool.query(transactionsQuery, dateFilter ? [params[0], params[1], params[0], params[1], params[0], params[1]] : []);

    // Get monthly overview for charts
    const [monthlyOverview] = await pool.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(CASE WHEN type = 'contribution' THEN amount ELSE 0 END) as contributions,
        SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as withdrawals,
        SUM(CASE WHEN type = 'loan' THEN amount ELSE 0 END) as loans
      FROM (
        SELECT amount, createdAt, 'contribution' as type FROM contributions WHERE status = 'confirmed'
        UNION ALL
        SELECT amount, createdAt, 'withdrawal' as type FROM withdrawals WHERE status = 'approved'
        UNION ALL
        SELECT amount, createdAt, 'loan' as type FROM loans WHERE status IN ('approved', 'disbursed', 'active')
      ) as combined
      WHERE createdAt >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `);

    // Calculate fund utilization
    const totalFundBalance = parseFloat(fundMetrics[0]?.totalContributions || 0) - parseFloat(fundMetrics[0]?.totalWithdrawals || 0);
    const fundUtilization = totalFundBalance > 0 ? 
      ((parseFloat(fundMetrics[0]?.totalLoans || 0) / totalFundBalance) * 100).toFixed(1) : 0;

    // Format the response
    const reportsData = {
      success: true,
      data: {
        keyMetrics: {
          totalFundBalance: totalFundBalance,
          totalContributions: parseFloat(fundMetrics[0]?.totalContributions || 0),
          activeLoans: parseFloat(fundMetrics[0]?.totalLoans || 0),
          interestEarned: parseFloat(fundMetrics[0]?.totalInterest || 0)
        },
        memberActivity: {
          activeMembers: memberMetrics[0]?.activeMembers || 0,
          newMembers: memberMetrics[0]?.newMembers || 0,
          loanApplications: memberMetrics[0]?.loanApplications || 0,
          withdrawalRequests: memberMetrics[0]?.withdrawalRequests || 0
        },
        financialSummary: {
          averageContribution: parseFloat(averageMetrics[0]?.averageContribution || 0),
          averageLoanAmount: parseFloat(averageMetrics[0]?.averageLoanAmount || 0),
          loanRepaymentRate: parseFloat(averageMetrics[0]?.loanRepaymentRate || 0),
          fundUtilization: parseFloat(fundUtilization)
        },
        recentTransactions: recentTransactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          memberName: transaction.memberName,
          memberId: transaction.memberId,
          type: transaction.type,
          amount: parseFloat(transaction.amount),
          status: transaction.status
        })),
        monthlyOverview: monthlyOverview.map(month => ({
          month: month.month,
          contributions: parseFloat(month.contributions || 0),
          withdrawals: parseFloat(month.withdrawals || 0),
          loans: parseFloat(month.loans || 0)
        }))
      }
    };

    console.log('Reports data retrieved successfully');
    res.json(reportsData);
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { format, period, startDate, endDate } = req.body;
    
    if (!format || !['excel', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Invalid export format. Must be 'excel' or 'pdf'"
      });
    }

    // For now, return success message
    // In a real implementation, you would generate and return the actual file
    res.json({
      success: true,
      message: `${format.toUpperCase()} report generated successfully`,
      data: {
        downloadUrl: `/api/reports/download/${format}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};
