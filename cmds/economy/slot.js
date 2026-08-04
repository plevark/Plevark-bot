import db from "#db";
import { delay } from "baileys";

export default {
  command: ['slot'],
  category: 'economy',
  run: async ({ msg, sock, args }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'bank', 0);
      await db.updateChatUser(msg.chat, msg.sender, 'lastslot', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const currency = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const bank = typeof user.bank === 'number' && !isNaN(user.bank) ? user.bank : 0;
    const lastslot = typeof user.lastslot === 'number' && !isNaN(user.lastslot) ? user.lastslot : 0;

    // 🔥 VALIDAR COOLDOWN
    const remainingTime = lastslot - Date.now();
    if (remainingTime > 0) {
      return msg.reply(`⏳ Debes esperar *${formatTime(remainingTime)}* antes de volver a jugar.`);
    }

    // 🔥 VALIDAR APUESTA
    if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
      return msg.reply(`✎ Ingresa la cantidad que deseas apostar.\n📌 *Ejemplo:* !slot 1000`);
    }

    const apuesta = parseInt(args[0]);
    if (apuesta < 500) {
      return msg.reply(`⚠️ El mínimo para apostar es de *500 ${currency}*.`);
    }

    if (coins < apuesta) {
      if (bank >= apuesta) {
        // 🔥 RETIRAR DEL BANCO
        await db.updateChatUser(msg.chat, msg.sender, 'bank', bank - apuesta);
        await db.updateChatUser(msg.chat, msg.sender, 'coins', coins + apuesta);
        // 🔥 ACTUALIZAR VARIABLES
        user.coins = coins + apuesta;
        user.bank = bank - apuesta;
      } else {
        return msg.reply(`❌ No tienes suficientes *${currency}* ni en tu banco.`);
      }
    }

    // 🔥 OBTENER VALORES ACTUALIZADOS
    const currentCoins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const currentBank = typeof user.bank === 'number' && !isNaN(user.bank) ? user.bank : 0;

    const emojis = ['🍒', '🦕', '🍉'];
    const getRandomEmojis = () => {
      return {
        x: Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]),
        y: Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]),
        z: Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      };
    };

    // 🔥 ANIMACIÓN
    const initialText = '🎰 *SLOTS*\n────────';
    let { key } = await sock.sendMessage(msg.chat, { text: initialText }, { quoted: msg });

    const animateSlots = async () => {
      for (let i = 0; i < 5; i++) {
        const { x, y, z } = getRandomEmojis();
        const animationText = `🎰 *SLOTS*\n────────\n${x[0]} : ${y[0]} : ${z[0]}\n${x[1]} : ${y[1]} : ${z[1]}\n${x[2]} : ${y[2]} : ${z[2]}\n────────`;
        await sock.sendMessage(msg.chat, { text: animationText, edit: key }, { quoted: msg });
        await delay(300);
      }
    };
    await animateSlots();

    // 🔥 RESULTADO
    const { x, y, z } = getRandomEmojis();
    let resultado = '';
    let nuevosCoins = currentCoins;
    let nuevoBank = currentBank;

    // 🔥 VERIFICAR SI GANÓ (todas iguales)
    if (x[0] === y[0] && y[0] === z[0]) {
      const ganancia = apuesta * 3;
      nuevosCoins = currentCoins + ganancia;
      resultado = `🎉 ¡GANASTE! *${ganancia.toLocaleString()} ${currency}*`;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
    } 
    // 🔥 VERIFICAR SI CASI GANA (dos iguales)
    else if (x[0] === y[0] || x[0] === z[0] || y[0] === z[0]) {
      nuevosCoins = currentCoins + 50;
      resultado = `😅 Casi lo logras. *Toma 50 ${currency}* por intentarlo.`;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
    } 
    // 🔥 PERDIÓ
    else {
      if (currentCoins >= apuesta) {
        nuevosCoins = currentCoins - apuesta;
        await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      } else {
        nuevoBank = currentBank - apuesta;
        await db.updateChatUser(msg.chat, msg.sender, 'bank', nuevoBank);
      }
      resultado = `❌ Perdiste *${apuesta.toLocaleString()} ${currency}*.`;
    }

    // 🔥 ACTUALIZAR COOLDOWN
    await db.updateChatUser(msg.chat, msg.sender, 'lastslot', Date.now() + 10 * 60 * 1000);

    // 🔥 MOSTRAR RESULTADO FINAL
    const finalText = `🎰 *SLOTS*\n────────\n${x[0]} : ${y[0]} : ${z[0]}\n${x[1]} : ${y[1]} : ${z[1]}\n${x[2]} : ${y[2]} : ${z[2]}\n────────\n${resultado}`;
    await sock.sendMessage(msg.chat, { text: finalText, edit: key }, { quoted: msg });
  }
};

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts = [];
  if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
  parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`);
  return parts.join(' ');
}
