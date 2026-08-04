import db from "#db";

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const pad = (n) => n.toString().padStart(2, '0');
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
};

const weightedRandom = (colors, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < colors.length; i++) {
    sum += weights[i];
    if (rand <= sum) return colors[i];
  }
};

export default {
  command: ['rt', 'roulette', 'ruleta'],
  category: 'economy',
  run: async ({ msg, sock, args }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'rtCooldown', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const currency = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const rtCooldown = typeof user.rtCooldown === 'number' && !isNaN(user.rtCooldown) ? user.rtCooldown : 0;

    // 🔥 VALIDAR COOLDOWN
    const remaining = rtCooldown - Date.now();
    if (remaining > 0) {
      return msg.reply(`⏳ Debes esperar *${msToTime(remaining)}* antes de apostar nuevamente.`);
    }

    // 🔥 VALIDAR ARGUMENTOS
    if (args.length !== 2) {
      return msg.reply(`✎ Debes ingresar una cantidad de ${currency} y apostar a un color.\n📌 *Ejemplo:* !rt 1000 red`);
    }

    const amount = parseInt(args[0]);
    const color = args[1].toLowerCase();
    const validColors = ['red', 'black', 'green'];

    if (isNaN(amount) || amount < 200) {
      return msg.reply(`⚠️ La cantidad mínima de ${currency} a apostar es *200*.`);
    }

    if (!validColors.includes(color)) {
      return msg.reply(`✎ Por favor, elige un color válido: ${validColors.join(', ')}.`);
    }

    if (coins < amount) {
      return msg.reply(`❌ No tienes suficientes *${currency}*. Tienes *${coins.toLocaleString()}*.`);
    }

    // 🔥 ACTUALIZAR COOLDOWN
    await db.updateChatUser(msg.chat, msg.sender, 'rtCooldown', Date.now() + 5 * 60 * 1000);

    // 🔥 GENERAR RESULTADO
    const colorSettings = {
      red: { weight: 45 },
      black: { weight: 40 },
      green: { weight: 38 }
    };

    const weights = validColors.map(c => colorSettings[c].weight);
    const resultColor = weightedRandom(validColors, weights);
    let nuevosCoins = coins;

    if (resultColor === color) {
      const multiplier = Math.floor(Math.random() * 2) + 2;
      const reward = amount * multiplier;
      nuevosCoins = coins + reward;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      
      return msg.reply(`🔄 La ruleta salió en *${resultColor}* y has ganado *${reward.toLocaleString()} ${currency}*!\n💰 Total: *${nuevosCoins.toLocaleString()}*`);
    } else {
      nuevosCoins = coins - amount;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      
      return msg.reply(`🔄 La ruleta salió en *${resultColor}* y has perdido *${amount.toLocaleString()} ${currency}*.\n💰 Total: *${nuevosCoins.toLocaleString()}*`);
    }
  }
};
