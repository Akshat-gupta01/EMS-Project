const { User, Leave } = require('../models');
const { Op } = require('sequelize');

async function leaveCreate(req, res) {
    try {
        const { leaveType, reason, leaveDate, duration} = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!leaveDate) {
            return res.status(400).json({ message: "Leave date is required" });
        }

        if (!duration || !duration.trim()) {
            return res.status(400).json({ message: "Duration is required" });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Reason for leave is required" });
        }

        const leave = await Leave.create({
            userId,
            leaveType: leaveType || 'Casual Leave',
            reason: reason.trim(),
            leaveDate,
            duration,
            status:'pending'
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
        const { status, reason, leaveDate, duration, leaveType, rejection_reason } = req.body;

        const leave = await Leave.findByPk(id);
        if (!leave) {
            return res.status(404).json({ message: "Leave record not found" });
        }

        if (status) leave.status = status;
        if (reason) leave.reason = reason;
        if (leaveDate) leave.leaveDate = leaveDate;
        if (duration) leave.duration = duration;
        if (leaveType) leave.leaveType = leaveType;
        if (rejection_reason !== undefined) leave.rejection_reason = rejection_reason;

        await leave.save();

        return res.status(200).json({ message: "Leave updated successfully", leave });
    } catch (error) {
        console.error("Error updating leave:", error);
        return res.status(500).json({ message: error.message || "Failed to update leave" });
    }
}

async function leaveGetAll(req, res) {
    try {
        const { search } = req.query;
        // 1. Pagination Parameters (Default: Page 1, Limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 2. findAndCountAll with Limit & Offset
        const { count, rows } = await Leave.findAndCountAll({
            limit: limit,
            offset: offset,
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
            order: [['createdAt', 'DESC']]
        });

        // 4. Send Response with Pagination Info
        return res.status(200).json({
            message: "All leaves fetched successfully",
            leaves: rows,
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            itemsPerPage: limit
        });
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

