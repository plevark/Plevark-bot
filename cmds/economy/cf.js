import db from "#db";

export default {
  command: ['cf', 'flip', 'coinflip'],
  category: 'economy',
  run: async ({ msg, sock, args, usedPrefix: prefix }) => {
    const chat = await db.getChat(msg.chat);
    if (chat.adminonly || !chat.rpg) return msg.reply(mess.comandooff);

    let user = await db.getChatUser(msg.chat, msg.sender);
    
    // 🔥 CREAR USUARIO SI NO EXISTE
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;

    const cantidad = parseInt(args[0]);
    const eleccion = args[1]?.toLowerCase();

    if (!eleccion || isNaN(cantidad) || cantidad <= 0) {
      return msg.reply(
        `✎ Elige una opción (*Cara o Cruz*) y la cantidad a apostar.\n\n📌 *Ejemplo:* ${prefix}cf 2000 cara`
      );
    }

    if (!['cara', 'cruz'].includes(eleccion)) {
      return msg.reply(`❌ Elección no válida. Elige *cara* o *cruz*.`);
    }

    if (cantidad < 200) {
      return msg.reply(`⚠️ La apuesta mínima es de *200 ${monedas}*.`);
    }

    if (coins < cantidad) {
      return msg.reply(`❌ No tienes suficientes *${monedas}*. Tienes *${coins.toLocaleString()}*.`);
    }

    const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
    let nuevosCoins = coins;

    if (resultado === eleccion) {
      nuevosCoins = coins + cantidad;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      return msg.reply(`🪙 La moneda cayó en *${resultado}*.\n✅ ¡Ganaste *${cantidad.toLocaleString()} ${monedas}*!\n💰 Total: *${nuevosCoins.toLocaleString()}*`);
    } else {
      nuevosCoins = coins - cantidad;
      await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);
      return msg.reply(`🪙 La moneda cayó en *${resultado}*.\n❌ Perdiste *${cantidad.toLocaleString()} ${monedas}*.\n💰 Total: *${nuevosCoins.toLocaleString()}*`);
    }
  }
};
