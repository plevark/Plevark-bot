import db from "#db";

export default {
  command: ['ritual'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'ritualCooldown', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const ritualCooldown = typeof user.ritualCooldown === 'number' && !isNaN(user.ritualCooldown) ? user.ritualCooldown : 0;

    // 🔥 VALIDAR COOLDOWN
    const remaining = ritualCooldown - Date.now();
    if (remaining > 0) {
      return msg.reply(`⏳ Debes esperar *${msToTime(remaining)}* para invocar otro ritual.`);
    }

    // 🔥 GENERAR RESULTADO
    const roll = Math.random();
    let reward = 0;
    let narration = '';
    let bonusMsg = '';
    let nuevosCoins = coins;

    if (roll < 0.05) {
      // 🌟 ÉPICO (5%)
      reward = Math.floor(Math.random() * 100000) + 50000;
      narration = '🌟 ¡Has invocado un espíritu ancestral que te entrega un tesoro cósmico!';
      bonusMsg = '\n✨ Recompensa MÍTICA obtenida!';
    } 
    else if (roll < 0.25) {
      // 🎁 BUENO (20%)
      reward = Math.floor(Math.random() * 10000) + 2000;
      narration = '🌙 Tu ritual abre un portal y caen riquezas ardientes del vacío';
    } 
    else if (roll < 0.75) {
      // 📦 NORMAL (50%)
      reward = Math.floor(Math.random() * 5000) + 500;
      narration = `🌙 Bajo la luna, tu ritual te concede *${reward.toLocaleString()} ${monedas}*`;
    } 
    else {
      // 💀 PÉRDIDA (25%)
      const loss = Math.floor(Math.random() * 2000) + 500;
      nuevosCoins = Math.max(0, coins - loss);
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      await db.updateChatUser(msg.chat, msg.sender, 'ritualCooldown', Date.now() + 15 * 60 * 1000);
      return msg.reply(`💀 El ritual salió mal... una maldición te arrebató *${loss.toLocaleString()} ${monedas}*`);
    }

    // 🔥 BONUS ALEATORIO (15%)
    if (Math.random() < 0.15) {
      const bonus = Math.floor(Math.random() * 4000) + 1000;
      reward += bonus;
      bonusMsg += `\n✨ ¡Energía extra! Ganaste *${bonus.toLocaleString()}* ${monedas} adicionales`;
    }

    // 🔥 SUMAR RECOMPENSA
    nuevosCoins = coins + reward;
    await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
    await db.updateChatUser(msg.chat, msg.sender, 'ritualCooldown', Date.now() + 15 * 60 * 1000);

    let mensaje = `${narration}\n💰 Ganaste *${reward.toLocaleString()} ${monedas}*`;
    if (bonusMsg) mensaje += `\n${bonusMsg}`;
    mensaje += `\n💳 Total: *${nuevosCoins.toLocaleString()}*`;

    return msg.reply(mensaje);
  }
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const min = minutes < 10 ? '0' + minutes : minutes;
  const sec = seconds < 10 ? '0' + seconds : seconds;
  return min === '00' 
    ? `${sec} segundo${sec > 1 ? 's' : ''}` 
    : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`;
}
