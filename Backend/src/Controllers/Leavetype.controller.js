const { leavetypes } = require('../models');

// 1. Create Leave Type
async function createLeaveType(req, res) {
    try {
        const {
            name,
            allotmentType,
            noOfLeaves,
            monthlyLimit,
            paidStatus,
            color,
            departments,
            designations
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Leave type name is required' });
        }

        const existing = await leavetypes.findOne({
            where: { name: name.trim() }
        });

        if (existing) {
            return res.status(400).json({ message: 'Leave type already exists' });
        }

        const newLeaveType = await leavetypes.create({
            name: name.trim(),
            allotmentType: allotmentType || 'Monthly Leave Type',
            noOfLeaves: noOfLeaves !== undefined ? Number(noOfLeaves) : 12,
            monthlyLimit: monthlyLimit !== undefined ? Number(monthlyLimit) : 1,
            paidStatus: paidStatus || 'Paid',
            color: color || '#16813D',
            departments: departments || [],
            designations: designations || [],
            isArchived: false,
        });

        return res.status(201).json({
            message: 'Leave type created successfully',
            leaveType: newLeaveType
        });
    } catch (error) {
        console.error("Error in createLeaveType:", error);
        return res.status(500).json({ message: 'Error creating leave type', error: error.message });
    }
}

// 2. Get All Leave Types
async function getAllLeaveTypes(req, res) {
    try {
        const list = await leavetypes.findAll({
            order: [['id', 'ASC']]
        });
        return res.status(200).json({
            message: 'Leave types fetched successfully',
            leaveTypes: list
        });
    } catch (error) {
        console.error("Error in getAllLeaveTypes:", error);
        return res.status(500).json({ message: 'Error fetching leave types', error: error.message });
    }
}

// 3. Update Leave Type
async function updateLeaveType(req, res) {
    try {
       const id=req.params.id;
        const {
            name,
            allotmentType,
            noOfLeaves,
            monthlyLimit,
            paidStatus,
            color,
            departments,
            designations,
            isArchived
        } = req.body;

        const record = await leavetypes.findByPk(id);
        if (!record) {
            return res.status(404).json({ message: 'Leave type not found' });
        }

        if (name && name.trim() !== record.name) {
            const existing = await leavetypes.findOne({
                where: { name: name.trim() }
            });
            if (existing) {
                return res.status(400).json({ message: 'Leave type with this name already exists' });
            }
            record.name = name.trim();
        }

        if(allotmentType) record.allotmentType = allotmentType ;
        if (noOfLeaves !== undefined) record.noOfLeaves = Number(noOfLeaves);
        if (monthlyLimit !== undefined) record.monthlyLimit = Number(monthlyLimit);
        if (paidStatus) record.paidStatus = paidStatus;
        if (color) record.color = color;
        if (departments !== undefined) record.departments = departments;
        if (designations !== undefined) record.designations = designations;
        if (isArchived !== undefined) record.isArchived = isArchived;

        await record.save();

        return res.status(200).json({
            message: 'Leave type updated successfully',
            leaveType: record
        });
    } catch (error) {
        console.error("Error in updateLeaveType:", error);
        return res.status(500).json({ message: 'Error updating leave type', error: error.message });
    }
}

// 4. Archive / Unarchive Leave Type
async function archiveLeaveType(req, res) {
    try {
      const id=req.params.id;
      
        const record = await leavetypes.findByPk(id);

        if (!record) {
            return res.status(404).json({ message: 'Leave type not found' });
        }

        record.isArchived = req.body.isArchived !== undefined ? req.body.isArchived : !record.isArchived;
        await record.save();

        return res.status(200).json({
            message: record.isArchived ? 'Leave type archived' : 'Leave type unarchived',
            leaveType: record
        });
    } catch (error) {
        console.error("Error in archiveLeaveType:", error);
        return res.status(500).json({ message: 'Error archiving leave type', error: error.message });
    }
}

// 5. Delete Leave Type
async function deleteLeaveType(req, res) {
    try {
       const id=req.params.id;
        const record = await leavetypes.findByPk(id);

        if (!record) {
            return res.status(404).json({ message: 'Leave type not found' });
        }

        await record.destroy();
        return res.status(200).json({ message: 'Leave type deleted successfully' });
    } catch (error) {
        console.error("Error in deleteLeaveType:", error);
        return res.status(500).json({ message: 'Error deleting leave type', error: error.message });
    }
}

module.exports = {
    createLeaveType,
    getAllLeaveTypes,
    updateLeaveType,
    archiveLeaveType,
    deleteLeaveType
};
