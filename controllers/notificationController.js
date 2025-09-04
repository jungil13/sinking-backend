import pool from "../config/db.js";

// Get all notifications for the authenticated user
export const getUserNotifications = async (req, res) => {
  try {
    const userID = req.user.id;
    const { type, isRead, limit = 50, offset = 0 } = req.query;

    console.log('Getting notifications for userID:', userID);

    let query = `
      SELECT 
        n.notificationID,
        n.title,
        n.message,
        n.type,
        n.isRead,
        n.createdAt,
        n.updatedAt
      FROM notifications n
      WHERE n.userID = ?
    `;
    
    const params = [userID];

    // Add filters
    if (type) {
      query += ` AND n.type = ?`;
      params.push(type);
    }

    if (isRead !== undefined) {
      query += ` AND n.isRead = ?`;
      params.push(isRead === 'true' ? 1 : 0);
    }

    query += ` ORDER BY n.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [notifications] = await pool.query(query, params);

    // Get unread count
    const [unreadCount] = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE userID = ? AND isRead = 0",
      [userID]
    );

    console.log(`Found ${notifications.length} notifications for user ${userID}`);

    res.json({
      success: true,
      data: {
        notifications: notifications.map(notification => ({
          ...notification,
          createdAt: new Date(notification.createdAt).toISOString(),
          updatedAt: new Date(notification.updatedAt).toISOString()
        })),
        unreadCount: unreadCount[0].count,
        total: notifications.length
      }
    });
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationID } = req.params;
    const userID = req.user.id;

    console.log(`Marking notification ${notificationID} as read for user ${userID}`);

    const [result] = await pool.query(
      "UPDATE notifications SET isRead = 1, updatedAt = CURRENT_TIMESTAMP WHERE notificationID = ? AND userID = ?",
      [notificationID, userID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    console.log('Notification marked as read successfully');
    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userID = req.user.id;

    console.log(`Marking all notifications as read for user ${userID}`);

    const [result] = await pool.query(
      "UPDATE notifications SET isRead = 1, updatedAt = CURRENT_TIMESTAMP WHERE userID = ? AND isRead = 0",
      [userID]
    );

    console.log(`Marked ${result.affectedRows} notifications as read`);
    res.json({
      success: true,
      message: `${result.affectedRows} notifications marked as read`
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationID } = req.params;
    const userID = req.user.id;

    console.log(`Deleting notification ${notificationID} for user ${userID}`);

    const [result] = await pool.query(
      "DELETE FROM notifications WHERE notificationID = ? AND userID = ?",
      [notificationID, userID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    console.log('Notification deleted successfully');
    res.json({
      success: true,
      message: "Notification deleted"
    });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Create notification (admin/system use)
export const createNotification = async (req, res) => {
  try {
    const { userID, title, message, type = 'info' } = req.body;

    if (!userID || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userID, title, and message are required"
      });
    }

    const validTypes = ['info', 'success', 'warning', 'error'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type"
      });
    }

    console.log(`Creating notification for user ${userID}: ${title}`);

    const [result] = await pool.query(
      "INSERT INTO notifications (userID, title, message, type, isRead, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, NOW(), NOW())",
      [userID, title, message, type]
    );

    console.log('Notification created successfully');
    res.json({
      success: true,
      message: "Notification created",
      data: {
        notificationID: result.insertId
      }
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Get status updates (contributions, loans, withdrawals status changes)
export const getStatusUpdates = async (req, res) => {
  try {
    const userID = req.user.id;
    const { limit = 20 } = req.query;

    console.log('Getting status updates for userID:', userID);

    // Get member ID for this user
    const [memberRows] = await pool.query(
      "SELECT memberID FROM members WHERE userID = ?",
      [userID]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    const memberID = memberRows[0].memberID;

    // Get recent status updates from contributions, loans, and withdrawals
    const [statusUpdates] = await pool.query(
      `(SELECT 
          'contribution' as type,
          c.contributionID as id,
          c.amount,
          c.status,
          c.updatedAt as date,
          CONCAT('Contribution of ₱', FORMAT(c.amount, 2), ' has been ', c.status) as message,
          CASE 
            WHEN c.status = 'confirmed' THEN 'success'
            WHEN c.status = 'rejected' THEN 'error'
            ELSE 'info'
          END as notificationType
        FROM contributions c
        WHERE c.memberID = ? AND c.updatedAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY c.updatedAt DESC
        LIMIT 10)
      UNION ALL
      (SELECT 
          'loan' as type,
          l.loanID as id,
          l.amount,
          l.status,
          l.updatedAt as date,
          CONCAT('Loan of ₱', FORMAT(l.amount, 2), ' has been ', l.status) as message,
          CASE 
            WHEN l.status = 'approved' THEN 'success'
            WHEN l.status = 'rejected' THEN 'error'
            WHEN l.status = 'completed' THEN 'success'
            ELSE 'info'
          END as notificationType
        FROM loans l
        WHERE l.memberID = ? AND l.updatedAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY l.updatedAt DESC
        LIMIT 10)
      UNION ALL
      (SELECT 
          'withdrawal' as type,
          w.withdrawalID as id,
          w.amount,
          w.status,
          w.updatedAt as date,
          CONCAT('Withdrawal of ₱', FORMAT(w.amount, 2), ' has been ', w.status) as message,
          CASE 
            WHEN w.status = 'approved' THEN 'success'
            WHEN w.status = 'rejected' THEN 'error'
            ELSE 'info'
          END as notificationType
        FROM withdrawals w
        WHERE w.memberID = ? AND w.updatedAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY w.updatedAt DESC
        LIMIT 10)
      ORDER BY date DESC
      LIMIT ?`,
      [memberID, memberID, memberID, parseInt(limit)]
    );

    console.log(`Found ${statusUpdates.length} status updates for user ${userID}`);

    res.json({
      success: true,
      data: {
        statusUpdates: statusUpdates.map(update => ({
          ...update,
          date: new Date(update.date).toISOString(),
          amount: parseFloat(update.amount)
        }))
      }
    });
  } catch (err) {
    console.error('Error getting status updates:', err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
