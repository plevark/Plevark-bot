import db from "#db";

export default {
  command: ['mine'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'mineCooldown', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const mineCooldown = typeof user.mineCooldown === 'number' && !isNaN(user.mineCooldown) ? user.mineCooldown : 0;

    const now = Date.now();

    // 🔥 VALIDAR COOLDOWN
    if (mineCooldown > now) {
      const remaining = mineCooldown - now;
      return msg.reply(`⏳ Debes esperar *${msToTime(remaining)}* para minar de nuevo.`);
    }

    // 🔥 GENERAR RECOMPENSA
    const isLegendary = Math.random() < 0.02;
    let reward = 0;
    let narration = '';
    let bonusMsg = '';

    if (isLegendary) {
      reward = Math.floor(Math.random() * 50000) + 50000;
      narration = '¡DESCUBRISTE UN TESORO LEGENDARIO!\n\n';
      bonusMsg = '\n🌟 Recompensa ÉPICA obtenida!';
    } else {
      reward = Math.floor(Math.random() * 5000) + 500;
      const scenario = pickRandom(escenarios);
      narration = `En ${scenario}, ${pickRandom(mineria)}`;
      
      if (Math.random() < 0.1) {
        const bonus = Math.floor(Math.random() * 3000) + 500;
        reward += bonus;
        bonusMsg = `\n✨ ¡Bonus de aventura! Ganaste *${bonus.toLocaleString()}* ${monedas} extra`;
      }
    }

    // 🔥 SUMAR RECOMPENSA
    const nuevosCoins = coins + reward;
    await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
    await db.updateChatUser(msg.chat, msg.sender, 'mineCooldown', now + 10 * 60 * 1000);

    let mensaje = `⛏️ ${narration} *${reward.toLocaleString()} ${monedas}*`;
    if (bonusMsg) mensaje += `\n${bonusMsg}`;
    mensaje += `\n💰 Total: *${nuevosCoins.toLocaleString()}*`;

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

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const escenarios = [
  'una cueva oscura y húmeda',
  'la cima de una montaña nevada',
  'un bosque misterioso lleno de raíces',
  'un río cristalino y caudaloso',
  'una mina abandonada de carbón',
  'las ruinas de un antiguo castillo',
  'una playa desierta con arena dorada',
  'un valle escondido entre colinas',
  'un arbusto espinoso al borde del camino',
  'un tronco hueco en medio del bosque',
];

const mineria = [
  'encontraste un antiguo cofre con',
  'hallaste una bolsa llena de',
  'descubriste un saco de',
  'desenterraste monedas antiguas que contienen',
  'rompiste una roca y adentro estaba',
  'cavando profundo, hallaste',
  'entre las raíces, encontraste',
  'dentro de una caja olvidada, hallaste',
  'bajo unas piedras, descubriste',
  'entre los escombros de un lugar viejo, encontraste',
];
