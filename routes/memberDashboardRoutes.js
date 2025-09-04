import express from "express";
import { getMemberDashboard } from "../controllers/memberDashboardController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get member dashboard data
router.get("/", getMemberDashboard);

export default router;
