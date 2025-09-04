import express from "express";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get admin dashboard data
router.get("/", getAdminDashboard);

export default router;
