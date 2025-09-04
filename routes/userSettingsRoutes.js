import express from "express";
import { getUserProfile, updateUserProfile, changePassword, requestPasswordReset } from "../controllers/userSettingsController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get user profile information
router.get("/profile", getUserProfile);

// Update user profile information
router.put("/profile", updateUserProfile);

// Change password
router.put("/password", changePassword);

// Request password reset (public route - no auth required)
router.post("/password-reset", requestPasswordReset);

export default router;
