const User = require('./User');
const Chat = require('./Chat');
const Blog = require('./Blog');
const Port = require('./Port');
const Linktree = require('./Linktree');
const PublicLinks = require('./PublicLinks');

// Define associations
User.hasMany(Chat, { foreignKey: 'userId', onDelete: 'CASCADE' });
Chat.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Blog, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(Port, { foreignKey: 'userId', onDelete: 'CASCADE' });
Port.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Linktree, { foreignKey: 'userId', onDelete: 'CASCADE' });
Linktree.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PublicLinks, { foreignKey: 'createdBy', onDelete: 'CASCADE' });
PublicLinks.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(PublicLinks, { foreignKey: 'lastUpdatedBy', onDelete: 'CASCADE' });
PublicLinks.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'updater' });

module.exports = {
  User,
  Chat,
  Blog,
  Port,
  Linktree,
  PublicLinks
};
