import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../services/emailService.js";

// Get all pending registrations
export const getRegistrations = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.userID,
        u.username,
        u.email,
        u.firstName,
        u.lastName,
        u.role,
        u.isActive,
        u.createdAt as registrationDate,
        m.memberID,
        m.phone,
        m.address,
        m.employment,
        m.monthlyIncome,
        m.emergencyContact,
        m.emergencyPhone,
        m.status as memberStatus,
        m.membershipDate,
        m.createdAt as memberCreatedAt
      FROM users u
      LEFT JOIN members m ON u.userID = m.userID
      WHERE u.role = 'member'
      ORDER BY u.createdAt DESC
    `;

    const [rows] = await pool.query(query);
    
    // Transform the data to match frontend expectations
    const registrations = rows.map(row => ({
      id: row.userID,
      name: `${row.firstName} ${row.lastName}`,
      email: row.email,
      phone: row.phone || 'N/A',
      address: row.address || 'N/A',
      employment: row.employment || 'N/A',
      monthlyIncome: row.monthlyIncome || 0,
      emergencyContact: row.emergencyContact || 'N/A',
      emergencyPhone: row.emergencyPhone || 'N/A',
      applicationDate: row.registrationDate,
      status: row.memberStatus || 'pending',
      membershipDate: row.membershipDate,
      username: row.username,
      isActive: row.isActive
    }));

    res.json(registrations);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching registrations", 
      error: err.message 
    });
  }
};

// Approve a registration
export const approveRegistration = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.params;
    
    // Update member status to 'active' and set membership date
    await connection.query(
      "UPDATE members SET status = 'active', membershipDate = CURDATE() WHERE userID = ?",
      [userId]
    );
    
    // Update user isActive to true
    await connection.query(
      "UPDATE users SET isActive = 1 WHERE userID = ?",
      [userId]
    );
    
    // Get user email for sending notification
    const [userRows] = await connection.query(
      "SELECT email, firstName, lastName FROM users WHERE userID = ?",
      [userId]
    );
    
    if (userRows.length > 0) {
      const user = userRows[0];
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Send email notification
      await sendEmail(user.email, 'registrationApproved', {
        userName: userName,
        memberId: userId // Using userId as memberId for now
      });
    }
    
    // Create notification for the user
    await connection.query(
      "INSERT INTO notifications (userID, title, message, type) VALUES (?, ?, ?, ?)",
      [
        userId,
        "Registration Approved!",
        "Congratulations! Your membership has been approved. You can now access all member features.",
        "success"
      ]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: "Registration approved successfully"
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Error approving registration:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error approving registration", 
      error: err.message 
    });
  } finally {
    connection.release();
  }
};

// Reject a registration
export const rejectRegistration = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.params;
    const { reason } = req.body;
    
    // Update member status to 'inactive'
    await connection.query(
      "UPDATE members SET status = 'inactive' WHERE userID = ?",
      [userId]
    );
    
    // Update user isActive to false
    await connection.query(
      "UPDATE users SET isActive = 0 WHERE userID = ?",
      [userId]
    );
    
    // Get user email for sending notification
    const [userRows] = await connection.query(
      "SELECT email, firstName, lastName FROM users WHERE userID = ?",
      [userId]
    );
    
    if (userRows.length > 0) {
      const user = userRows[0];
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Send email notification
      await sendEmail(user.email, 'registrationRejected', {
        userName: userName,
        reason: reason
      });
    }
    
    // Create notification for the user
    const rejectionMessage = reason 
      ? `Your registration has been rejected. Reason: ${reason}`
      : "Your registration has been rejected. Please contact admin for more information.";
      
    await connection.query(
      "INSERT INTO notifications (userID, title, message, type) VALUES (?, ?, ?, ?)",
      [
        userId,
        "Registration Rejected",
        rejectionMessage,
        "error"
      ]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: "Registration rejected successfully"
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Error rejecting registration:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error rejecting registration", 
      error: err.message 
    });
  } finally {
    connection.release();
  }
};

// Suspend a member
export const suspendMember = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.params;
    const { reason } = req.body;
    
    // Update member status to 'suspended'
    await connection.query(
      "UPDATE members SET status = 'suspended' WHERE userID = ?",
      [userId]
    );
    
    // Update user isActive to false
    await connection.query(
      "UPDATE users SET isActive = 0 WHERE userID = ?",
      [userId]
    );
    
    // Get user email for sending notification
    const [userRows] = await connection.query(
      "SELECT email, firstName, lastName FROM users WHERE userID = ?",
      [userId]
    );
    
    if (userRows.length > 0) {
      const user = userRows[0];
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Send email notification
      await sendEmail(user.email, 'memberSuspended', {
        userName: userName,
        reason: reason
      });
    }
    
    // Create notification for the user
    const suspensionMessage = reason 
      ? `Your membership has been suspended. Reason: ${reason}`
      : "Your membership has been suspended. Please contact admin for more information.";
      
    await connection.query(
      "INSERT INTO notifications (userID, title, message, type) VALUES (?, ?, ?, ?)",
      [
        userId,
        "Membership Suspended",
        suspensionMessage,
        "warning"
      ]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: "Member suspended successfully"
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Error suspending member:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error suspending member", 
      error: err.message 
    });
  } finally {
    connection.release();
  }
};

// Reactivate a member
export const reactivateMember = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.params;
    
    // Update member status to 'active'
    await connection.query(
      "UPDATE members SET status = 'active' WHERE userID = ?",
      [userId]
    );
    
    // Update user isActive to true
    await connection.query(
      "UPDATE users SET isActive = 1 WHERE userID = ?",
      [userId]
    );
    
    // Get user email for sending notification
    const [userRows] = await connection.query(
      "SELECT email, firstName, lastName FROM users WHERE userID = ?",
      [userId]
    );
    
    if (userRows.length > 0) {
      const user = userRows[0];
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Send email notification
      await sendEmail(user.email, 'memberReactivated', {
        userName: userName,
        memberId: userId // Using userId as memberId for now
      });
    }
    
    // Create notification for the user
    await connection.query(
      "INSERT INTO notifications (userID, title, message, type) VALUES (?, ?, ?, ?)",
      [
        userId,
        "Membership Reactivated",
        "Your membership has been reactivated. You can now access all member features.",
        "success"
      ]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: "Member reactivated successfully"
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Error reactivating member:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error reactivating member", 
      error: err.message 
    });
  } finally {
    connection.release();
  }
};

// Get registration statistics
export const getRegistrationStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN m.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN m.status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN m.status = 'suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN m.status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM users u
      LEFT JOIN members m ON u.userID = m.userID
      WHERE u.role = 'member'
    `);
    
    res.json(stats[0]);
  } catch (err) {
    console.error('Error fetching registration stats:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching registration statistics", 
      error: err.message 
    });
  }
};
