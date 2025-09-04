import Contribution from '../models/Contribution.js';
import Loan from '../models/loanModel.js';

export const getDashboard = async (req, res) => {
  try {
    const fundBalance = 50000; // You can calculate based on your logic
    const totalContributions = await Contribution.getStats();
    const activeLoans = await Loan.getActiveLoans(); 
    const loanRepayment = await Loan.getMonthlyRepayment(); 

    const stats = [
      { name: 'Fund Balance', value: `₱ ${fundBalance}`, change: '+12.5%', changeType: 'positive' },
      { name: 'Total Contributions', value: `₱ ${totalContributions}`, change: '+8.2%', changeType: 'positive' },
      { name: 'Active Loans', value: `₱ ${activeLoans}`, change: '-3.1%', changeType: 'negative' },
      { name: 'Loan Repayment', value: `₱ ${loanRepayment}`, change: '+15.7%', changeType: 'positive' },
    ];

    const recentActivities = await Contribution.getAll(); // You can join loans/payments as needed

    res.json({ stats, recentActivities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
