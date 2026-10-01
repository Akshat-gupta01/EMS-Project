const express=require('express')
const {getallUsers,getallRoles,updateRole,updateEmployee,deleteEmployee,updateDepartment}=require('../Controllers/user.controller');
const router=express.Router();
const { checkPermission } = require('../middleware.js/checkpermission.middleware');
const {checkforAuth}=require('../middleware.js/auth.middleware')

router.get('/get-all-users',checkforAuth,checkPermission('view_employees'),getallUsers); // useful

router.get('/get-all-roles',checkforAuth,getallRoles); 

router.patch('/update-role/:id',checkforAuth,checkPermission('manage_roles'),updateRole) // useful

router.patch('/update-employee/:id',checkforAuth,checkPermission('update_employee'),updateEmployee) // useful

router.delete('/delete-employee/:id',checkforAuth,checkPermission('delete_employee'),deleteEmployee) // useful

router.patch('/update-department/:id',checkforAuth,checkPermission('update_department'),updateDepartment) // useful


module.exports=router;