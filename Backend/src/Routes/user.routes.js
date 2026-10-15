const express=require('express')
const {
    getallUsers,
    getallRoles,
    updateEmployee,
    deleteEmployee,
    createEmployee,
    updateStatus,
    getEmployeeStatusStats
}=require('../Controllers/user.controller');
const router=express.Router();
const { checkPermission } = require('../middleware.js/checkpermission.middleware');
const {checkforAuth}=require('../middleware.js/auth.middleware')

router.get('/get-all-users',checkforAuth,getallUsers);

router.get('/get-all-roles',checkforAuth,getallRoles); 

router.get('/employee-status-stats',checkforAuth,getEmployeeStatusStats);

router.patch('/update-employee/:id',checkforAuth,checkPermission('update_employee'),updateEmployee);

router.delete('/delete-employee/:id',checkforAuth,checkPermission('delete_employee'),deleteEmployee);

router.post('/create-employee',checkforAuth,checkPermission('create_employee'),createEmployee);

router.patch('/update-status/:id',checkforAuth,checkPermission('update_status'),updateStatus);


module.exports=router;