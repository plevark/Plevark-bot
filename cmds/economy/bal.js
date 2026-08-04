import db from "#db";

export default {
  command: ['balance', 'bal'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chatId = msg.chat;
    const chatData = await db.getChat(msg.chat);
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = await db.getSettings(botId);
    const monedas = botSettings.currency || 'Plecoins';

    if (chatData.adminonly || !chatData.rpg)
      return msg.reply(mess.comandooff);

    const mentioned = msg.mentionedJid;
    const who = mentioned.length > 0 ? mentioned[0] : (msg.quoted ? msg.quoted.sender : msg.sender);

    // 🔥 Obtener usuario del chat y global
    const user = await db.getChatUser(msg.chat, who);
    const user2 = await db.getUser(who);
    
    if (!user) {
      return msg.reply(`《✧》 El usuario mencionado no está registrado en el bot.`);
    }

    // 🔥 VALIDACIÓN: Asegurar que coins y bank sean números
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const bank = typeof user.bank === 'number' && !isNaN(user.bank) ? user.bank : 0;
    const total = coins + bank;

    // 🔥 Si el usuario no tiene nombre, usar 'Usuario'
    const nombre = user2?.name || 'Usuario';

    const bal = `*ꕥ Balance de ›* ${nombre}

  ➠ *${monedas}* : *¥${coins.toLocaleString()}*
  ➠ *Banco* : *¥${bank.toLocaleString()}*
  ➠ *Total* : *¥${total.toLocaleString()}*

> Para proteger tus *${monedas}*, depósitalas en el banco usando *${prefix}dep*`;

    await sock.reply(msg.chat, bal, msg);
  }
};