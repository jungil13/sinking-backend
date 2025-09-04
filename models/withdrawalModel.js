import pool from "../config/db.js";

export const Withdrawal = {
 async create({ memberID, userID, amount, reason, date }) {
    const [result] = await pool.query(
      `INSERT INTO withdrawals (memberID, userID, amount, reason, date, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [memberID, userID, amount, reason, date]
    );

    return { withdrawalID: result.insertId };
  },

  async findAllByUser(userID) {
    const [rows] = await pool.query(
      `SELECT w.*, CONCAT(u.firstName, ' ', u.lastName) AS name
       FROM withdrawals w
       JOIN users u ON u.userID = w.userID
       WHERE w.userID = ?
       ORDER BY w.createdAt DESC`,
      [userID]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.query(
      `SELECT w.*, CONCAT(u.firstName, ' ', u.lastName) AS name
       FROM withdrawals w
       JOIN users u ON u.userID = w.userID
       ORDER BY w.createdAt DESC`
    );
    return rows;
  },

  async updateStatus(withdrawalID, status) {
    const [result] = await pool.query(
      `UPDATE withdrawals 
       SET status = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE withdrawalID = ?`,
      [status, withdrawalID]
    );
    return result.affectedRows > 0;
  }
};
