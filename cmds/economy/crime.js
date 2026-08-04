import db from "#db";

export default {
  command: ['crime'],
  category: 'rpg',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    const chat = await db.getChat(msg.chat);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';

    if (chat.adminonly || !chat.rpg)
      return msg.reply(mess.comandooff);

    // 🔥 Obtener usuario y asegurar que existe
    let user = await db.getChatUser(msg.chat, msg.sender);
    if (!user) {
      await db.createChatUser(msg.chat, msg.sender, { coins: 0, bank: 0, crimeCooldown: 0 });
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    // 🔥 VALIDACIÓN: Asegurar que coins, bank y crimeCooldown sean números
    const coins = typeof user?.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const bank = typeof user?.bank === 'number' && !isNaN(user.bank) ? user.bank : 0;
    const crimeCooldown = typeof user?.crimeCooldown === 'number' && !isNaN(user.crimeCooldown) ? user.crimeCooldown : 0;

    // 🔥 Validar cooldown
    const remainingTime = crimeCooldown - Date.now();
    if (remainingTime > 0) {
      return msg.reply(`《✿》 Debes esperar *${msToTime(remainingTime)}* antes de intentar nuevamente.`);
    }

    const éxito = Math.random() < 0.5;

    // 🎯 GANANCIA: entre 5000 y 9000
    const ganancia = Math.floor(Math.random() * (9778 - 5000 + 1)) + 5000;

    // 💸 PÉRDIDA: entre 5000 y 7000
    const perdida = Math.floor(Math.random() * (7000 - 5000 + 1)) + 5000;

    // 🔥 Actualizar cooldown
    const newCrimeCooldown = Date.now() + 10 * 60 * 1000;
    await db.updateChatUser(msg.chat, msg.sender, 'crimeCooldown', newCrimeCooldown);

    const successMessages = [
      `Realizaste un espectacular atraco a un banco y ganaste *¥${ganancia.toLocaleString()} ${monedas}*!`,
      `Hackeaste un sistema de seguridad y accediste a *¥${ganancia.toLocaleString()} ${monedas}*!`,
      `Robaste joyas de una exhibición y obtuviste *¥${ganancia.toLocaleString()} ${monedas}*!`,
      `Vendiste información confidencial y ganaste *¥${ganancia.toLocaleString()} ${monedas}*!`,
      `Implementaste un plan maestro y ganaste *¥${ganancia.toLocaleString()} ${monedas}*!`,
      `Te convertiste en el rey del contrabando y ganaste *¥${ganancia.toLocaleString()} ${monedas}*!`,
    ];

    const failMessages = [
      `Intentaste escapar tras un robo, pero te atraparon y perdiste *¥${perdida.toLocaleString()} ${monedas}*.`,
      `Hackeaste un sistema y fallaste, perdiendo *¥${perdida.toLocaleString()} ${monedas}*.`,
      `Cometiste un error al disfrazarte y te reconocieron, perdiendo *¥${perdida.toLocaleString()} ${monedas}*.`,
      `Intentaste extorsionar a un cliente, pero te denunciaron y perdiste *¥${perdida.toLocaleString()} ${monedas}*.`,
      `Tu plan fue delatado y la policía te atrapó, perdiendo *¥${perdida.toLocaleString()} ${monedas}*.`,
    ];

    const message = éxito ? pickRandom(successMessages) : pickRandom(failMessages);

    let newCoins = coins;
    let newBank = bank;

    if (éxito) {
      newCoins = coins + ganancia;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', newCoins);
    } else {
      const total = coins + bank;
      if (total >= perdida) {
        if (coins >= perdida) {
          newCoins = coins - perdida;
          await db.updateChatUser(msg.chat, msg.sender, 'coins', newCoins);
        } else {
          const restante = perdida - coins;
          newCoins = 0;
          newBank = bank - restante;
          await db.updateChatUser(msg.chat, msg.sender, 'coins', newCoins);
          await db.updateChatUser(msg.chat, msg.sender, 'bank', newBank);
        }
      } else {
        newCoins = 0;
        newBank = 0;
        await db.updateChatUser(msg.chat, msg.sender, 'coins', newCoins);
        await db.updateChatUser(msg.chat, msg.sender, 'bank', newBank);
      }
    }

    await sock.reply(msg.chat, `《✿》 ${message}`, msg);
  },
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