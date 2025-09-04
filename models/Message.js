import pool from "../config/db.js";

const Message = {
  async create({ senderID, receiverID, message }) {
    const [res] = await pool.query(
      `INSERT INTO messages (senderID, receiverID, message, isRead, createdAt, updatedAt) 
       VALUES (?, ?, ?, 0, NOW(), NOW())`,
      [senderID, receiverID, message]
    );
    return this.findById(res.insertId);
  },

  async findById(messageID) {
    const [rows] = await pool.query("SELECT * FROM messages WHERE messageID = ?", [messageID]);
    return rows[0] || null;
  },

 async getConversation(userID1, userID2) {
  const [rows] = await pool.query(
    `SELECT m.*, u1.username AS senderName, u2.username AS receiverName
     FROM messages m
     JOIN users u1 ON m.senderID = u1.userID
     JOIN users u2 ON m.receiverID = u2.userID
     WHERE (m.senderID = ? AND m.receiverID = ?)
        OR (m.senderID = ? AND m.receiverID = ?)
     ORDER BY m.createdAt ASC`,
    [userID1, userID2, userID2, userID1]
  );

  // Convert createdAt to ISO string
  return rows.map(msg => ({
    ...msg,
    timestamp: new Date(msg.createdAt).toISOString()
  }));
},
  async getInbox(userID) {
    const [rows] = await pool.query(
      `
      SELECT 
        CASE 
          WHEN m.senderID = ? THEN m.receiverID
          ELSE m.senderID
        END AS otherUserID,
        CASE 
          WHEN m.senderID = ? THEN u2.username
          ELSE u1.username
        END AS username,
        m.message AS latestMessage,
        SUM(CASE WHEN m.receiverID = ? AND m.isRead = 0 THEN 1 ELSE 0 END) AS unreadCount,
        MAX(m.createdAt) AS lastMessageAt
      FROM messages m
      JOIN users u1 ON m.senderID = u1.userID
      JOIN users u2 ON m.receiverID = u2.userID
      WHERE m.senderID = ? OR m.receiverID = ?
      GROUP BY otherUserID, username
      ORDER BY lastMessageAt DESC
      `,
      [userID, userID, userID, userID, userID]
    );
    return rows;
  },

  // ✅ New model function for bulk update
  async markAllAsRead({ senderID, receiverID }) {
    const [result] = await pool.query(
      `UPDATE messages SET isRead = 1, updatedAt = NOW() 
       WHERE senderID = ? AND receiverID = ? AND isRead = 0`,
      [senderID, receiverID]
    );
    return result.affectedRows;
  }
};

export default Message;
