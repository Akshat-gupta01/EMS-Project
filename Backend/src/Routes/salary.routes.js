const express = require('express');
const router = express.Router();
const { addSalary, getAllSalary, updateSalary, getmySalary } = require('../Controllers/salary.controller');
const { checkforAuth } = require('../middleware.js/auth.middleware');
const { checkPermission } = require('../middleware.js/checkpermission.middleware');

router.post("/add-salary", checkforAuth, checkPermission('manage_salary'), addSalary);
router.patch("/update-salary/:id", checkforAuth, checkPermission('update_salary'), updateSalary);
router.get("/get-all-salary", checkforAuth, checkPermission('manage_salary'), getAllSalary);
router.get('/get-my-salary', checkforAuth, checkPermission('view_salary'), getmySalary);

module.exports = router;
