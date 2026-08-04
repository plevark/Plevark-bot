import db from "#db";

const msToTime = (duration) => {
  if (duration <= 0) return '0 segundos';
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const pad = (n) => n.toString().padStart(2, '0');
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
};

export default {
  command: ['steal', 'rob', 'robar'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    try {
      const chat = await db.getChat(msg.chat);
      if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

      // 🔥 OBTENER USUARIO (CREAR SI NO EXISTE)
      let senderData = await db.getChatUser(msg.chat, msg.sender);
      if (!senderData) {
        await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
        await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
        await db.updateChatUser(msg.chat, msg.sender, 'roboCooldown', 0);
        senderData = await db.getChatUser(msg.chat, msg.sender);
      }

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = await db.getSettings(botId);
      const monedas = botSettings?.currency || 'Coins';

      // 🔥 ASEGURAR VALORES NUMÉRICOS
      const senderCoins = typeof senderData.coins === 'number' && !isNaN(senderData.coins) ? senderData.coins : 0;
      const roboCooldown = typeof senderData.roboCooldown === 'number' && !isNaN(senderData.roboCooldown) ? senderData.roboCooldown : 0;

      // 🔥 VALIDAR MENCIONES
      const mentioned = msg.mentionedJid || [];
      const target = mentioned[0] || (msg.quoted ? msg.quoted.sender : null);

      if (!target || target === msg.sender) {
        return msg.reply(`✎ Debes mencionar a quien quieras robarle *${monedas}*.`);
      }

      // 🔥 OBTENER DATOS DEL OBJETIVO
      let targetData = await db.getChatUser(msg.chat, target);
      if (!targetData) {
        await db.updateChatUser(msg.chat, target, 'coins', 0);
        await db.updateChatUser(msg.chat, target, 'bank', 0);
        targetData = await db.getChatUser(msg.chat, target);
      }

      const targetCoins = typeof targetData.coins === 'number' && !isNaN(targetData.coins) ? targetData.coins : 0;
      const targetUser = await db.getUser(target);
      const targetName = targetUser?.name || target.split('@')[0];

      // 🔥 VALIDAR INACTIVIDAD
      const lastActive = targetData.lastSeen || targetData.lastMessage || targetData.usedTime || 0;
      const inactiveTime = Date.now() - lastActive;
      const ONE_HOUR_MS = 60 * 60 * 1000;

      if (inactiveTime < ONE_HOUR_MS) {
        return msg.reply(`⏳ Solo puedes robar a usuarios que lleven al menos *1 hora inactivos*.`);
      }

      if (targetCoins < 50) {
        return msg.reply(`❌ *${targetName}* no tiene suficiente *${monedas}* para robarle.`);
      }

      // 🔥 VALIDAR COOLDOWN
      const remainingTime = roboCooldown - Date.now();
      if (remainingTime > 0) {
        return msg.reply(`⏳ Debes esperar *${msToTime(remainingTime)}* antes de intentar robar nuevamente.`);
      }

      // 🔥 REALIZAR ROBO
      const cantidadRobada = Math.min(Math.floor(Math.random() * 5000) + 50, targetCoins);
      const nuevosSenderCoins = senderCoins + cantidadRobada;
      const nuevosTargetCoins = targetCoins - cantidadRobada;

      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosSenderCoins);
      await db.updateChatUser(msg.chat, target, 'coins', nuevosTargetCoins);
      await db.updateChatUser(msg.chat, msg.sender, 'roboCooldown', Date.now() + 30 * 60 * 1000);

      return msg.reply(`💰 Le robaste *${cantidadRobada.toLocaleString()} ${monedas}* a *${targetName}*.`);
    } catch (e) {
      console.error('Error en steal:', e);
      return msg.reply(msgglobal);
    }
  }
};
