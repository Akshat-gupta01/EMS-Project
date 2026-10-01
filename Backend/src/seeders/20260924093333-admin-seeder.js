'use strict';
const bcrypt=require('bcrypt');
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
   const hashedPassword = await bcrypt.hash("Admin@123", 10);
   await queryInterface.bulkInsert('Users', [{
      username: 'Admin',
      email: "admin26@gmail.com",
      password: hashedPassword,
      roleId: 1,
      departmentId: null,
      isVerified: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  }
};
