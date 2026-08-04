import db from "#db";

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const pad = (n) => n.toString().padStart(2, '0');
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
};

export default {
  command: ['slut'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'slutCooldown', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const currency = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const bank = typeof user.bank === 'number' && !isNaN(user.bank) ? user.bank : 0;
    const slutCooldown = typeof user.slutCooldown === 'number' && !isNaN(user.slutCooldown) ? user.slutCooldown : 0;

    // 🔥 VALIDAR COOLDOWN
    const remaining = slutCooldown - Date.now();
    if (remaining > 0) {
      return msg.reply(`⏳ Debes esperar *${msToTime(remaining)}* antes de intentar nuevamente.`);
    }

    // 🔥 GENERAR RESULTADO
    const success = Math.random() < 0.5;
    const amount = Math.floor(Math.random() * 5000) + 100; // Entre 100 y 5000
    let nuevosCoins = coins;
    let nuevoBank = bank;
    let message = '';

    // 🔥 ACTUALIZAR COOLDOWN
    await db.updateChatUser(msg.chat, msg.sender, 'slutCooldown', Date.now() + 10 * 60 * 1000);

    const winMessages = [
      `Organizaron una fiesta temática y ganaste *${amount.toLocaleString()} ${currency}*!`,
      `Diste una increíble presentación en el club y te llevaste *${amount.toLocaleString()} ${currency}*!`,
      `Tu baile deslumbró a todos y ganaste *${amount.toLocaleString()} ${currency}*!`,
      `Fuiste el centro de atención y ganaste *${amount.toLocaleString()} ${currency}*!`,
      `Tu carisma y encanto deslumbraron y ganaste *${amount.toLocaleString()} ${currency}*!`,
      `Lograste un trato increíble con productores y ganaste *${amount.toLocaleString()} ${currency}*!`,
    ];

    const loseMessages = [
      `Tu energía se fue y no brillaste, perdiendo *${amount.toLocaleString()} ${currency}*.`,
      `Cometiste un error en tu actuación y perdiste *${amount.toLocaleString()} ${currency}*.`,
      `Un cliente malhumorado te causó problemas y perdiste *${amount.toLocaleString()} ${currency}*.`,
      `Tu atuendo no fue bien recibido y perdiste *${amount.toLocaleString()} ${currency}*.`,
      `El sonido falló en medio de tu actuación y perdiste *${amount.toLocaleString()} ${currency}*.`,
      `Un mal día en el club resultó en una pérdida de *${amount.toLocaleString()} ${currency}*.`,
    ];

    if (success) {
      nuevosCoins = coins + amount;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      message = winMessages[Math.floor(Math.random() * winMessages.length)];
    } else {
      const total = coins + bank;
      if (total >= amount) {
        if (coins >= amount) {
          nuevosCoins = coins - amount;
          await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
        } else {
          const restante = amount - coins;
          nuevosCoins = 0;
          nuevoBank = bank - restante;
          await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
          await db.updateChatUser(msg.chat, msg.sender, 'bank', nuevoBank);
        }
      } else {
        nuevosCoins = 0;
        nuevoBank = 0;
        await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
        await db.updateChatUser(msg.chat, msg.sender, 'bank', nuevoBank);
      }
      message = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    }

    return msg.reply(`《✿》 ${message}`);
  }
};
