import Message from "../models/Message.js";
import User from "../models/User.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverID, message } = req.body;
    const senderID = req.user.id;

    if (!receiverID || !message) {
      return res.status(400).json({ message: "receiverID and message are required" });
    }

    const newMessage = await Message.create({ senderID, receiverID, message });

    // ✅ socket emit
    const io = req.app.get("io");
    io.to(`user_${receiverID}`).emit("newMessage", newMessage);

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    // Fetch treasurer, screening_committee, and admin
    const staff = await User.findByRoles(["treasurer", "screening_committee", "admin"]);

    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getInbox = async (req, res) => {
  try {
    const userID = req.user.id;
    const inbox = await Message.getInbox(userID);
    res.json(inbox);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching inbox", error: err.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userID = req.user.id;
    const { otherUserID } = req.params;

    const conversation = await Message.getConversation(userID, otherUserID);
    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching conversation", error: err.message });
  }
};

// ✅ New controller to mark all messages from a specific user as read
export const markAllAsRead = async (req, res) => {
  try {
    const { otherUserID } = req.params;
    const userID = req.user.id;

    await Message.markAllAsRead({ senderID: otherUserID, receiverID: userID });

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking messages as read", error: err.message });
  }
};
