import db from "#db";

export default {
  command: ['pescar', 'fish'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'lastfish', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const currency = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const bank = typeof user.bank === 'number' && !isNaN(user.bank) ? user.bank : 0;
    const lastfish = typeof user.lastfish === 'number' && !isNaN(user.lastfish) ? user.lastfish : 0;

    // 🔥 VALIDAR COOLDOWN
    if (Date.now() < lastfish) {
      const restante = lastfish - Date.now();
      return msg.reply(`⏳ Debes esperar *${msToTime(restante)}* antes de volver a pescar.`);
    }

    const rand = Math.random();
    let cantidad = 0;
    let nuevosCoins = coins;
    let nuevoBank = bank;
    let message = '';

    // 🔥 CASO ÉXITO (40%)
    if (rand < 0.4) {
      cantidad = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
      nuevosCoins = coins + cantidad;

      const successMessages = [
        `¡Has pescado un Salmón! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado una Trucha! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Tiburón! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado una Ballena! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Pez Payaso! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has atrapado una Anguila Dorada! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado un Mero Gigante! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Pulpo azul! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Sacaste una Carpa Real! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has conseguido un Pez Dragón! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`
      ];
      message = pickRandom(successMessages);
    }
    // 🔥 CASO PÉRDIDA (30%)
    else if (rand < 0.7) {
      cantidad = Math.floor(Math.random() * (6500 - 5000 + 1)) + 5000;
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
        `El anzuelo se enredó y perdiste parte de tu equipo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Una corriente fuerte arrastró tu caña, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un pez grande rompió tu línea y dañó tu aparejo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu bote se golpeó contra las rocas y tuviste que reparar, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El pez escapó y arruinó tu red, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El pez mordió el anzuelo pero se soltó y dañó tu carrete, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu cubeta se volcó y los peces atrapados se perdieron, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
      ];
      message = pickRandom(failMessages);
    }
    // 🔥 CASO NEUTRO (30%)
    else {
      const neutralMessages = [
        `Pasaste la tarde pescando y observando cómo los peces nadaban cerca.`,
        `El agua estuvo tranquila y los peces se acercaban sin morder el anzuelo.`,
        `Tu jornada de pesca fue serena, los peces nadaban alrededor sin ser atrapados.`,
        `Los peces se mostraron esquivos, pero la experiencia de pesca fue agradable.`,
        `El río estuvo lleno de peces curiosos que se acercaban sin ser capturados.`
      ];
      message = pickRandom(neutralMessages);
    }

    // 🔥 ACTUALIZAR DATOS
    await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
    await db.updateChatUser(msg.chat, msg.sender, 'bank', nuevoBank);
    await db.updateChatUser(msg.chat, msg.sender, 'lastfish', Date.now() + 8 * 60 * 1000);

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
