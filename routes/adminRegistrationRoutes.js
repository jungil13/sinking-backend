import express from "express";
import {
  getRegistrations,
  approveRegistration,
  rejectRegistration,
  suspendMember,
  reactivateMember,
  getRegistrationStats
} from "../controllers/adminRegistrationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all registrations
router.get("/", getRegistrations);

// Get registration statistics
router.get("/stats", getRegistrationStats);

// Approve a registration
router.post("/:userId/approve", approveRegistration);

// Reject a registration
router.post("/:userId/reject", rejectRegistration);

// Suspend a member
router.post("/:userId/suspend", suspendMember);

// Reactivate a member
router.post("/:userId/reactivate", reactivateMember);

export default router;
