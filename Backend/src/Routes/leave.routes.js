const express = require('express');
const { leaveCreate, leaveUpdate, leaveGetAll } = require('../Controllers/leave.controller');
const { checkforAuth } = require('../middleware.js/auth.middleware');
const { checkPermission } = require('../middleware.js/checkpermission.middleware');

const router = express.Router();

router.post('/apply', checkforAuth, checkPermission('apply_leave'), leaveCreate);
router.patch('/update/:id', checkforAuth,checkPermission('approve_leave'), leaveUpdate);
router.get('/get-all-leave', checkforAuth, leaveGetAll);


module.exports = router;


