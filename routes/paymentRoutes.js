import express from "express";
import { createPaymongoSource, handlePaymongoWebhook } from "../controllers/paymentController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Online payments (GCash, PayMaya, GrabPay)
router.post("/create-source", auth, createPaymongoSource);

// ✅ Raw body only for webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handlePaymongoWebhook
);

export default router;
