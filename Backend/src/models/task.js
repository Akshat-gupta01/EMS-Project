'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Task.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee'
      });

      Task.belongsTo(models.User, {
      foreignKey: 'assignedBy',
    as: 'assigner'
});
    }
  }
  Task.init({
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      title:{
        type:DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      assignedTo:{
        type:DataTypes.INTEGER,
        allowNull:false
      },
       assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
      priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium'
    },
    
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull:true
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
      defaultValue: 'pending'
    },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
  }, {
    sequelize,
    modelName: 'Task',
  });
  return Task;
};