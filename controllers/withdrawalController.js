import { Withdrawal } from "../models/withdrawalModel.js";
import pool from "../config/db.js";

// Create a withdrawal (member)
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, reason, date } = req.body;
    const { id: userID, role } = req.user || {};

    if (!userID || role !== "member") {
      return res.status(403).json({ message: "Unauthorized or missing member info." });
    }

    if (!amount || !reason || !date) {
      return res.status(400).json({ message: "All fields required." });
    }

    // ✅ Fetch the correct memberID for this user
    const [memberRows] = await pool.query(
      "SELECT memberID FROM members WHERE userID = ?",
      [userID]
    );

    if (!memberRows.length) {
      return res.status(400).json({ message: "Member record not found for this user." });
    }

    const memberID = memberRows[0].memberID;

    // ✅ Create withdrawal with correct memberID
    const withdrawal = await Withdrawal.create({ memberID, userID, amount, reason, date });

    res.status(201).json({ message: "Withdrawal request submitted.", withdrawal });
  } catch (err) {
    console.error("Error creating withdrawal:", err);
    res.status(500).json({ message: "Server error." });
  }
};


// Get withdrawals by user
export const getWithdrawalsByUser = async (req, res) => {
  try {
    const { userID } = req.params;
    const withdrawals = await Withdrawal.findAllByUser(userID);
    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all withdrawals (admin)
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.findAll();
    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

  // Update withdrawal status (admin)
  export const updateWithdrawalStatus = async (req, res) => {
    try {
      const { withdrawalID } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }

      const updated = await Withdrawal.updateStatus(withdrawalID, status);
      if (!updated) return res.status(404).json({ message: "Withdrawal not found." });

      res.json({ message: `Withdrawal ${status} successfully.` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error." });
    }
  };
