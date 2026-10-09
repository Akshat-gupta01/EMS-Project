const {User, Role, Department} = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op, where } = require('sequelize');

async function createEmployee(req, res) {
    try {
        const { username, email, password, roleId, departmentId } = req.body;

        const user = await User.findOne({
            where: { email: email }
        });

        if (user) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username: username,
            email: email,
            password: hash,
            roleId: roleId,
            departmentId: departmentId || null,
            status: 'pending',
            isVerified: true
        });

        res.status(201).json({
            message: 'Employee created successfully',
            user: newUser
        });
    } catch (err) {
        console.error("Error in createEmployee:", err);
        res.status(500).json({ message: 'Error creating employee', error: err.message });
    }
}

async function getallUsers(req, res) {
  try {
    const { status, search } = req.query;

    // 1. Pagination Parameters (Default: Page 1, Limit 10)
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // items per page
    const offset = (page - 1) * limit; // number of items to skip

    // 2. Filter Condition
    const whereCondition = {};
    if (status) {
      whereCondition.status = status;
    }

    if (search) {
      whereCondition.username = {
        [Op.like]: `%${search}%`
      };
    }

    // 3. findAndCountAll with Limit & Offset
    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [['id', 'ASC']],
      attributes: ['id', 'username', 'email', 'status', 'departmentId', 'roleId'],
      include: [
        {
          model: Role,
          attributes: ['id', 'name']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'departmentName']
        }
      ]
    });

    // 4. Send Response with Pagination Info
    res.status(200).json({
      message: 'All users',
      user: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      itemsPerPage: limit
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function updateRole(req, res) {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        await User.update({
            roleId: req.body.roleId
        }, { where: { id } });

        res.status(200).json({
            message: 'Role updated successfully'
        });
    } catch (error) {
        console.error("Error in updateRole:", error);
        res.status(500).json({ message: 'Error updating role', error: error.message });
    }
}

async function updateDepartment(req, res) {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (user.roleId === 1) {
            return res.status(400).json({
                message: 'Cannot assign department to an Admin'
            });
        }
        await User.update({
            departmentId: req.body.departmentId
        }, { where: { id } });

        res.status(200).json({
            message: 'Department assigned successfully'
        });
    } catch (error) {
        console.error("Error in updateDepartment:", error);
        res.status(500).json({ message: 'Error updating department', error: error.message });
    }
}

async function updateEmployee(req, res) {
    try {
        const id = req.params.id;
        const { username, email, roleId, departmentId, status } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;

        // If user is Admin (roleId 1), protect from changing role/dept or deactivating
        if (user.roleId === 1) {
            if (status !== undefined && status !== 'active') {
                return res.status(400).json({ message: 'Cannot deactivate an Admin account' });
            }
        } else {
            if (roleId !== undefined) updateData.roleId = roleId ? Number(roleId) : null;
            if (departmentId !== undefined) updateData.departmentId = departmentId ? Number(departmentId) : null;
            if (status !== undefined) updateData.status = status;
        }

        await User.update(updateData, { where: { id } });

        res.status(200).json({
            message: 'Employee updated successfully'
        });
    } catch (error) {
        console.error("Error in updateEmployee:", error);
        res.status(500).json({ message: 'Error updating employee', error: error.message });
    }
}

async function deleteEmployee(req, res) {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        if (user.roleId === 1) {
            return res.status(400).json({
                message: 'Cannot delete an Admin account'
            });
        }
        await User.destroy({ where: { id } });
        res.status(200).json({
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error("Error in deleteEmployee:", error);
        res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
}

async function getallRoles(req, res) {
    try {
        const roles = await Role.findAll();
        res.status(200).json({
            message: 'All roles',
            roles: roles
        });
    } catch (err) {
        console.error("Error in getallRoles:", err);
        res.status(500).json({ message: err.message });
    }
}

async function updateStatus(req, res) {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.roleId === 1 && req.body.status !== 'active') {
            return res.status(400).json({ message: 'Cannot deactivate an Admin account' });
        }

        const updateUser = await User.update({
            status: req.body.status
        }, { where: { id: id } });

        res.status(200).json({
            message: 'Status updated successfully',
            user:updateUser
        });
    } catch (error) {
        console.error("Error in updateStatus:", error);
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
}

async function getEmployeeStatusStats(req, res) {
    try {
        const active = await User.count({
            where: { 
                status: "active",
                roleId: { [Op.ne]: 1 }
            }
        });

        const inactive = await User.count({
            where: { 
                status: "inactive",
                roleId: { [Op.ne]: 1 }
            }
        });

        const pending = await User.count({
            where: { 
                status: "pending",
                roleId: { [Op.ne]: 1 }
            }
        });

        res.status(200).json({
            active,
            inactive,
            pending
        });
    } catch (error) {
        console.error("Error in getEmployeeStatusStats:", error);
        res.status(500).json({ message: "Error fetching employee status stats", error: error.message });
    }
}

module.exports = { 
    getallUsers, 
    updateRole, 
    updateEmployee, 
    deleteEmployee, 
    updateDepartment, 
    getallRoles, 
    createEmployee,
    updateStatus,
    getEmployeeStatusStats
};