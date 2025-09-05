// src/models/User.js
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const User = {
  // create user and return the created user row
  async create({ username, email, password, firstName, lastName, role = "member" }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, firstName, lastName, role) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING userID`,
      [username, email, hashedPassword, firstName, lastName, role]
    );

    return this.findById(result.rows[0].userid);
  },

  // fetch users by roles (including admin)
  async findByRoles(roles = []) {
    if (!roles.length) return [];
    // always include admin
    if (!roles.includes("admin")) roles.push("admin");

    const placeholders = roles.map((_, index) => `$${index + 1}`).join(",");
    const result = await pool.query(
      `SELECT userID, username, firstName, lastName, role 
       FROM users WHERE role IN (${placeholders})`,
      roles
    );
    return result.rows;
  },

  async findById(userID) {
    const result = await pool.query("SELECT * FROM users WHERE userID = $1 LIMIT 1", [userID]);
    return result.rows[0] || null;
  },

  async findByUsername(username) {
    const result = await pool.query("SELECT * FROM users WHERE username = $1 LIMIT 1", [username]);
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
    return result.rows[0] || null;
  },

  async allByIds(userIds = []) {
    if (!userIds.length) return [];
    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(",");
    const result = await pool.query(`SELECT * FROM users WHERE userID IN (${placeholders})`, userIds);
    return result.rows;
  },

  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
};

export default User;
