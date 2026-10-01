const { where } = require('sequelize');
const {User, Role, Department} = require('../models');
const jwt = require('jsonwebtoken');



async function getallUsers(req,res){
   try {
      const user = await User.findAll({
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
      res.status(200).json({
         message: 'All users',
         user: user
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
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        await User.update({
            username: req.body.username,
            email: req.body.email
        }, { where: { id } });

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

module.exports = { getallUsers, updateRole, updateEmployee, deleteEmployee, updateDepartment, getallRoles };