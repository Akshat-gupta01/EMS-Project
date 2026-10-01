const { User, Leave } = require('../models');

async function leaveCreate(req, res) {
    try {
        const { leaveType, reason, startDate, endDate } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start Date and End Date are required" });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: "Start Date cannot be after End Date" });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Reason for leave is required" });
        }

        const leave = await Leave.create({
            userId,
            leaveType: leaveType || 'Casual Leave',
            reason: reason.trim(),
            startDate,
            endDate
        });

        return res.status(201).json({ message: "Leave applied successfully", leave });
    } catch (error) {
        console.error("Error creating leave:", error);
        return res.status(500).json({ message: error.message || "Failed to apply leave" });
    }
}

async function leaveUpdate(req, res) {
    try {
        const { id } = req.params;
        const { status, reason, startDate, endDate, leaveType } = req.body;

        const leave = await Leave.findByPk(id);
        if (!leave) {
            return res.status(404).json({ message: "Leave record not found" });
        }

        if (status) leave.status = status;
        if (reason) leave.reason = reason;
        if (startDate) leave.startDate = startDate;
        if (endDate) leave.endDate = endDate;
        if (leaveType) leave.leaveType = leaveType;

        await leave.save();

        return res.status(200).json({ message: "Leave updated successfully", leave });
    } catch (error) {
        console.error("Error updating leave:", error);
        return res.status(500).json({ message: error.message || "Failed to update leave" });
    }
}

async function leaveGetAll(req, res) {
    try {
        const leaves = await Leave.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ message: "All leaves fetched successfully", leaves });
    } catch (error) {
        console.error("Error fetching all leaves:", error);
        return res.status(500).json({ message: error.message || "Failed to fetch leaves" });
    }
}



module.exports = {
    leaveCreate,
    leaveUpdate,
    leaveGetAll,
};

