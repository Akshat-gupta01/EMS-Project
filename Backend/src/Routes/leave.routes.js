const express = require('express');
const { 
    leaveCreate, 
    leaveUpdate, 
    leaveGetAll, 
    leaveStatusUpdate,
    getMyLeaveBalance 
} = require('../Controllers/leave.controller');
const { checkforAuth } = require('../middleware.js/auth.middleware');
const { checkPermission } = require('../middleware.js/checkpermission.middleware');

const router = express.Router();

router.post('/apply', checkforAuth, checkPermission('apply_leave'), leaveCreate);
router.patch('/update/:id', checkforAuth, checkPermission('update_leave'), leaveUpdate);
router.patch('/status/:id', checkforAuth, checkPermission('approve_leave'), leaveStatusUpdate);
router.get('/get-all-leave', checkforAuth, leaveGetAll);
router.get('/my-balance', checkforAuth, getMyLeaveBalance);

module.exports = router;


