import express from "express";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  createNotification,
  getStatusUpdates 
} from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get user notifications
router.get("/", getUserNotifications);

// Get status updates (contributions, loans, withdrawals)
router.get("/status-updates", getStatusUpdates);

// Mark notification as read
router.put("/:notificationID/read", markNotificationAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllNotificationsAsRead);

// Delete notification
router.delete("/:notificationID", deleteNotification);

// Create notification (admin/system use)
router.post("/", createNotification);

export default router;
