'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class leavetypes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here if needed
    }
  }

  leavetypes.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    allotmentType: {
      type: DataTypes.STRING,
      defaultValue: 'Yearly'
    },
    noOfLeaves: {
      type: DataTypes.INTEGER,
      defaultValue: 12
    },
    monthlyLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    paidStatus: {
      type: DataTypes.STRING,
      defaultValue: 'Paid'
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#16813D'
    },
    departments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    designations: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'leavetypes',
    tableName: 'leavetypes'
  });

  return leavetypes;
};