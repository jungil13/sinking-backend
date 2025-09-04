import express from "express";
import { getReportsData, exportReport } from "../controllers/reportsController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get reports data
router.get("/", getReportsData);

// Export report
router.post("/export", exportReport);

export default router;
