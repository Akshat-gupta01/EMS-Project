const express = require("express");
const router = express.Router();
const { getAllroles, getAllPermission, createRole, updatePermission } = require("../Controllers/role.controller");
const { checkforAuth } = require('../middleware.js/auth.middleware');
const { checkPermission } = require('../middleware.js/checkpermission.middleware');

router.get('/roles', checkforAuth, checkPermission('view_roles'), getAllroles);
router.get('/permissions', checkforAuth, checkPermission('view_permissions'), getAllPermission);
router.post('/create-role', checkforAuth, checkPermission('manage_roles'), createRole);
router.patch('/edit-role/:id/permissions', checkforAuth, checkPermission('update_permissions'), updatePermission);

module.exports = router;