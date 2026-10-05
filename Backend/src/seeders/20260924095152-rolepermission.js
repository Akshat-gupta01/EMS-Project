'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('RolePermissions', [ 
        // admin role (All 20 Permissions)
        { roleId: 1, permissionId: 1 },  // approve_employee
        { roleId: 1, permissionId: 2 },  // update_employee
        { roleId: 1, permissionId: 3 },  // delete_employee
        { roleId: 1, permissionId: 4 },  // manage_roles
        { roleId: 1, permissionId: 5 },  // approve_leave
        { roleId: 1, permissionId: 6 },  // apply_leave
        { roleId: 1, permissionId: 7 },  // view_attendance
        { roleId: 1, permissionId: 8 },  // mark_attendance
        { roleId: 1, permissionId: 9 },  // view_salary
        { roleId: 1, permissionId: 10 }, // view_employees
        { roleId: 1, permissionId: 11 }, // create_department
        { roleId: 1, permissionId: 12 }, // update_department
        { roleId: 1, permissionId: 13 }, // delete_department
        { roleId: 1, permissionId: 14 }, // view_departments
        { roleId: 1, permissionId: 15 }, // update_attendance
        { roleId: 1, permissionId: 16 }, // manage_salary
        { roleId: 1, permissionId: 17 }, // update_salary
        { roleId: 1, permissionId: 18 }, // view_roles
        { roleId: 1, permissionId: 19 }, // view_permissions
        { roleId: 1, permissionId: 20 }, // update_permissions
       
        // hr role
        { roleId: 2, permissionId: 1 },  // approve_employee
        { roleId: 2, permissionId: 2 },  // update_employee
        { roleId: 2, permissionId: 4 },  // manage_roles
        { roleId: 2, permissionId: 5 },  // approve_leave
        { roleId: 2, permissionId: 6 },  // apply_leave
        { roleId: 2, permissionId: 7 },  // view_attendance
        { roleId: 2, permissionId: 8 },  // mark_attendance
        { roleId: 2, permissionId: 9 },  // view_salary
        { roleId: 2, permissionId: 10 }, // view_employees
        { roleId: 2, permissionId: 11 }, // create_department
        { roleId: 2, permissionId: 13 }, // delete_department
        { roleId: 2, permissionId: 14 }, // view_departments
        { roleId: 2, permissionId: 15 }, // update_attendance
        
        // Manager role
        { roleId: 3, permissionId: 5 },  // approve_leave
        { roleId: 3, permissionId: 6 },  // apply_leave
        { roleId: 3, permissionId: 7 },  // view_attendance
        { roleId: 3, permissionId: 9 },  // view_salary
        { roleId: 3, permissionId: 10 }, // view_employees
        { roleId: 3, permissionId: 14 }, // view_departments
        
        // accountant role
        { roleId: 4, permissionId: 6 },  // apply_leave
        { roleId: 4, permissionId: 7 },  // view_attendance
        { roleId: 4, permissionId: 9 },  // view_salary
        { roleId: 4, permissionId: 10 }, // view_employees
        { roleId: 4, permissionId: 16 }, // manage_salary
        { roleId: 4, permissionId: 17 }, // update_salary
       
        // employee role
        { roleId: 5, permissionId: 6 },  // apply_leave
        { roleId: 5, permissionId: 7 },  // view_attendance
        { roleId: 5, permissionId: 9 },  // view_salary
        { roleId: 5, permissionId: 10 }  // view_employees
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('RolePermissions', null, {});
  }
};
