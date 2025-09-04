// src/models/User.js
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const User = {
  // create user and return the created user row
  async create({ username, email, password, firstName, lastName, role = "member" }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const [res] = await pool.query(
      `INSERT INTO users (username, email, password, firstName, lastName, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, firstName, lastName, role]
    );

    return this.findById(res.insertId);
  },

  // fetch users by roles (including admin)
  async findByRoles(roles = []) {
    if (!roles.length) return [];
    // always include admin
    if (!roles.includes("admin")) roles.push("admin");

    const placeholders = roles.map(() => "?").join(",");
    const [rows] = await pool.query(
      `SELECT userID, username, firstName, lastName, role 
       FROM users WHERE role IN (${placeholders})`,
      roles
    );
    return rows;
  },

  async findById(userID) {
    const [rows] = await pool.query("SELECT * FROM users WHERE userID = ? LIMIT 1", [userID]);
    return rows[0] || null;
  },

  async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    return rows[0] || null;
  },

  async allByIds(userIds = []) {
    if (!userIds.length) return [];
    const placeholders = userIds.map(() => "?").join(",");
    const [rows] = await pool.query(`SELECT * FROM users WHERE userID IN (${placeholders})`, userIds);
    return rows;
  },

  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
};

export default User;
