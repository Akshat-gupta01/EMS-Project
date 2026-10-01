const express=require('express');
const {addDepartment,updateDepartment,getallDepartments,deleteDepartment}=require('../Controllers/dept.controller');
const router=express.Router();
const { checkforAuth}=require('../middleware.js/auth.middleware')
const {checkPermission}=require('../middleware.js/checkpermission.middleware')


router.post('/add-department',checkforAuth,checkPermission('create_department'),addDepartment);
router.patch('/update-department/:id',checkforAuth,checkPermission('update_department'),updateDepartment);
router.get('/get-all-departments',checkforAuth,checkPermission('view_departments'),getallDepartments);
router.delete('/delete-department/:id',checkforAuth,checkPermission('delete_department'),deleteDepartment);

module.exports=router;  