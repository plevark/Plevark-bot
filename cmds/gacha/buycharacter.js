import db from "#db";

export default {
  command: ['buycharacter', 'buychar', 'buyc'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    try {
      const chatId = msg.chat;
      const userId = msg.sender;
      
      const chatConfig = await db.getChat(chatId);
      
      if (chatConfig.adminonly || !chatConfig.gacha) {
        return msg.reply(mess.comandooff);
      }

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = await db.getSettings(botId);
      const monedas = botSettings?.currency || 'monedas';

      const personajeNombre = args.join(' ')?.trim()?.toLowerCase();
      if (!personajeNombre) {
        return msg.reply(`《✤》 Especifica el nombre del personaje que deseas comprar.`);
      }

      // 🔥 CORREGIDO: Obtener chatUsers y verificar que sea un array
      let chatUsers = [];
      try {
        const result = await db.getChatUser(chatId);
        if (Array.isArray(result)) {
          chatUsers = result;
        }
      } catch (e) {
        console.log('Error al obtener chatUsers:', e);
      }

      // 🔥 RECOLECTAR PERSONAJES EN VENTA
      const personajesEnVenta = [];
      for (const user of chatUsers) {
        if (user.personajesEnVenta && Array.isArray(user.personajesEnVenta) && user.personajesEnVenta.length > 0) {
          user.personajesEnVenta.forEach(p => {
            personajesEnVenta.push({
              ...p,
              vendedor: user.user_id
            });
          });
        }
      }

      if (personajesEnVenta.length === 0) {
        return msg.reply(`✐ No hay personajes disponibles para comprar en este chat.`);
      }

      // 🔥 BUSCAR PERSONAJE
      const personaje = personajesEnVenta.find((p) => p.name?.toLowerCase() === personajeNombre);
      if (!personaje) {
        return msg.reply(`✎ No se encontró el personaje *${args.join(' ')}* en la lista de ventas.`);
      }

      if (personaje.vendedor === userId) {
        return msg.reply(`✎ No puedes comprar tu propio personaje *${personaje.name}*.`);
      }

      // 🔥 OBTENER COMPRADOR
      let comprador = await db.getChatUser(chatId, userId);
      if (!comprador) {
        await db.updateChatUser(chatId, userId, 'coins', 0);
        await db.updateChatUser(chatId, userId, 'characters', []);
        comprador = await db.getChatUser(chatId, userId);
      }

      const coins = typeof comprador.coins === 'number' && !isNaN(comprador.coins) ? comprador.coins : 0;

      if (coins < personaje.precio) {
        return msg.reply(
          `✎ No tienes suficientes *${monedas}* para comprar *${personaje.name}*. Necesitas *${personaje.precio.toLocaleString()} ${monedas}*.`,
        );
      }

      // 🔥 REALIZAR COMPRA
      const nuevosCoinsComprador = coins - personaje.precio;
      await db.updateChatUser(chatId, userId, 'coins', nuevosCoinsComprador);

      const vendedorId = personaje.vendedor;
      let vendedor = await db.getChatUser(chatId, vendedorId);
      if (!vendedor) {
        await db.updateChatUser(chatId, vendedorId, 'coins', 0);
        vendedor = await db.getChatUser(chatId, vendedorId);
      }

      const vendedorCoins = typeof vendedor.coins === 'number' && !isNaN(vendedor.coins) ? vendedor.coins : 0;
      await db.updateChatUser(chatId, vendedorId, 'coins', vendedorCoins + personaje.precio);

      // 🔥 AGREGAR PERSONAJE AL COMPRADOR
      let characters = Array.isArray(comprador.characters) ? comprador.characters : [];
      characters.push({ 
        name: personaje.name,
        value: personaje.value || 0,
        gender: personaje.gender || 'Desconocido',
        source: personaje.source || 'Desconocido',
        keyword: personaje.keyword || '',
        compradoA: vendedorId,
        compradoEn: Date.now()
      });
      await db.updateChatUser(chatId, userId, 'characters', characters);

      // 🔥 ELIMINAR PERSONAJE DE LA LISTA DE VENTA DEL VENDEDOR
      if (vendedor.personajesEnVenta && Array.isArray(vendedor.personajesEnVenta)) {
        const nuevasVentas = vendedor.personajesEnVenta.filter(
          (p) => p.name?.toLowerCase() !== personajeNombre
        );
        await db.updateChatUser(chatId, vendedorId, 'personajesEnVenta', nuevasVentas);
      }

      const userComprador = await db.getUser(userId);
      const userVendedor = await db.getUser(vendedorId);
      
      const nombreComprador = userComprador?.name || userId.split('@')[0];
      const nombreVendedor = userVendedor?.name || vendedorId.split('@')[0];

      const mensaje = `✐ *${personaje.name}* ha sido comprado por *${nombreComprador}*.\n\n> Se han transferido *${personaje.precio.toLocaleString()} ${monedas}* a *${nombreVendedor}*.`;

      await msg.reply(mensaje);
    } catch (e) {
      console.error('Error en buycharacter:', e);
      msg.reply(msgglobal + e.message);
    }
  },
};
