'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('RolePermissions', [ 
        // Permission ID mapping (as per permission seeder order):
        // 1=create_employee, 2=update_employee, 3=delete_employee, 4=view_employees
        // 5=manage_roles, 6=approve_leave, 7=apply_leave, 8=view_attendance
        // 9=mark_attendance, 10=view_attendance_reports, 11=update_attendance
        // 12=create_department, 13=update_department, 14=delete_department
        // 15=view_departments, 16=view_salary, 17=manage_salary, 18=update_salary
        // 19=view_roles, 20=view_permissions, 21=update_permissions, 22=update_status

        // Admin role (All permissions)
        { roleId: 1, permissionId: 1 },  // create_employee
        { roleId: 1, permissionId: 2 },  // update_employee
        { roleId: 1, permissionId: 3 },  // delete_employee
        { roleId: 1, permissionId: 4 },  // view_employees
        { roleId: 1, permissionId: 5 },  // manage_roles
        { roleId: 1, permissionId: 6 },  // approve_leave
        { roleId: 1, permissionId: 7 },  // apply_leave
        { roleId: 1, permissionId: 8 },  // view_attendance
        { roleId: 1, permissionId: 9 },  // mark_attendance
        { roleId: 1, permissionId: 10 }, // view_attendance_reports
        { roleId: 1, permissionId: 11 }, // update_attendance
        { roleId: 1, permissionId: 12 }, // create_department
        { roleId: 1, permissionId: 13 }, // update_department
        { roleId: 1, permissionId: 14 }, // delete_department
        { roleId: 1, permissionId: 15 }, // view_departments
        { roleId: 1, permissionId: 16 }, // view_salary
        { roleId: 1, permissionId: 17 }, // manage_salary
        { roleId: 1, permissionId: 18 }, // update_salary
        { roleId: 1, permissionId: 19 }, // view_roles
        { roleId: 1, permissionId: 20 }, // view_permissions
        { roleId: 1, permissionId: 21 }, // update_permissions
        { roleId: 1, permissionId: 22 }, // update_status

        // HR role
        { roleId: 2, permissionId: 1 },  // create_employee
        { roleId: 2, permissionId: 2 },  // update_employee
        { roleId: 2, permissionId: 4 },  // view_employees
        { roleId: 2, permissionId: 5 },  // manage_roles
        { roleId: 2, permissionId: 6 },  // approve_leave
        { roleId: 2, permissionId: 7 },  // apply_leave
        { roleId: 2, permissionId: 8 },  // view_attendance
        { roleId: 2, permissionId: 9 },  // mark_attendance
        { roleId: 2, permissionId: 10 }, // view_attendance_reports
        { roleId: 2, permissionId: 11 }, // update_attendance
        { roleId: 2, permissionId: 12 }, // create_department
        { roleId: 2, permissionId: 14 }, // delete_department
        { roleId: 2, permissionId: 15 }, // view_departments
        { roleId: 2, permissionId: 16 }, // view_salary
        { roleId: 2, permissionId: 22 }, // update_status

        // Manager role
        { roleId: 3, permissionId: 4 },  // view_employees
        { roleId: 3, permissionId: 6 },  // approve_leave
        { roleId: 3, permissionId: 7 },  // apply_leave
        { roleId: 3, permissionId: 8 },  // view_attendance
        { roleId: 3, permissionId: 10 }, // view_attendance_reports
        { roleId: 3, permissionId: 15 }, // view_departments
        { roleId: 3, permissionId: 16 }, // view_salary

        // Accountant role
        { roleId: 4, permissionId: 4 },  // view_employees
        { roleId: 4, permissionId: 7 },  // apply_leave
        { roleId: 4, permissionId: 8 },  // view_attendance
        { roleId: 4, permissionId: 15 }, // view_departments
        { roleId: 4, permissionId: 16 }, // view_salary
        { roleId: 4, permissionId: 17 }, // manage_salary
        { roleId: 4, permissionId: 18 }, // update_salary

        // Employee role
        { roleId: 5, permissionId: 4 },  // view_employees
        { roleId: 5, permissionId: 7 },  // apply_leave
        { roleId: 5, permissionId: 8 },  // view_attendance
        { roleId: 5, permissionId: 15 }, // view_departments
        { roleId: 5, permissionId: 16 }, // view_salary
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RolePermissions', null, {});
  }
};
