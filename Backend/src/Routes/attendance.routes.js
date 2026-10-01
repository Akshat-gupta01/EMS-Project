const express=require('express');
const { markAttendance,getallAttendance,updateAttendance } = require('../Controllers/attendance.controller');
const { checkforAuth } = require('../middleware.js/auth.middleware');
const { checkPermission } = require('../middleware.js/checkpermission.middleware');
const router=express.Router();

// Applying middleware to all attendance routes

router.post('/mark',checkforAuth,checkPermission('mark_attendance'),markAttendance);
router.get('/get-attendance',checkforAuth,checkPermission('view_attendance'),getallAttendance);
router.patch('/attendance/:id',checkforAuth,checkPermission('update_attendance'),updateAttendance);

module.exports=router;