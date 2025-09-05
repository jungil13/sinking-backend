import pool from "../config/db.js";

const Message = {
  async create({ senderID, receiverID, message }) {
    const result = await pool.query(
      `INSERT INTO messages (senderID, receiverID, message, isRead, createdAt, updatedAt) 
       VALUES ($1, $2, $3, 0, NOW(), NOW()) RETURNING messageID`,
      [senderID, receiverID, message]
    );
    return this.findById(result.rows[0].messageid);
  },

  async findById(messageID) {
    const result = await pool.query("SELECT * FROM messages WHERE messageID = $1", [messageID]);
    return result.rows[0] || null;
  },

 async getConversation(userID1, userID2) {
  const result = await pool.query(
    `SELECT m.*, u1.username AS senderName, u2.username AS receiverName
     FROM messages m
     JOIN users u1 ON m.senderID = u1.userID
     JOIN users u2 ON m.receiverID = u2.userID
     WHERE (m.senderID = $1 AND m.receiverID = $2)
        OR (m.senderID = $3 AND m.receiverID = $4)
     ORDER BY m.createdAt ASC`,
    [userID1, userID2, userID2, userID1]
  );

  // Convert createdAt to ISO string
  return result.rows.map(msg => ({
    ...msg,
    timestamp: new Date(msg.createdAt).toISOString()
  }));
},
  async getInbox(userID) {
    const result = await pool.query(
      `
      SELECT 
        CASE 
          WHEN m.senderID = $1 THEN m.receiverID
          ELSE m.senderID
        END AS otherUserID,
        CASE 
          WHEN m.senderID = $2 THEN u2.username
          ELSE u1.username
        END AS username,
        m.message AS latestMessage,
        SUM(CASE WHEN m.receiverID = $3 AND m.isRead = 0 THEN 1 ELSE 0 END) AS unreadCount,
        MAX(m.createdAt) AS lastMessageAt
      FROM messages m
      JOIN users u1 ON m.senderID = u1.userID
      JOIN users u2 ON m.receiverID = u2.userID
      WHERE m.senderID = $4 OR m.receiverID = $5
      GROUP BY otherUserID, username
      ORDER BY lastMessageAt DESC
      `,
      [userID, userID, userID, userID, userID]
    );
    return result.rows;
  },

  // ✅ New model function for bulk update
  async markAllAsRead({ senderID, receiverID }) {
    const result = await pool.query(
      `UPDATE messages SET isRead = 1, updatedAt = NOW() 
       WHERE senderID = $1 AND receiverID = $2 AND isRead = 0`,
      [senderID, receiverID]
    );
    return result.rowCount;
  }
};

export default Message;
