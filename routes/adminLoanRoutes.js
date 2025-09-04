import express from "express";
import AdminLoanController from "../controllers/adminLoanController.js";

const router = express.Router();

/**
 * GET /api/admin/loans
 * query: page, limit, search, status, sortBy, sortDir
 */
router.get("/", AdminLoanController.listLoans);

/**
 * GET /api/admin/loans/stats
 */
router.get("/stats", AdminLoanController.stats);

/**
 * GET /api/admin/loans/:loanID
 */
router.get("/:loanID", AdminLoanController.getLoan);

/**
 * PUT /api/admin/loans/:loanID/status
 * body: { status: 'approved'|'rejected'|'active'|'completed' }
 */
router.put("/:loanID/status", AdminLoanController.updateLoanStatus);


export default router;
