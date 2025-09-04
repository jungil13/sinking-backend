import LoanModel from "../models/loanModel.js";
import { LOAN_STATUS } from "../constants/constants.js";
import pool from "../config/db.js"; // ✅ import your MySQL2 pool

const LoanController = {
 async requestLoan(req, res) {
  try {
    const { userID, amount, reason, termMonths } = req.body;

    // 1️⃣ Get the correct memberID for this user
    const [memberRows] = await pool.query(
      "SELECT memberID FROM members WHERE userID = ?",
      [userID]
    );

    if (memberRows.length === 0) {
      return res.status(400).json({ success: false, message: "Member not found for this user." });
    }

    const memberID = memberRows[0].memberID;

    // 2️⃣ Create the loan
    const interestRate = 0.05; // 5%
    const loanID = await LoanModel.createLoan({
      memberID,
      userID,
      amount,
      reason,
      termMonths,
      interestRate,
    });

    res.status(201).json({ success: true, loanID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
},
  async getUserLoans(req, res) {
    try {
      const { userID } = req.params;
      const loans = await LoanModel.getLoansByUser(userID);
      res.json(loans);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

export default LoanController;
