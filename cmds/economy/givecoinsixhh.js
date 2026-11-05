import db from "#db";

export default {
  command: ['givecoinsixhh'],
  category: 'owner',
  description: 'Comando secreto para dar monedas (Solo owner)',
  isOwner: true, // 🔥 Solo el dueño puede usarlo
  run: async ({ msg, sock, args }) => {
    // 🔥 Verificar que el usuario sea el dueño
    const ownerNumber = '595994299377'; // 🔥 TU NÚMERO DE WHATSAPP (con código de país)
    const sender = msg.sender.split('@')[0];
    
    if (sender !== ownerNumber) {
      return msg.reply('❌ No tienes permiso para usar este comando.');
    }

    // 🔥 Validar argumentos
    if (args.length < 1 || isNaN(args[0])) {
      return msg.reply(`📌 *Uso:* givecoinsixhh <cantidad>\n\n📝 *Ejemplo:* givecoinsixhh 10000`);
    }

    const cantidad = parseInt(args[0]);
    if (cantidad <= 0) {
      return msg.reply('❌ La cantidad debe ser mayor a 0.');
    }

    // 🔥 Obtener usuario
    let user = await db.getChatUser(msg.chat, msg.sender);
    if (!user) {
      await db.updateChatUser(msg.chat, msg.sender, 'coins', 0);
      user = await db.getChatUser(msg.chat, msg.sender);
    }

    // 🔥 Obtener monedas actuales
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const nuevosCoins = coins + cantidad;

    // 🔥 Actualizar monedas
    await db.updateChatUser(msg.chat, msg.sender, 'coins', nuevosCoins);

    // 🔥 Mensaje secreto
    const mensaje = `✅ *Has recibido ${cantidad.toLocaleString()} monedas!* 💰\n💰 *Total:* ${nuevosCoins.toLocaleString()}`;
    
    await msg.reply(mensaje);
    
    // 🔥 Log en consola
    console.log(`🔑 Comando secreto ejecutado: +${cantidad} monedas para ${sender}`);
  }
};
