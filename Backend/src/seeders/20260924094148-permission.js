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
    await queryInterface.bulkInsert('Permissions', [
          { name: "create_employee" },
          { name: "update_employee" },
          { name: "delete_employee" },
          { name: "manage_roles" },
          { name: "approve_leave" },
          { name: "apply_leave" },
          { name: "view_attendance" },
          { name: "mark_attendance" },
          { name: "view_salary" },
          { name: "view_employees" },
          { name: "create_department" },
          { name: "update_department" },
          { name: "delete_department" },
          { name: "view_departments" },
          { name: "update_attendance" },
          { name: "manage_salary" },
          { name: "update_salary" },
          { name: "view_roles" },
          { name: "view_permissions" },
          { name: "update_permissions" },
      ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
