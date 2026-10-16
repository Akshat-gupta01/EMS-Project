'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leavetypes', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      allotmentType: {
        type: Sequelize.STRING,
        defaultValue: 'Yearly'
      },
      noOfLeaves: {
        type: Sequelize.INTEGER,
        defaultValue: 12
      },
      monthlyLimit: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      paidStatus: {
        type: Sequelize.STRING,
        defaultValue: 'Paid'
      },
      color: {
        type: Sequelize.STRING,
        defaultValue: '#16813D'
      },
      departments: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      designations: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      isArchived: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('leavetypes');
  }
};