const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isFromDev: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readByUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readByDev: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'createdAt']
    }
  ]
});

module.exports = Chat;
