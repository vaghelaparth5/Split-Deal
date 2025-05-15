const express = require("express");
const router = express.Router();
const {updateGroupStatus, createGroup} = require("../controllers/groupController");


const authMiddleware = require("../middleware/authMiddleware");

//  Route to create a new group
router.post("/create-group",authMiddleware, createGroup);

//  Route to update group status
router.put("/update-group-status/:id",authMiddleware, updateGroupStatus);

module.exports = router;
