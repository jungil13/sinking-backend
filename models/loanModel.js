import pool from "../config/db.js";

const LoanModel = {
  async createLoan({ memberID, userID, amount, reason, termMonths, interestRate }) {
    const monthlyPayment = (amount * (1 + interestRate)) / termMonths;
    const result = await pool.query(
      `INSERT INTO loans 
        (memberID, userID, amount, reason, termMonths, interestRate, monthlyPayment, remainingBalance, status, createdAt, updatedAt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW(), NOW()) RETURNING loanID`,
      [memberID, userID, amount, reason, termMonths, interestRate, monthlyPayment, amount] // ✅ initialize remainingBalance = loan amount
    );
    return result.rows[0].loanid;
  },

  async getLoansByUser(userID) {
    const result = await pool.query(
      `SELECT * FROM loans WHERE userID = $1 ORDER BY createdAt DESC`,
      [userID]
    );
    return result.rows;
  },

  async getLoanById(loanID) {
    const result = await pool.query(`SELECT * FROM loans WHERE loanID = $1`, [loanID]);
    return result.rows[0];
  },

  async updateBalance(loanID, newBalance) {
    await pool.query(
      `UPDATE loans SET remainingBalance = $1, updatedAt = NOW() WHERE loanID = $2`,
      [newBalance, loanID]
    );
  },

  async updateStatus(loanID, status) {
    await pool.query(
      `UPDATE loans SET status = $1, updatedAt = NOW() WHERE loanID = $2`,
      [status, loanID]
    );
  },

  async listLoans(options = {}) {
    const page = parseInt(options.page || 1, 10);
    const limit = parseInt(options.limit || 10, 10);
    const offset = (page - 1) * limit;
    const { search, status, sortBy = "createdAt", sortDir = "DESC" } = options;

    // base query - join members -> users to get memberName
    let where = [];
    let params = [];

    if (status) {
      where.push(`l.status = $${params.length + 1}`);
      params.push(status);
    }

    if (search) {
      // search loanID (exact) or member name (partial)
      where.push(`(l.loanID = $${params.length + 1} OR CONCAT(u.firstName,' ',u.lastName) LIKE $${params.length + 2})`);
      params.push(search);
      params.push(`%${search}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Count total
    const countSql = `
      SELECT COUNT(*) as total
      FROM loans l
      LEFT JOIN members m ON l.memberID = m.memberID
      LEFT JOIN users u ON m.userID = u.userID
      ${whereSQL}
    `;
    const countResult = await pool.query(countSql, params);
    const total = countResult.rows[0]?.total || 0;

    // Sorting whitelist
    const sortFields = {
      createdAt: "l.createdAt",
      amount: "l.amount",
      status: "l.status",
      memberName: "memberName"
    };
    const sortField = sortFields[sortBy] || "l.createdAt";
    const dir = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Main select with pagination
    const sql = `
      SELECT 
        l.*,
        m.memberID,
        u.userID as userID,
        CONCAT(u.firstName, ' ', u.lastName) AS memberName,
        COALESCE(lp.totalPaid,0) AS totalPaid,
        (l.remainingBalance) AS remainingBalance,
        -- compute daysOverdue: compare now with dueDate = createdAt + termMonths months
        CASE WHEN (l.remainingBalance > 0 AND NOW() > l.createdAt + INTERVAL '1 month' * l.termMonths)
          THEN EXTRACT(DAY FROM NOW() - (l.createdAt + INTERVAL '1 month' * l.termMonths))
          ELSE 0 END AS daysOverdue
      FROM loans l
      LEFT JOIN members m ON l.memberID = m.memberID
      LEFT JOIN users u ON m.userID = u.userID
      LEFT JOIN (
        SELECT loanID, SUM(amount) AS totalPaid
        FROM loan_repayments
        WHERE status IN ('success','confirmed')
        GROUP BY loanID
      ) lp ON lp.loanID = l.loanID
      ${whereSQL}
      ORDER BY ${sortField} ${dir}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const finalParams = params.concat([limit, offset]);
    const result = await pool.query(sql, finalParams);

    // Pagination meta
    const totalPages = Math.ceil(total / limit);

    return {
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  },

  async getLoanByIdDetailed(loanID) {
    // loan and member info
    const loanSql = `
      SELECT 
        l.*,
        m.memberID,
        u.userID as userID,
        CONCAT(u.firstName, ' ', u.lastName) AS memberName,
        COALESCE(lp.totalPaid,0) AS totalPaid
      FROM loans l
      LEFT JOIN members m ON l.memberID = m.memberID
      LEFT JOIN users u ON m.userID = u.userID
      LEFT JOIN (
        SELECT loanID, SUM(amount) AS totalPaid
        FROM loan_repayments
        WHERE status IN ('success','confirmed')
        GROUP BY loanID
      ) lp ON lp.loanID = l.loanID
      WHERE l.loanID = $1
      LIMIT 1
    `;
    const loanResult = await pool.query(loanSql, [loanID]);
    const loan = loanResult.rows[0];
    if (!loan) return null;

    // repayment history
    const paymentsResult = await pool.query(
      `SELECT repaymentID, loanID, userID, amount, paymentMethod, paymentProof, status, paymentDate, notes, createdAt
       FROM loan_repayments
       WHERE loanID = $1
       ORDER BY paymentDate DESC, createdAt DESC`,
      [loanID]
    );
    const payments = paymentsResult.rows;

    // attach and return
    loan.paymentHistory = payments || [];
    // ensure numeric fields are numbers
    loan.totalPaid = Number(loan.totalPaid || 0);
    loan.remainingBalance = Number(loan.remainingBalance || loan.amount || 0);

    return loan;
  },

  async updateStatus(loanID, status) {
    const sql = `UPDATE loans SET status = $1, updatedAt = NOW() WHERE loanID = $2`;
    await pool.query(sql, [status, loanID]);
    return true;
  },

  async computeStats() {
    // pending, active, totalLoanAmount, overdue
    const sql = `
      SELECT
        SUM(CASE WHEN l.status = 'pending' THEN 1 ELSE 0 END) AS pendingLoans,
        SUM(CASE WHEN l.status IN ('approved','active','disbursed') THEN 1 ELSE 0 END) AS activeLoans,
        COALESCE(SUM(l.amount),0) AS totalLoanAmount,
        SUM(CASE WHEN (l.remainingBalance > 0 AND NOW() > l.createdAt + INTERVAL '1 month' * l.termMonths) THEN 1 ELSE 0 END) AS overdueLoans
      FROM loans l
    `;
    const result = await pool.query(sql);
    return result.rows[0] || {
      pendingLoans: 0,
      activeLoans: 0,
      totalLoanAmount: 0,
      overdueLoans: 0
    };
  },

  // small helper in case you need to update remainingBalance+status
  async updateBalance(loanID, newBalance) {
    await pool.query(`UPDATE loans SET remainingBalance = $1, updatedAt = NOW() WHERE loanID = $2`, [newBalance, loanID]);
  }
};

export default LoanModel;
