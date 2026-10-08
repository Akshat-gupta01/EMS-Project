const { Department, User } = require('../models');
const { Op } = require('sequelize');

const addDepartment = async (req, res) => {
    try {
        const { departmentName } = req.body;
        if (!departmentName || !departmentName.trim()) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const existing = await Department.findOne({
            where: { departmentName: departmentName.trim() }
        });
        if (existing) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const department = await Department.create({
            departmentName: departmentName.trim()
        });

        res.status(201).json({
            message: 'Department added successfully',
            department
        });
    } catch (error) {
        console.error("Error in addDepartment:", error);
        res.status(500).json({ message: 'Error adding department', error: error.message });
    }
};

const getallDepartments = async (req, res) => {
    try {
        const { search } = req.query;

        const whereCondition = {};
        if (search && search.trim()) {
            whereCondition.departmentName = {
                [Op.like]: `%${search.trim()}%`
            };
        }

        const department = await Department.findAll({
            where: whereCondition,
            include: [
                {
                    model: User,
                    as: 'employees',
                    attributes: ['id'] // Sirf IDs fetch hongi count nikalne ke liye
                }
            ],
            order: [['id', 'ASC']]
        });
        res.status(200).json({
            message: "Departments fetched successfully",
            department
        });
    } catch (error) {
        console.error("Error in getallDepartments:", error);
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const id = req.params.id;
        const department = await Department.findByPk(id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if any employees are currently assigned to this department
        const employeesInDept = await User.count({ where: { departmentId: id } });
        if (employeesInDept > 0) {
            return res.status(400).json({
                message: `Cannot delete department: ${employeesInDept} employee(s) are assigned to it. Reassign them first.`
            });
        }

        await Department.destroy({ where: { id } });

        res.status(200).json({
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error("Error in deleteDepartment:", error);
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    }
};

async function updateDepartment(req, res) {
    try {
        const id = req.params.id;
        const { departmentName } = req.body;
        if (!departmentName || !departmentName.trim()) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const department = await Department.findByPk(id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        await Department.update(
            { departmentName: departmentName.trim() },
            { where: { id } }
        );

        res.status(200).json({
            message: 'Department updated successfully'
        });
    } catch (error) {
        console.error("Error in updateDepartment:", error);
        res.status(500).json({ message: 'Error updating department', error: error.message });
    }
}

module.exports = { addDepartment, getallDepartments, deleteDepartment, updateDepartment };