import Contribution from "../models/Contribution.js";
import pool from "../config/db.js";

// Get all contributions for the authenticated user
const getUserContributions = async (req, res) => {
  try {
    const userID = req.user.id;
    
    // First get the member ID for this user
    const memberRowsResult = await pool.query(
      "SELECT memberID FROM members WHERE userID = $1",
      [userID]
    );
    const memberRows = memberRowsResult.rows;

    if (memberRows.length === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    const memberID = memberRows[0].memberID;
    const contributions = await Contribution.getByMemberId(memberID);
    
    // Get member statistics
    const stats = await Contribution.getMemberStats(memberID);
    
    return res.json({
      success: true,
      data: {
        contributions,
        stats: {
          totalContributions: stats.totalContributions || 0,
          totalConfirmed: parseFloat(stats.totalConfirmed || 0),
          totalPending: parseFloat(stats.totalPending || 0),
          totalRejected: parseFloat(stats.totalRejected || 0),
          averageAmount: parseFloat(stats.averageAmount || 0)
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Create a new contribution
const createContribution = async (req, res) => {
  try {
    const userID = req.user.id;
    const { amount, paymentMethod, contributionDate, notes, referenceNo } = req.body;

    // Validate required fields
    if (!amount || !paymentMethod || !contributionDate) {
      return res.status(400).json({
        success: false,
        message: "Amount, payment method, and contribution date are required"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    const validPaymentMethods = ["qrph", "gcash", "maya", "bank_transfer", "cash"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    // Get memberID
    const memberRowsResult = await pool.query(
      "SELECT memberID FROM members WHERE userID = $1",
      [userID]
    );
    const memberRows = memberRowsResult.rows;
    if (memberRows.length === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const memberID = memberRows[0].memberID;

    // Handle file upload
    const paymentProof = req.file ? req.file.filename : null; // multer will give filename or path

    // Create the contribution
    const contributionID = await Contribution.create({
      memberID,
      userID,
      amount,
      paymentMethod,
      paymentProof,
      contributionDate,
      notes,
      referenceNo
    });

    const newContribution = await Contribution.getById(contributionID);

    return res.status(201).json({
      success: true,
      message: "Contribution submitted, pending admin verification",
      data: newContribution
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get contribution by ID
const getContributionById = async (req, res) => {
  try {
    const { contributionID } = req.params;
    const userID = req.user.id;

    const contribution = await Contribution.getById(contributionID);
    
    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found"
      });
    }

    // Check if user owns this contribution or is admin
    if (contribution.userID !== userID && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    return res.json({
      success: true,
      data: contribution
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Update contribution status (admin only)
const updateContributionStatus = async (req, res) => {
  try {
    const { contributionID } = req.params;
    const { status, notes } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const success = await Contribution.updateStatus(contributionID, status, notes);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found"
      });
    }

    // Get updated contribution
    const updatedContribution = await Contribution.getById(contributionID);

    return res.json({
      success: true,
      message: "Contribution status updated successfully",
      data: updatedContribution
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// Get all contributions (admin only)
const getAllContributions = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    const { status, paymentMethod, startDate, endDate } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const contributions = await Contribution.getAll(filters);

    return res.json({
      success: true,
      data: contributions
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

export {
  getUserContributions,
  createContribution,
  getContributionById,
  updateContributionStatus,
  getAllContributions
};
