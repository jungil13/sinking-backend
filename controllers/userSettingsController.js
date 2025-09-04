import pool from "../config/db.js";
import bcrypt from "bcrypt";

// Get user profile information
export const getUserProfile = async (req, res) => {
  try {
    const userID = req.user.id;
    console.log('Getting profile for userID:', userID);

    // Get user information from users table
    const [userRows] = await pool.query(
      "SELECT userID, username, email, firstName, lastName, role FROM users WHERE userID = ?",
      [userID]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = userRows[0];

    // Get member information if user is a member
    let memberInfo = null;
    if (user.role === 'member') {
      const [memberRows] = await pool.query(
        "SELECT phone, address, employment, monthlyIncome, emergencyContact, emergencyPhone FROM members WHERE userID = ?",
        [userID]
      );
      
      if (memberRows.length > 0) {
        memberInfo = memberRows[0];
      }
    }

    const profileData = {
      success: true,
      data: {
        user: {
          userID: user.userID,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        member: memberInfo
      }
    };

    console.log('Profile data retrieved successfully');
    res.json(profileData);
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Update user profile information
export const updateUserProfile = async (req, res) => {
  try {
    const userID = req.user.id;
    const { firstName, lastName, email, phone, address, employment, monthlyIncome, emergencyContact, emergencyPhone } = req.body;

    console.log('Updating profile for userID:', userID);
    console.log('Update data:', { firstName, lastName, email, phone, address, employment, monthlyIncome, emergencyContact, emergencyPhone });

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Update users table
      await pool.query(
        "UPDATE users SET firstName = ?, lastName = ?, email = ?, updatedAt = CURRENT_TIMESTAMP WHERE userID = ?",
        [firstName, lastName, email, userID]
      );

      // Update members table if user is a member
      const [userRows] = await pool.query("SELECT role FROM users WHERE userID = ?", [userID]);
      if (userRows.length > 0 && userRows[0].role === 'member') {
        await pool.query(
          "UPDATE members SET phone = ?, address = ?, employment = ?, monthlyIncome = ?, emergencyContact = ?, emergencyPhone = ?, updatedAt = CURRENT_TIMESTAMP WHERE userID = ?",
          [phone, address, employment, monthlyIncome, emergencyContact, emergencyPhone, userID]
        );
      }

      // Commit transaction
      await pool.query('COMMIT');

      console.log('Profile updated successfully');
      res.json({
        success: true,
        message: "Profile updated successfully"
      });
    } catch (updateErr) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw updateErr;
    }
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userID = req.user.id;
    const { currentPassword, newPassword } = req.body;

    console.log('Changing password for userID:', userID);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Get current user password
    const [userRows] = await pool.query(
      "SELECT password FROM users WHERE userID = ?",
      [userID]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, userRows[0].password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE userID = ?",
      [hashedNewPassword, userID]
    );

    console.log('Password changed successfully');
    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Request password reset (for future implementation)
export const requestPasswordReset = async (req, res) => {
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
      "SELECT userID, email, firstName FROM users WHERE email = ?",
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

    // TODO: Implement email sending logic here
    // For now, just return success
    console.log(`Password reset requested for user: ${user.userID}, email: ${user.email}`);

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent"
    });
  } catch (err) {
    console.error('Error requesting password reset:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
