import pool from "../config/db.js";

const RepaymentModel = {
  async addRepayment({ loanID, userID, amount, paymentMethod, paymentProof, referenceNo, notes }) {
    const [result] = await pool.query(
      `INSERT INTO loan_repayments
        (loanID, userID, amount, paymentMethod, paymentProof, referenceNo, status, notes, paymentDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW(), NOW())`,
      [loanID, userID, amount, paymentMethod, paymentProof, referenceNo, notes]
    );
    return result.insertId;
  },

  async getRepaymentsByUser(userID) {
    const [rows] = await pool.query(
      `SELECT * FROM loan_repayments WHERE userID = ? ORDER BY paymentDate DESC`,
      [userID]
    );
    return rows;
  },

  async getRepaymentsByLoan(loanID) {
    const [rows] = await pool.query(
      `SELECT * FROM loan_repayments WHERE loanID = ? ORDER BY paymentDate DESC`,
      [loanID]
    );
    return rows;
  },

async getAllRepayments() {
  const [rows] = await pool.query(
    `SELECT 
        lr.*, 
        u.firstName, 
        u.lastName, 
        CONCAT(u.firstName, ' ', u.lastName) AS fullName,
        DATE_FORMAT(lr.paymentDate, '%M %d, %Y') AS formattedDate
     FROM loan_repayments lr
     JOIN users u ON lr.userID = u.userID
     ORDER BY lr.paymentDate DESC`
  );
  return rows;
},



  // ✅ Update repayment status
  async updateStatus(repaymentID, status, notes = null) {
    const [result] = await pool.query(
      `UPDATE loan_repayments 
       SET status = ?, notes = ?, updatedAt = NOW() 
       WHERE repaymentID = ?`,
      [status, notes, repaymentID]
    );
    return result.affectedRows > 0;
  }
};

export default RepaymentModel;
