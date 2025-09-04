import express from "express";
import { 
  getUserContributions, 
  createContribution, 
  getContributionById, 
  updateContributionStatus, 
  getAllContributions 
} from "../controllers/contributionController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js"; // ✅ Multer config

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get user's own contributions
router.get("/user", getUserContributions);

// Get all contributions (admin only)
router.get("/", getAllContributions);

// Create a new contribution (with payment proof upload)
router.post("/", upload.single("paymentProof"), createContribution);

// Get contribution by ID
router.get("/:contributionID", getContributionById);

// Update contribution status (admin only)
router.patch("/:contributionID/status", updateContributionStatus);

export default router;
