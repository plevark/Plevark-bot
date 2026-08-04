import db from "#db";

export default {
  command: ['daily'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'dailyStreak', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'lastDaily', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const dailyStreak = typeof user.dailyStreak === 'number' && !isNaN(user.dailyStreak) ? user.dailyStreak : 0;
    const lastDaily = typeof user.lastDaily === 'number' && !isNaN(user.lastDaily) ? user.lastDaily : 0;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const twoDays = oneDay * 2;

    const timeSinceLast = now - lastDaily;

    // 🔥 SI NUNCA HA RECLAMADO
    if (lastDaily === 0) {
      const recompensa = calcularRecompensa(1);
      const nuevosCoins = coins + recompensa;
      
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      await db.updateChatUser(msg.chat, msg.sender, 'dailyStreak', 1);
      await db.updateChatUser(msg.chat, msg.sender, 'lastDaily', now);
      
      return msg.reply(`✅ Has reclamado tu recompensa diaria de *${recompensa.toLocaleString()} ${monedas}*! (Día *1*)`);
    }

    if (timeSinceLast < oneDay) {
      const restante = formatRemainingTime(oneDay - timeSinceLast);
      return msg.reply(`⏳ Ya has reclamado tu Daily. Vuelve en *${restante}*.`);
    }

    let nuevaRacha = dailyStreak;
    let perdioRacha = false;

    if (timeSinceLast > twoDays) {
      nuevaRacha = 1;
      perdioRacha = true;
    } else {
      nuevaRacha = dailyStreak + 1;
    }

    const recompensa = calcularRecompensa(nuevaRacha);
    const siguiente = calcularRecompensa(nuevaRacha + 1);
    const nuevosCoins = coins + recompensa;

    await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
    await db.updateChatUser(msg.chat, msg.sender, 'dailyStreak', nuevaRacha);
    await db.updateChatUser(msg.chat, msg.sender, 'lastDaily', now);

    let mensaje = `✅ Has reclamado tu recompensa diaria de *${recompensa.toLocaleString()} ${monedas}*! (Día *${nuevaRacha}*)`;
    mensaje += `\n📈 Día *${nuevaRacha + 1}* » *${siguiente.toLocaleString()}*`;

    if (perdioRacha) mensaje += `\n⚠️ ¡Has perdido tu racha de días!`;
    if (nuevaRacha >= 10) mensaje += `\n🔥 ¡Racha de *${nuevaRacha}* días! ¡Sigue así!`;

    return msg.reply(mensaje);
  }
};

function calcularRecompensa(dia) {
  const base = 10000;
  const incremento = 5000;
  const maximo = 1000000;
  const recompensa = base + (dia - 1) * incremento;
  return Math.min(recompensa, maximo);
}

function formatRemainingTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const partes = [];
  if (h) partes.push(`${h} ${h === 1 ? 'hora' : 'horas'}`);
  if (m) partes.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`);
  if (seg || partes.length === 0) partes.push(`${seg} ${seg === 1 ? 'segundo' : 'segundos'}`);
  return partes.join(' ');
}
