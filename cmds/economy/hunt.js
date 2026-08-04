import db from "#db";

export default {
  command: ['cazar', 'hunt'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'lasthunt', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const currency = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const bank = typeof user.bank === 'number' && !isNaN(user.bank) ? user.bank : 0;
    const lasthunt = typeof user.lasthunt === 'number' && !isNaN(user.lasthunt) ? user.lasthunt : 0;

    // 🔥 VALIDAR COOLDOWN
    if (Date.now() < lasthunt) {
      const restante = lasthunt - Date.now();
      return msg.reply(`⏳ Debes esperar *${msToTime(restante)}* antes de volver a cazar.`);
    }

    const rand = Math.random();
    let cantidad = 0;
    let nuevosCoins = coins;
    let nuevoBank = bank;
    let message = '';

    // 🔥 CASO ÉXITO (40%)
    if (rand < 0.4) {
      cantidad = Math.floor(Math.random() * (13000 - 10000 + 1)) + 10000;
      nuevosCoins = coins + cantidad;

      const successMessages = [
        `¡Con gran valentía, lograste cazar un Oso con tu Arco! Ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Has cazado un Tigre feroz con tu Arco! Tras una persecución electrizante, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Lograste cazar un Elefante con astucia y persistencia usando tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Has cazado un Panda con tu Arco! La caza fue tranquila, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Cazaste un Jabalí tras un rastreo emocionante con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Con gran destreza, atrapaste un Cocodrilo con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Has cazado un Ciervo robusto con tu Arco! Ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Con paciencia lograste cazar un Zorro plateado con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Localizaste un grupo de peces en el río y atrapaste varios con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Te internaste en la niebla del bosque y cazaste un jabalí salvaje con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`
      ];
      message = pickRandom(successMessages);
    }
    // 🔥 CASO PÉRDIDA (30%)
    else if (rand < 0.7) {
      cantidad = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
      const total = coins + bank;

      if (total >= cantidad) {
        if (coins >= cantidad) {
          nuevosCoins = coins - cantidad;
        } else {
          const restante = cantidad - coins;
          nuevosCoins = 0;
          nuevoBank = bank - restante;
        }
      } else {
        cantidad = total;
        nuevosCoins = 0;
        nuevoBank = 0;
      }

      const failMessages = [
        `Tu presa se escapó y no lograste cazar nada con tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tropezaste mientras apuntabas con tu Arco y la presa huyó, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un rugido te distrajo y no lograste dar en el blanco con tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu Arco se rompió justo en el momento crucial, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un aguacero repentino arruinó tu ruta de caza con tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un jabalí te embistió y tuviste que huir perdiendo el control de tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un tigre te sorprendió y escapaste con pérdidas dañando tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
      ];
      message = pickRandom(failMessages);
    }
    // 🔥 CASO NEUTRO (30%)
    else {
      const neutralMessages = [
        `Pasaste la tarde cazando con tu Arco y observando cómo los animales se movían en silencio.`,
        `El bosque estuvo tranquilo y los animales se mostraron esquivos a tu Arco.`,
        `Tu jornada de caza fue serena con tu Arco, los animales se acercaban sin ser atrapados.`,
        `Los animales se mostraron cautelosos ante tu Arco, pero la experiencia de caza fue agradable.`,
        `Exploraste nuevas rutas de caza con tu Arco y descubriste huellas frescas.`
      ];
      message = pickRandom(neutralMessages);
    }

    // 🔥 ACTUALIZAR DATOS
    await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
    await db.updateChatUser(msg.chat, msg.sender, 'bank', nuevoBank);
    await db.updateChatUser(msg.chat, msg.sender, 'lasthunt', Date.now() + 15 * 60 * 1000);

    return msg.reply(`《✿》 ${message}`);
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
