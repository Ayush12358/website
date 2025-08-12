const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Port = sequelize.define('Port', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  port: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
      min: 1,
      max: 65535
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'ports',
  timestamps: true
});

module.exports = Port;
