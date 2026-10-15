'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title:{
        type:Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      assignedTo:{
        type:Sequelize.INTEGER,
        allowNull:false,
        
      },
       assignedBy: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
      priority: {
      type: Sequelize.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium'
    },
    
    dueDate: {
      type: Sequelize.DATEONLY,
      allowNull:true
    },
    status: {
      type: Sequelize.ENUM('pending', 'in-progress', 'completed'),
      defaultValue: 'pending'
    },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tasks');
  }
};