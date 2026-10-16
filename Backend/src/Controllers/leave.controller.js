const { User, Leave, leavetypes } = require('../models');
const { Op } = require('sequelize');

// ========================================================
// 1. HELPER: Full Day = 1 leave, Half Day = 0.5 leave
// ========================================================
function calculateLeaveDays(duration) {
    if (duration === 'Full Day') {
        return 1;
    } else if (duration === 'First Half' || duration === 'Second Half') {
        return 0.5;
    }
    return 1;
}

// ========================================================
// 2. HELPER: Check Leave Limit (Monthly & Yearly Rules)
// ========================================================
async function checkLeaveLimits(userId, leaveType, leaveDate, duration, excludeLeaveId = null) {
    // Step A: Admin ne jo rules set kiye hain, wo leavetypes table se nikalo
    const setting = await leavetypes.findOne({
        where: { name: leaveType }
    });

    // Default limit agar setting na mile
    let yearlyLimit = 12;
    let monthlyLimit = 1;

    if (setting) {
        yearlyLimit = Number(setting.noOfLeaves);
        monthlyLimit = Number(setting.monthlyLimit);
    } else if (leaveType.toLowerCase().includes('sick')) {
        yearlyLimit = 2;
        monthlyLimit = 2;
    } else if (leaveType.toLowerCase().includes('casual')) {
        yearlyLimit = 12;
        monthlyLimit = 1;
    }

    // Step B: Leave date ka Year aur Month nikalo
    const dateObj = new Date(leaveDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0 = Jan, 9 = Oct

    // Mahine ka pehla aur aakhri din
    const startOfMonth = new Date(year, month, 1, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    // Pure saal ka pehla aur aakhri din
    const startOfYear = new Date(year, 0, 1, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Step C: Is employee ki is saal ki pending aur approved leaves dhoondo
    const whereCondition = {
        userId: userId,
        leaveType: leaveType,
        status: { [Op.in]: ['pending', 'approved'] },
        leaveDate: { [Op.between]: [startOfYear, endOfYear] }
    };

    // Agar leave edit/update ho rahi hai, toh apni purani wali count mat karo
    if (excludeLeaveId) {
        whereCondition.id = { [Op.ne]: excludeLeaveId };
    }

    const previousLeaves = await Leave.findAll({ where: whereCondition });

    // Step D: Gin-na shuru karo ki is saal aur is mahine kitni leaves use ho chuki hain
    let yearlyUsed = 0;
    let monthlyUsed = 0;

    for (let i = 0; i < previousLeaves.length; i++) {
        const item = previousLeaves[i];
        const days = calculateLeaveDays(item.duration);

        // Saal ka total
        yearlyUsed = yearlyUsed + days;

        // Agar leave usi mahine me aati hai, toh mahine ka total
        const itemDate = new Date(item.leaveDate);
        if (itemDate >= startOfMonth && itemDate <= endOfMonth) {
            monthlyUsed = monthlyUsed + days;
        }
    }

    // Step E: Nayi leave lene ke baad limit cross ho rahi hai ya nahi
    const newRequestedDays = calculateLeaveDays(duration);

    // 1. Monthly limit check
    if (monthlyUsed + newRequestedDays > monthlyLimit) {
        const remainingMonth = monthlyLimit - monthlyUsed;
        return {
            isAllowed: false,
            message: `${leaveType} monthly limit is ${monthlyLimit} day(s). You have already used ${monthlyUsed} day(s) this month. Remaining quota: ${remainingMonth > 0 ? remainingMonth : 0} day(s).`
        };
    }

    // 2. Yearly limit check (Vacant / Remaining check)
    if (yearlyUsed + newRequestedDays > yearlyLimit) {
        const remainingYear = yearlyLimit - yearlyUsed;
        return {
            isAllowed: false,
            message: `${leaveType} yearly limit is ${yearlyLimit} day(s). You have already used ${yearlyUsed} day(s) this year. Remaining quota: ${remainingYear > 0 ? remainingYear : 0} day(s).`
        };
    }

    return { isAllowed: true };
}

async function leaveCreate(req, res) {
    try {
        const { leaveType, reason, leaveDate, duration} = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!leaveDate) {
            return res.status(400).json({ message: "Leave date is required" });
        }

        // if the user leave in the past day it shows pop up.
        const today = new Date();
        const todayDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0')
        ].join('-');

        const requestedDate = String(leaveDate).split('T')[0];
        if (requestedDate < todayDate) {
            return res.status(400).json({
                message: "Leave date cannot be in the past for a new request"
            });
        }

        // Reason check
        const trimmedReason = reason?.trim();

        if (!trimmedReason) {
            return res.status(400).json({ 
                message: "Reason for leave is required" 
            });
        }

        if (trimmedReason.length > 500) {
            return res.status(400).json({ 
                message: "Reason cannot exceed 500 characters" 
            });
        }
        // duration check
        if (!duration || !duration.trim()) {
            return res.status(400).json({ message: "Duration is required" });
        }

        const startOfDay = new Date(requestedDate + 'T00:00:00.000Z');
        const endOfDay = new Date(requestedDate + 'T23:59:59.999Z');

        // Step 1: Find existing pending or approved leaves
        const existingLeaves = await Leave.findAll({
            where: {
                userId: userId,
                status: {
                    [Op.in]: ['pending', 'approved']
                },
                leaveDate: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        // Step 2: Check every existing leave
        for (const existingLeave of existingLeaves) {

            // Case 1: Full Day leave already exists
            if (existingLeave.duration === 'Full Day') {
                return res.status(400).json({
                    message: 'You already have a Full Day leave on this date.'
                });
            }

            // Case 2: New request is Full Day
            if (duration === 'Full Day') {
                return res.status(400).json({
                    message: 'You already have a leave on this date. Full Day leave is not allowed.'
                });
            }

            // Case 3: Same half-day requested again
            if (existingLeave.duration === duration) {
                return res.status(400).json({
                    message: 'You have already applied for this half-day leave.'
                });
            }

        }

        // Step 3: Check Leave Limits (Monthly aur Yearly quota check)
        const selectedType = leaveType || 'Casual Leave';
        const limitCheck = await checkLeaveLimits(userId, selectedType, leaveDate, duration);
        if (!limitCheck.isAllowed) {
            return res.status(400).json({ message: limitCheck.message });
        }

        const leave = await Leave.create({
            userId,
            leaveType: selectedType,
            reason: trimmedReason,
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
        const id = req.params.id;
        const { reason, leaveDate, duration, leaveType } = req.body;
        const currentUserId = req.user?.id;

        const leave = await Leave.findByPk(id);
        if (!leave) {
            return res.status(404).json({ message: "Leave record not found" });
        }

        // 1. Employee sirf apni hi leave update kar sakta hai
        if (leave.userId !== currentUserId) {
            return res.status(403).json({
                message: "You can only update your own leave request"
            });
        }

        // 2. Approve ya Reject hone se pehle (sirf pending state me) hi update kar sakta hai
        if (leave.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot update leave after it has been ${leave.status}`
            });
        }

        // 3. Date Validation
        const targetDate = leaveDate !== undefined ? leaveDate : leave.leaveDate;
        if (!targetDate) {
            return res.status(400).json({ message: "Leave date is required" });
        }

        const today = new Date();
        const todayDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0')
        ].join('-');

        const requestedDate = String(targetDate).split('T')[0];
        if (requestedDate < todayDate) {
            return res.status(400).json({
                message: "Leave date cannot be in the past for a leave request"
            });
        }

        // 4. Reason Validation
        const targetReason = reason !== undefined ? reason : leave.reason;
        const trimmedReason = targetReason?.trim();

        if (!trimmedReason) {
            return res.status(400).json({ 
                message: "Reason for leave is required" 
            });
        }

        if (trimmedReason.length > 500) {
            return res.status(400).json({ 
                message: "Reason cannot exceed 500 characters" 
            });
        }

        // 5. Duration Validation
        const targetDuration = duration !== undefined ? duration : leave.duration;
        if (!targetDuration || !targetDuration.trim()) {
            return res.status(400).json({ message: "Duration is required" });
        }

        // 6. Overlap check on targetDate (excluding current leave record)
        const startOfDay = new Date(requestedDate + 'T00:00:00.000Z');
        const endOfDay = new Date(requestedDate + 'T23:59:59.999Z');

        const existingLeaves = await Leave.findAll({
            where: {
                id: { [Op.ne]: id },
                userId: currentUserId,
                status: {
                    [Op.in]: ['pending', 'approved']
                },
                leaveDate: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        for (const existingLeave of existingLeaves) {
            if (existingLeave.duration === 'Full Day') {
                return res.status(400).json({
                    message: 'You already have a Full Day leave on this date.'
                });
            }
            if (targetDuration === 'Full Day') {
                return res.status(400).json({
                    message: 'You already have a leave on this date. Full Day leave is not allowed.'
                });
            }
            if (existingLeave.duration === targetDuration) {
                return res.status(400).json({
                    message: 'You have already applied for this half-day leave.'
                });
            }
        }

        // Check Leave Limits for Update (Current leave ID ko exclude karke)
        const targetType = leaveType || leave.leaveType;
        const limitCheck = await checkLeaveLimits(currentUserId, targetType, targetDate, targetDuration, id);
        if (!limitCheck.isAllowed) {
            return res.status(400).json({ message: limitCheck.message });
        }

        const updateData = {
            leaveType: targetType,
            leaveDate: targetDate,
            duration: targetDuration,
            reason: trimmedReason
        };

        await leave.update(updateData);

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
        const roleName = req.user.Role?.name?.toLowerCase();
        const isAdminOrHR = roleName === "admin" || roleName === "hr" || roleName === "manager";

        let whereCondition = {};
        if (!isAdminOrHR) {
            whereCondition.userId = req.user.id;
        }


        // 2. findAndCountAll with Limit & Offset
        const { count, rows } = await Leave.findAndCountAll({
            where:whereCondition,
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

async function leaveStatusUpdate(req, res) {
    try {
        const id = req.params.id;
        const { status, rejection_reason } = req.body;

        // Step 1: Logged-in user ki details nikalna
        const currentUserId = req.user.id;
        const approverRole = req.user.Role?.name?.toLowerCase();

        // Step 2: Database se leave dhoondna
        const leave = await Leave.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                include: ['Role']
            }]
        });

        if (!leave) {
            return res.status(404).json({ message: "Leave record not found" });
        }

        // Step 3: Pata karna ki leave kis employee ne apply ki thi
        const applicantRole = leave.user?.Role?.name?.toLowerCase() || 'employee';

        // Step 4: Simple Hierarchy Check (Kaun kiski leave approve kar sakta hai)
        let isAllowed = false;

        // Rule 1: Employee ki leave -> Manager, HR, ya Admin approve kar sakte hain
        if (applicantRole === 'employee' || applicantRole === 'accountant') {
            if (approverRole === 'manager' || approverRole === 'hr' || approverRole === 'admin') {
                isAllowed = true;
            }
        } 
        // Rule 2: Manager ki leave -> HR ya Admin approve kar sakte hain
        else if (applicantRole === 'manager') {
            if (approverRole === 'hr' || approverRole === 'admin') {
                isAllowed = true;
            }
        } 
        // Rule 3: HR ki leave -> Sirf Admin approve kar sakta hai
        else if (applicantRole === 'hr') {
            if (approverRole === 'admin') {
                isAllowed = true;
            }
        } 
        // Rule 4: Admin ki leave -> Admin khud approve kar sakta hai (Self Admin)
        else if (applicantRole === 'admin') {
            if (approverRole === 'admin') {
                isAllowed = true;
            }
        }

        // Agar approver allowed nahi hai, toh error bhej do
        if (!isAllowed) {
            return res.status(403).json({
                message: `Access Denied: ${approverRole} cannot approve or reject leaves for ${applicantRole}.`
            });
        }

        // Step 5: Self-Approval Check (Admin ko chhodkar koi bhi apni khud ki leave approve nahi kar sakta)
        if (approverRole !== 'admin' && leave.userId === currentUserId) {
            return res.status(403).json({ 
                message: "You cannot approve or reject your own leave request." 
            });
        }

        // Step 6: Agar reject kar rahe hain, toh reason likhna zaroori hai
        if (status === 'rejected' && (!rejection_reason || !rejection_reason.trim())) {
            return res.status(400).json({ message: "Rejection reason is required." });
        }

        // Step 7: Database me status update karo
        await leave.update({
            status: status,
            rejection_reason: status === 'rejected' ? rejection_reason.trim() : null
        });

        return res.status(200).json({ message: `Leave ${status} successfully` });
    } catch (error) {
        console.error("Error updating leave status:", error);
        return res.status(500).json({ message: error.message });
    }
}

// =========================================================================
// 8. GET MY LEAVE BALANCE (Har individual employee sirf apna balance dekhega)
// =========================================================================
async function getMyLeaveBalance(req, res) {
    try {
        // Token se logged-in user ki ID
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            return res.status(401).json({ message: "User not logged in" });
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Current Year ki range
        const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        // Current Month ki range
        const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

        // 1. Admin ne jo active leave types banaye hain wo fetch karo
        const allLeaveTypes = await leavetypes.findAll({
            where: { isArchived: false }
        });

        // 2. Is employee ki is saal ki pending aur approved leaves nikal lo
        const myLeaves = await Leave.findAll({
            where: {
                userId: currentUserId,
                status: { [Op.in]: ['pending', 'approved'] },
                leaveDate: { [Op.between]: [startOfYear, endOfYear] }
            }
        });

        // 3. Har leave type ke liye balance calculate karo
        const balanceList = [];

        for (let i = 0; i < allLeaveTypes.length; i++) {
            const typeItem = allLeaveTypes[i];
            const typeName = typeItem.name;
            const yearlyTotal = Number(typeItem.noOfLeaves) || 12;
            const monthlyTotal = Number(typeItem.monthlyLimit) || 1;

            let yearlyUsed = 0;
            let monthlyUsed = 0;

            // Is specific leave type ki leaves count karo
            for (let j = 0; j < myLeaves.length; j++) {
                const leaveItem = myLeaves[j];
                if (leaveItem.leaveType && leaveItem.leaveType.trim().toLowerCase() === typeName.trim().toLowerCase()) {
                    const days = calculateLeaveDays(leaveItem.duration);
                    yearlyUsed = yearlyUsed + days;

                    const lDate = new Date(leaveItem.leaveDate);
                    if (lDate >= startOfMonth && lDate <= endOfMonth) {
                        monthlyUsed = monthlyUsed + days;
                    }
                }
            }

            // Vacant / Remaining leaves
            const yearlyRemaining = yearlyTotal - yearlyUsed;
            const monthlyRemaining = monthlyTotal - monthlyUsed;

            balanceList.push({
                leaveType: typeName,
                totalYearly: yearlyTotal,
                usedYearly: yearlyUsed,
                remainingYearly: yearlyRemaining > 0 ? yearlyRemaining : 0,
                monthlyLimit: monthlyTotal,
                usedMonthly: monthlyUsed,
                remainingMonthly: monthlyRemaining > 0 ? monthlyRemaining : 0,
                paidStatus: typeItem.paidStatus || 'Paid',
                color: typeItem.color || '#16813D'
            });
        }

        return res.status(200).json({
            message: "Leave balance fetched successfully",
            balances: balanceList
        });

    } catch (error) {
        console.error("Error in getMyLeaveBalance:", error);
        return res.status(500).json({ message: error.message || "Failed to fetch leave balance" });
    }
}

module.exports = {
    leaveCreate,
    leaveUpdate,
    leaveGetAll,
    leaveStatusUpdate,
    getMyLeaveBalance
};

