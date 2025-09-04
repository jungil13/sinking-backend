import pool from "../config/db.js";
import Contribution from "../models/Contribution.js";
import LoanModel from "../models/loanModel.js";

export const getMemberDashboard = async (req, res) => {
  try {
    const userID = req.user.id;
    
    // Get member ID for this user
    const [memberRows] = await pool.query(
      "SELECT memberID FROM members WHERE userID = ?",
      [userID]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Member not found" 
      });
    }

    const memberID = memberRows[0].memberID;

    // Get member's contribution stats
    const contributionStats = await Contribution.getMemberStats(memberID);
    
    // Get member's loan stats
    const [loanStats] = await pool.query(
      `SELECT 
        COUNT(*) as totalLoans,
        SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) as activeLoanAmount,
        SUM(CASE WHEN status = 'active' THEN remainingBalance ELSE 0 END) as outstandingBalance,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completedLoanAmount
       FROM loans 
       WHERE memberID = ?`,
      [memberID]
    );

    // Get total fund balance (this could be calculated from all confirmed contributions)
    const [fundBalance] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalFundBalance 
       FROM contributions 
       WHERE status = 'confirmed'`
    );

    // Get recent activities (last 5 contributions and loan repayments)
    const [recentActivities] = await pool.query(
      `(SELECT 
          'contribution' as type,
          c.amount,
          c.status,
          c.contributionDate as date,
          c.paymentMethod,
          'contribution' as activityType
        FROM contributions c
        WHERE c.memberID = ?
        ORDER BY c.contributionDate DESC 
        LIMIT 3)
      UNION ALL
      (SELECT 
          'loan_repayment' as type,
          lr.amount,
          lr.status,
          lr.paymentDate as date,
          lr.paymentMethod,
          'repayment' as activityType
        FROM loan_repayments lr
        JOIN loans l ON lr.loanID = l.loanID
        WHERE l.memberID = ?
        ORDER BY lr.paymentDate DESC 
        LIMIT 2)
      ORDER BY date DESC 
      LIMIT 5`,
      [memberID, memberID]
    );

    // Calculate monthly changes (simplified - you can make this more sophisticated)
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const [monthlyStats] = await pool.query(
      `SELECT 
        SUM(CASE WHEN MONTH(contributionDate) = ? AND YEAR(contributionDate) = ? AND status = 'confirmed' THEN amount ELSE 0 END) as currentMonthContributions,
        SUM(CASE WHEN MONTH(contributionDate) = ? AND YEAR(contributionDate) = ? AND status = 'confirmed' THEN amount ELSE 0 END) as lastMonthContributions
       FROM contributions 
       WHERE memberID = ?`,
      [currentMonth + 1, currentYear, lastMonth + 1, lastMonthYear, memberID]
    );

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
            value: `₱ ${parseFloat(fundBalance[0]?.totalFundBalance || 0).toLocaleString()}`,
            change: '+12.5%', // This could be calculated from historical data
            changeType: 'positive'
          },
          totalContributions: {
            value: `₱ ${parseFloat(contributionStats?.totalConfirmed || 0).toLocaleString()}`,
            change: `${contributionChange > 0 ? '+' : ''}${contributionChange}%`,
            changeType: contributionChange >= 0 ? 'positive' : 'negative'
          },
          activeLoans: {
            value: `₱ ${parseFloat(loanStats[0]?.outstandingBalance || 0).toLocaleString()}`,
            change: '-3.1%', // This could be calculated from historical data
            changeType: 'negative'
          },
          loanRepayment: {
            value: `₱ ${parseFloat(loanStats[0]?.completedLoanAmount || 0).toLocaleString()}`,
            change: '+15.7%', // This could be calculated from historical data
            changeType: 'positive'
          }
        },
        recentActivities: recentActivities.map(activity => ({
          type: activity.type,
          amount: `₱ ${parseFloat(activity.amount).toLocaleString()}`,
          status: activity.status,
          date: new Date(activity.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          paymentMethod: activity.paymentMethod
        }))
      }
    };

    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};
