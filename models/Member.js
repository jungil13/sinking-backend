import pool from "../config/db.js";

const Member = {
  // Create a new member
    async create({ userID, phone, address, employment, monthlyIncome, emergencyContact, emergencyPhone, status = "pending" }) {
    const result = await pool.query(
      `INSERT INTO members 
       (userID, phone, address, employment, monthlyIncome, emergencyContact, emergencyPhone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING memberID`,
      [userID, phone, address, employment, monthlyIncome, emergencyContact, emergencyPhone, status]
    );
    return result.rows[0].memberid;
  },

  // Get all members with optional search
  async getAll(search = '') {
    const sql = `
      SELECT m.*, u.firstName, u.lastName, u.username, u.email
      FROM members m
      JOIN users u ON u.userID = m.userID
      WHERE u.firstName LIKE $1 OR u.lastName LIKE $2 OR u.username LIKE $3
      ORDER BY m.memberID DESC
    `;
    const result = await pool.query(sql, [`%${search}%`, `%${search}%`, `%${search}%`]);
    return result.rows;
  },

  // Get a single member by ID
  async getById(memberID) {
    const sql = `
      SELECT m.*, u.firstName, u.lastName, u.username, u.email
      FROM members m
      JOIN users u ON u.userID = m.userID
      WHERE m.memberID = $1
    `;
    const result = await pool.query(sql, [memberID]);
    return result.rows[0];
  },

  // Get transactions for a member
  async getTransactions(memberID) {
    const sql = `
      SELECT c.contributionID AS id, 'contribution' AS type, c.amount, c.status, c.paymentMethod, c.contributionDate AS date
      FROM contributions c
      WHERE c.memberID = $1

      UNION ALL

      SELECT l.loanID AS id, 'loan_payment' AS type, lr.amount, lr.status, lr.paymentMethod, lr.paymentDate AS date
      FROM loans l
      JOIN loan_repayments lr ON lr.loanID = l.loanID
      WHERE l.memberID = $2

      ORDER BY date DESC
    `;
    const result = await pool.query(sql, [memberID, memberID]);
    return result.rows;
  }
};

export default Member;
