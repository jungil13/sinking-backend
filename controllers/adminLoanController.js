import LoanModel from "../models/loanModel.js";
import RepaymentModel from "../models/repaymentModel.js";

/**
 * Admin controller for loan management:
 * - listLoans (pagination, search, status)
 * - getLoan (detailed)
 * - updateLoanStatus
 * - stats
 */
const AdminLoanController = {
async listLoans(req, res) {
  try {
    const { page = 1, limit = 10, search = "", status = "", sortBy = "createdAt", sortDir = "DESC" } = req.query;
    const result = await LoanModel.listLoans({ page, limit, search: search || null, status: status || null, sortBy, sortDir });

    res.json({
      loans: result.data,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
},


  async getLoan(req, res) {
    try {
      const loanID = req.params.loanID;
      const loan = await LoanModel.getLoanByIdDetailed(loanID);
      if (!loan) return res.status(404).json({ success: false, message: "Loan not found" });
      res.json({ success: true, data: loan });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateLoanStatus(req, res) {
    try {
      const loanID = req.params.loanID;
      const { status } = req.body;
      if (!status) return res.status(400).json({ success: false, message: "Status is required" });

      await LoanModel.updateStatus(loanID, status);

      // optional: if marking completed ensure remainingBalance = 0
      if (status === "completed") {
        await LoanModel.updateBalance(loanID, 0);
      }

      res.json({ success: true, message: "Status updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async stats(req, res) {
    try {
      const s = await LoanModel.computeStats();
      // cast numeric types to Number
      res.json({
        success: true,
        stats: {
          pendingLoans: Number(s.pendingLoans || 0),
          activeLoans: Number(s.activeLoans || 0),
          totalLoanAmount: Number(s.totalLoanAmount || 0),
          overdueLoans: Number(s.overdueLoans || 0)
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

export default AdminLoanController;
