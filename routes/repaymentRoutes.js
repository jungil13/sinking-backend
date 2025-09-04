import express from "express";
import RepaymentController from "../controllers/repaymentController.js";
import uploadPaymentProof from "../middleware/multer.js";

const router = express.Router();

// ✅ Upload image on repayment
router.post(
  "/repay",
  uploadPaymentProof.single("paymentProof"), 
  RepaymentController.repayLoan
);

// ✅ Get repayments for a specific user
router.get("/user/:userID", RepaymentController.getRepayments);

// ✅ Get all repayments (for admin)
router.get("/", RepaymentController.getAllRepayments);

// ✅ Update repayment status
router.put("/:repaymentID/status", RepaymentController.updateRepaymentStatus);

export default router;
