const User = require('./User');
const Chat = require('./Chat');
const Blog = require('./Blog');

// Define associations
User.hasMany(Chat, { foreignKey: 'userId', onDelete: 'CASCADE' });
Chat.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Blog, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = {
  User,
  Chat,
  Blog
};
