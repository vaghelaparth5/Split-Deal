const express = require("express");
const router = express.Router();
const {
  createDeal,
  getDeals,
  expireDeals
} = require("../controllers/dealController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a new deal
router.post("/create", authMiddleware, createDeal);

// Get all deals
router.get("/get", getDeals);

// Manually expire outdated deals
router.patch("/expire", authMiddleware, expireDeals);

module.exports = router;
