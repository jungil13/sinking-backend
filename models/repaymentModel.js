import pool from "../config/db.js";

const RepaymentModel = {
  async addRepayment({ loanID, userID, amount, paymentMethod, paymentProof, referenceNo, notes }) {
    const result = await pool.query(
      `INSERT INTO loan_repayments
        (loanID, userID, amount, paymentMethod, paymentProof, referenceNo, status, notes, paymentDate, createdAt, updatedAt)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW(), NOW(), NOW()) RETURNING repaymentID`,
      [loanID, userID, amount, paymentMethod, paymentProof, referenceNo, notes]
    );
    return result.rows[0].repaymentid;
  },

  async getRepaymentsByUser(userID) {
    const result = await pool.query(
      `SELECT * FROM loan_repayments WHERE userID = $1 ORDER BY paymentDate DESC`,
      [userID]
    );
    return result.rows;
  },

  async getRepaymentsByLoan(loanID) {
    const result = await pool.query(
      `SELECT * FROM loan_repayments WHERE loanID = $1 ORDER BY paymentDate DESC`,
      [loanID]
    );
    return result.rows;
  },

async getAllRepayments() {
  const result = await pool.query(
    `SELECT 
        lr.*, 
        u.firstName, 
        u.lastName, 
        CONCAT(u.firstName, ' ', u.lastName) AS fullName,
        TO_CHAR(lr.paymentDate, 'Month DD, YYYY') AS formattedDate
     FROM loan_repayments lr
     JOIN users u ON lr.userID = u.userID
     ORDER BY lr.paymentDate DESC`
  );
  return result.rows;
},



  // ✅ Update repayment status
  async updateStatus(repaymentID, status, notes = null) {
    const result = await pool.query(
      `UPDATE loan_repayments 
       SET status = $1, notes = $2, updatedAt = NOW() 
       WHERE repaymentID = $3`,
      [status, notes, repaymentID]
    );
    return result.rowCount > 0;
  }
};

export default RepaymentModel;
