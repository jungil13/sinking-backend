import pool from "../config/db.js";

const Contribution = {
  // Get all contributions for a specific member
  async getByMemberId(memberID) {
    const [rows] = await pool.query(
      `SELECT 
         c.contributionID,
         c.memberID,
         c.userID,
         c.amount,
         c.paymentMethod,
         c.paymentProof,
         c.referenceNo,
         c.status,
         c.contributionDate,
         c.notes,
         c.createdAt,
         c.updatedAt,
         c.paymongo_source_id,
         c.paymongo_payment_id,
         c.status_detail,
         u.firstName,
         u.lastName,
         u.username
       FROM contributions c 
       JOIN users u ON c.userID = u.userID 
       WHERE c.memberID = ? 
       ORDER BY c.contributionDate DESC`,
      [memberID]
    );
    return rows;
  },

  // Get all contributions for a specific user
  async getByUserId(userID) {
    const [rows] = await pool.query(
      `SELECT 
         c.contributionID,
         c.memberID,
         c.userID,
         c.amount,
         c.paymentMethod,
         c.paymentProof,
         c.referenceNo,
         c.status,
         c.contributionDate,
         c.notes,
         c.createdAt,
         c.updatedAt,
         c.paymongo_source_id,
         c.paymongo_payment_id,
         c.status_detail,
         m.memberID
       FROM contributions c 
       JOIN members m ON c.memberID = m.memberID 
       WHERE c.userID = ? 
       ORDER BY c.contributionDate DESC`,
      [userID]
    );
    return rows;
  },

  async create({ memberID, userID, amount, paymentMethod, paymentProof, contributionDate, notes, referenceNo }) {
    const [result] = await pool.query(
      `INSERT INTO contributions 
        (memberID, userID, amount, paymentMethod, paymentProof, contributionDate, notes, status, createdAt, updatedAt, status_detail, paymongo_source_id, paymongo_payment_id, referenceNo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW(), NULL, NULL, NULL, ?)`,
      [memberID, userID, amount, paymentMethod, paymentProof, contributionDate, notes, referenceNo]
    );
    return result.insertId;
  },

  // Update contribution status
  async updateStatus(contributionID, status, notes = null) {
    const [result] = await pool.query(
      `UPDATE contributions 
         SET status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE contributionID = ?`,
      [status, notes, contributionID]
    );
    return result.affectedRows > 0;
  },

  // Get contribution by ID
  async getById(contributionID) {
    const [rows] = await pool.query(
      `SELECT 
         c.contributionID,
         c.memberID,
         c.userID,
         c.amount,
         c.paymentMethod,
         c.paymentProof,
         c.referenceNo,
         c.status,
         c.contributionDate,
         c.notes,
         c.createdAt,
         c.updatedAt,
         c.paymongo_source_id,
         c.paymongo_payment_id,
         c.status_detail,
         u.firstName,
         u.lastName,
         u.username,
         m.memberID 
       FROM contributions c 
       JOIN users u ON c.userID = u.userID 
       JOIN members m ON c.memberID = m.memberID 
       WHERE c.contributionID = ?`,
      [contributionID]
    );
    return rows[0];
  },

  // Get all contributions with filters
  async getAll(filters = {}) {
    let query = `
      SELECT 
        c.contributionID,
        c.memberID,
        c.userID,
        c.amount,
        c.paymentMethod,
        c.paymentProof,
        c.referenceNo,
        c.status,
        c.contributionDate,
        c.notes,
        c.createdAt,
        c.updatedAt,
        c.paymongo_source_id,
        c.paymongo_payment_id,
        c.status_detail,
        u.firstName,
        u.lastName,
        u.username,
        m.memberID 
      FROM contributions c 
      JOIN users u ON c.userID = u.userID 
      JOIN members m ON c.memberID = m.memberID 
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND c.status = ?`;
      params.push(filters.status);
    }

    if (filters.paymentMethod) {
      query += ` AND c.paymentMethod = ?`;
      params.push(filters.paymentMethod);
    }

    if (filters.startDate) {
      query += ` AND c.contributionDate >= ?`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND c.contributionDate <= ?`;
      params.push(filters.endDate);
    }

    query += ` ORDER BY c.contributionDate DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get contribution statistics for a member
  async getMemberStats(memberID) {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as totalContributions,
        SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) as totalConfirmed,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as totalPending,
        SUM(CASE WHEN status = 'rejected' THEN amount ELSE 0 END) as totalRejected,
        AVG(amount) as averageAmount
       FROM contributions 
       WHERE memberID = ?`,
      [memberID]
    );
    return rows[0];
  }
};

export default Contribution;
