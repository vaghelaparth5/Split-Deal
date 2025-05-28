// src/routes/dealRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Import controller functions
const {
  createDeal,
  getDeals,
  expireDeals,
  getDealById,
  updateDeal,
  softDeleteDeal
} = require("../controllers/dealController");

// -----------------------------
// Protected and Public Routes
// -----------------------------

// Create a new deal (requires authentication)
router.post("/create", authMiddleware, createDeal);

// Retrieve all active deals (publicly accessible)
router.get("/get", getDeals);

// Manually expire outdated deals (requires authentication)
router.patch("/expire", authMiddleware, expireDeals);

// Retrieve a deal by its ID (requires authentication)
router.get("/:id", authMiddleware, getDealById);

// Update an existing deal by ID (requires authentication)
router.put("/:id", authMiddleware, updateDeal);

// Soft delete a deal (mark as inactive instead of removing from DB)
router.delete("/:id", authMiddleware, softDeleteDeal);

// -----------------------------
// Development/Debug Route
// -----------------------------

// Debug-only route to fetch all deals, including inactive or expired ones
// Note: This route should be removed or secured before production deployment
router.get("/debug/all", async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 }).limit(10);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deals', error: err.message });
  }
});

module.exports = router;
