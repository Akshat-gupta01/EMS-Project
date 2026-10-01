'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User belongs to one Role
      User.belongsTo(models.Role, {
          foreignKey: "roleId"
        });
      // User belongs to one Department
      User.belongsTo(models.Department, {
          foreignKey: 'departmentId',
          as: 'department'
        });

    User.hasMany(models.Attendance, {
    foreignKey: 'userId',
    as: 'attendances'
})

  User.hasMany(models.Salary, {
    foreignKey: 'userId',
    as: 'salaries'
  });

  User.hasMany(models.Leave, {
    foreignKey: 'userId',
    as: 'leaves'
  });
// Matlab: "Ek user ke paas bahut saari attendances ho sakti hain"

    }
  }
  User.init({
   id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      username: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        
      },
      password: {
        type: DataTypes.STRING
      },
       isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
     roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Roles',
          key: 'id'
        }
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Departments',
          key: 'id'
        }
      },
    status: {
      type: DataTypes.STRING,
    },
     profilePhoto: {
      type: DataTypes.STRING,

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
    modelName: 'User',
  });
  return User;
};