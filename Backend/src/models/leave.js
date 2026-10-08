'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Leave extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Leave.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Leave.init({
   id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER
      },
      leaveDate:{
        type:DataTypes.DATE
      },
      duration:{
        type:DataTypes.STRING
      },
      leaveType: {
        type: DataTypes.STRING
      },
      reason: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING,
        defaultValue:"pending"
      },
      rejection_reason:{
        type:DataTypes.STRING
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
    modelName: 'Leave',
  });
  return Leave;
};