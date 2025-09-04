import express from "express";
import LoanController from "../controllers/loanController.js";

const router = express.Router();

router.post("/request", LoanController.requestLoan);
router.get("/user/:userID", LoanController.getUserLoans);

export default router;
