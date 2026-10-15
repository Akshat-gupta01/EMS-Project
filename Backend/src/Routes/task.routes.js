const express=require("express")
const router=express.Router()
const {createTask,updateTask,deleteTask,getTask,assignTask}=require("../Controllers/task.controller")
const { checkforAuth } = require('../middleware.js/auth.middleware');
const { checkPermission } = require('../middleware.js/checkpermission.middleware');

router.post("/create-task", checkforAuth, checkPermission("create_task"), createTask);
router.post('/assign-task',checkforAuth,checkPermission("assign_task"),assignTask);
router.patch("/update-task/:id", checkforAuth, checkPermission("update_task"), updateTask);
router.delete("/delete-task/:id", checkforAuth, checkPermission("delete_task"), deleteTask);
router.get("/get-task", checkforAuth, checkPermission("view_task"), getTask);

module.exports=router