const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createDeal,
  getDeals,
  expireDeals,
  getDealById,
  updateDeal,
  softDeleteDeal
} = require("../controllers/dealController");

router.post("/create", authMiddleware, createDeal);
router.get("/get", getDeals);

// Manually expire outdated deals
router.patch("/expire", authMiddleware, expireDeals);
router.get("/:id", authMiddleware, getDealById);
router.put("/:id", authMiddleware, updateDeal);
router.delete("/:id", authMiddleware, softDeleteDeal);

module.exports = router;
