import express from "express";
import { sendMessage, getInbox, getConversation, markAllAsRead, getStaff } from "../controllers/messageController.js";
import isAuthenticated from "../middleware/auth.js";

const router = express.Router();

router.post("/", isAuthenticated, sendMessage);
router.get("/inbox", isAuthenticated, getInbox);
router.get("/conversation/:otherUserID", isAuthenticated, getConversation);
router.put("/mark-as-read/:otherUserID", isAuthenticated, markAllAsRead); // ✅ New route
router.get("/staff", isAuthenticated, getStaff);

export default router;
