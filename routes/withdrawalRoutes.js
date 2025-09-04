import express from "express";
import auth from "../middleware/auth.js"; // your JWT middleware
import {
  createWithdrawal,
  getWithdrawalsByUser,
  getAllWithdrawals,
  updateWithdrawalStatus
} from "../controllers/withdrawalController.js";

const router = express.Router();

// ✅ POST create withdrawal with auth middleware
router.post("/", auth, createWithdrawal);

// GET all withdrawals (admin/treasurer)
router.get("/", auth, getAllWithdrawals);

// GET withdrawals for a specific user
router.get("/user/:userID", auth, getWithdrawalsByUser);

// PUT update withdrawal status
router.put("/:withdrawalID/status", auth, updateWithdrawalStatus);

export default router;
