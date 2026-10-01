const { Role } = require('../models');
const { Permission } = require('../models');
const {RolePermission } = require('../models');

async function getAllroles(req, res) {
    try {
        const roles = await Role.findAll({
            include: [{
                model: Permission,
                through: { attributes: [] }
            }]
        });
        res.status(200).json({ roles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllPermission(req, res) {
    try {
        const permissions = await Permission.findAll();
        res.status(200).json({ permissions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createRole(req,res) {
    try {
        const { name } = req.body;
        const role = await Role.create({ name });
        res.status(201).json({ role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updatePermission(req, res) {
    try {
        const roleId = req.params.id;
        const { permissions } = req.body; // Expecting an array of Permission IDs: [1, 3, 5]
        const role = await Role.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        // Sequelize Magic Method: Yeh purani permissions ko automatically naye IDs se replace kar deta hai
        await role.setPermissions(permissions || []);
        res.status(200).json({
            message: "Permissions updated successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = { getAllroles, getAllPermission, createRole, updatePermission };
