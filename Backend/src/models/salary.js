'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Salary.belongsTo(models.User, {
        foreignKey: 'userId',
        as:'user'
      })


    }
  }
  Salary.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      userId:{
        type: DataTypes.INTEGER
      },
      basicSalary: {
        type: DataTypes.INTEGER
      },
      bonus: {
        type: DataTypes.INTEGER
      },
      deduction: {
        type: DataTypes.INTEGER
      },
      netsalary: {
        type: DataTypes.INTEGER
      },
      month: {
        type: DataTypes.STRING
      },
      year: {
        type: DataTypes.STRING
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
    modelName: 'Salary',
  });
  return Salary;
};