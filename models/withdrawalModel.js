import pool from "../config/db.js";

export const Withdrawal = {
 async create({ memberID, userID, amount, reason, date }) {
    const result = await pool.query(
      `INSERT INTO withdrawals (memberID, userID, amount, reason, date, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING withdrawalID`,
      [memberID, userID, amount, reason, date]
    );

    return { withdrawalID: result.rows[0].withdrawalid };
  },

  async findAllByUser(userID) {
    const result = await pool.query(
      `SELECT w.*, CONCAT(u.firstName, ' ', u.lastName) AS name
       FROM withdrawals w
       JOIN users u ON u.userID = w.userID
       WHERE w.userID = $1
       ORDER BY w.createdAt DESC`,
      [userID]
    );
    return result.rows;
  },

  async findAll() {
    const result = await pool.query(
      `SELECT w.*, CONCAT(u.firstName, ' ', u.lastName) AS name
       FROM withdrawals w
       JOIN users u ON u.userID = w.userID
       ORDER BY w.createdAt DESC`
    );
    return result.rows;
  },

  async updateStatus(withdrawalID, status) {
    const result = await pool.query(
      `UPDATE withdrawals 
       SET status = $1, updatedAt = CURRENT_TIMESTAMP 
       WHERE withdrawalID = $2`,
      [status, withdrawalID]
    );
    return result.rowCount > 0;
  }
};
