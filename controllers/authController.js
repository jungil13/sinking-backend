import User from "../models/User.js";
import Member from "../models/Member.js";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      phone,
      monthlyIncome,
      address,
      employment,
      emergencyContact,
      emergencyPhone,
    } = req.body;

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    // Create member (no username/password/email here!)
    await Member.create({
      userID: user.userID, // get the inserted userID
      phone,
      address,
      employment,
      monthlyIncome,
      emergencyContact,
      emergencyPhone,
    });

    return res.status(201).json({
      message: "Account created successfully. Please wait for admin approval.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🔹 Look up user in users table
    const userRes = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    let user = null;
    let isAdmin = false;
    let memberID = null;

    if (userRes.rows.length > 0) {
      user = userRes.rows[0];
      isAdmin = user.role === "admin";

      if (!isAdmin) {
        // 🔹 Check members table
        const memberRes = await pool.query("SELECT * FROM members WHERE \"userID\" = $1", [user.userID]);
        if (memberRes.rows.length > 0) {
          const member = memberRes.rows[0];
          memberID = member.memberID;

          if (member.status !== 'active' || !user.isActive) {
            return res.status(401).json({
              message: "Your account is not active. Please contact admin for assistance."
            });
          }
        } else {
          return res.status(401).json({
            message: "Member profile not found. Please contact admin for assistance."
          });
        }
      }
    } else {
      // 🔹 If not in users, check admins table
      const adminRes = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
      if (adminRes.rows.length > 0) {
        user = adminRes.rows[0];
        isAdmin = true;
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // 🔑 Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // 🎟️ JWT token
    const token = jwt.sign(
      {
        id: isAdmin ? (user.adminID || user.userID) : user.userID,
        memberID: memberID || null,
        role: isAdmin ? "admin" : user.role,
        username: user.username,
        isAdmin,
        email: user.email,
        fromAdminsTable: isAdmin && user.adminID ? true : false,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: isAdmin ? (user.adminID || user.userID) : user.userID,
        memberID: memberID || null,
        username: user.username,
        role: isAdmin ? "admin" : user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin,
        email: user.email,
        fromAdminsTable: isAdmin && user.adminID ? true : false,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Users available for messaging
export const getUsersForMessaging = async (req, res) => {
  try {
    // ⚡ FIX: your users table uses `userID` not `id`
    const [rows] = await pool.query(
      "SELECT userID AS id, username, role FROM users WHERE role IN ('admin','treasurer','screening_committee')"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Forgot password request
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    // Check if user exists
    const [userRows] = await pool.query(
      "SELECT userID, email, firstName, lastName FROM users WHERE email = ?",
      [email]
    );

    if (userRows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent"
      });
    }

    const user = userRows[0];

    // Generate a simple reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in database
    await pool.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE userID = ?",
      [resetToken, resetTokenExpiry, user.userID]
    );

    // Send email with reset link
    const { sendEmail } = await import('../services/emailService.js');
    await sendEmail(user.email, 'passwordReset', {
      userName: `${user.firstName} ${user.lastName}`,
      resetToken: resetToken,
      resetLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
    });

    console.log(`Password reset requested for user: ${user.userID}, email: ${user.email}`);

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent"
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// Reset password with token verification
const resetPassword = async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;

    if (!token || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, current password, and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Find user by reset token
    const [userRows] = await pool.query(
      "SELECT userID, email, firstName, lastName, password, resetTokenExpiry FROM users WHERE resetToken = ?",
      [token]
    );

    if (userRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const user = userRows[0];

    // Check if token is expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new one."
      });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await pool.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL, updatedAt = CURRENT_TIMESTAMP WHERE userID = ?",
      [hashedNewPassword, user.userID]
    );

    // Send confirmation email
    const { sendEmail } = await import('../services/emailService.js');
    await sendEmail(user.email, 'passwordResetSuccess', {
      userName: `${user.firstName} ${user.lastName}`
    });

    console.log(`Password reset successful for user: ${user.userID}, email: ${user.email}`);

    res.json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

export { register, login, forgotPassword, resetPassword };
