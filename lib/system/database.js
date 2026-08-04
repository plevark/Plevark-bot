import fs from 'fs';

export default {
  initDB() {
    if (!fs.existsSync('./database.json')) {
      fs.writeFileSync('./database.json', JSON.stringify({ chats: {}, users: {} }, null, 2));
    }
  },

  getChat(chatId) {
    const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
    if (!data.chats[chatId]) data.chats[chatId] = {};
    return data.chats[chatId];
  },

  updateChat(chatId, field, value) {
    const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
    if (!data.chats[chatId]) data.chats[chatId] = {};
    data.chats[chatId][field] = value;
    fs.writeFileSync('./database.json', JSON.stringify(data, null, 2));
  },

  getChatUser(chatId, userId) {
    const chat = this.getChat(chatId);
    if (!chat.users) chat.users = {};
    if (!chat.users[userId]) chat.users[userId] = {};
    return chat.users[userId];
  },

  updateChatUser(chatId, userId, field, value) {
    const chat = this.getChat(chatId);
    if (!chat.users) chat.users = {};
    if (!chat.users[userId]) chat.users[userId] = {};
    chat.users[userId][field] = value;
    this.updateChat(chatId, 'users', chat.users);
  },

  setChatUser(chatId, userId, field, value) {
    this.updateChatUser(chatId, userId, field, value);
  },

  getUser(userId) {
    const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
    if (!data.users[userId]) data.users[userId] = {};
    return data.users[userId];
  },

  updateUser(userId, field, value) {
    const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
    if (!data.users[userId]) data.users[userId] = {};
    data.users[userId][field] = value;
    fs.writeFileSync('./database.json', JSON.stringify(data, null, 2));
  },

  setUser(userId, field, value) {
    this.updateUser(userId, field, value);
  },

  getSettings(botId) {
    const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
    if (!data.settings) data.settings = {};
    if (!data.settings[botId]) data.settings[botId] = {};
    return data.settings[botId];
  },

  updateSettings(botId, field, value) {
    const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
    if (!data.settings) data.settings = {};
    if (!data.settings[botId]) data.settings[botId] = {};
    data.settings[botId][field] = value;
    fs.writeFileSync('./database.json', JSON.stringify(data, null, 2));
  },

  setSettings(botId, field, value) {
    this.updateSettings(botId, field, value);
  },

  clearCache() {},

  saveDatabase() {
    try {
      if (fs.existsSync('./database.json')) {
        const data = fs.readFileSync('./database.json', 'utf8');
        fs.writeFileSync('./database_backup.json', data);
      }
    } catch (e) {}
  }
};
