const express = require("express");
const { checkforAuth } = require("../middleware.js/auth.middleware");
const {
    createLeaveType,
    getAllLeaveTypes,
    updateLeaveType,
    archiveLeaveType,
    deleteLeaveType
} = require("../Controllers/Leavetype.controller");

const router = express.Router();

router.post("/add-leavetype", checkforAuth, createLeaveType);
router.get("/get-all-leavetypes", checkforAuth, getAllLeaveTypes);
router.patch("/update-leavetype/:id", checkforAuth, updateLeaveType);
router.patch("/archive-leavetype/:id", checkforAuth, archiveLeaveType);
router.delete("/delete-leavetype/:id", checkforAuth, deleteLeaveType);

module.exports = router;