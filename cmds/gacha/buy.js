import db from "#db";

export default {
  command: ['c', 'comprar'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat;
    const userId = msg.sender;
    const chat = await db.getChat(chatId);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await db.getSettings(botId);
    const currency = botSettings?.currency || 'Coins';

    if (chat.adminonly || !chat.gacha) {
      return msg.reply(mess.comandooff);
    }

    if (!args[0]) {
      return msg.reply(`✎ Debes escribir el *nombre del personaje* que quieres comprar.\n📌 *Ejemplo:* $buy Bakugo`);
    }

    const characterName = args.join(' ').toLowerCase().trim();

    // 🔥 OBTENER ARRAY DE PERSONAJES DESDE characters.json
    let characters = [];
    try {
      const fs = await import('fs');
      const contenido = fs.readFileSync('./lib/characters.json', 'utf-8');
      const data = JSON.parse(contenido);
      
      if (data.characters && Array.isArray(data.characters)) {
        characters = data.characters;
      } else if (Array.isArray(data)) {
        characters = data;
      } else {
        characters = Object.values(data);
      }
    } catch (e) {
      console.error('Error cargando characters.json:', e);
      return msg.reply(`❌ Error al cargar los personajes.`);
    }

    // 🔥 BUSCAR PERSONAJE
    const character = characters.find(c => 
      c.name?.toLowerCase() === characterName ||
      c.name?.toLowerCase().includes(characterName)
    );

    if (!character) {
      return msg.reply(`❌ No se encontró el personaje *${args.join(' ')}*.`);
    }

    // 🔥 OBTENER CHATUSER (CREAR SI NO EXISTE)
    let user = await db.getChatUser(chatId, userId);
    if (!user) {
      await db.updateChatUser(chatId, userId, 'coins', 0);
      await db.updateChatUser(chatId, userId, 'characters', []);
      user = await db.getChatUser(chatId, userId);
    }

    // 🔥 ASEGURAR VALORES NUMÉRICOS
    const coins = typeof user.coins === 'number' && !isNaN(user.coins) ? user.coins : 0;
    const userCharacters = Array.isArray(user.characters) ? user.characters : [];

    // 🔥 VERIFICAR SI YA TIENE EL PERSONAJE
    if (userCharacters.some(c => c.name?.toLowerCase() === character.name?.toLowerCase())) {
      return msg.reply(`❌ Ya tienes a *${character.name}* en tu colección.`);
    }

    // 🔥 OBTENER CHATUSERS PARA VER QUIÉN TIENE EL PERSONAJE
    const chatUsers = await db.getChatUser(chatId);
    const poseedor = Array.isArray(chatUsers) 
      ? chatUsers.find(u => 
          Array.isArray(u.characters) && u.characters.some(c => c.name?.toLowerCase() === character.name?.toLowerCase())
        )
      : null;

    if (poseedor) {
      const ownerData = await db.getUser(poseedor.user_id);
      const ownerName = ownerData?.name || poseedor.user_id.split('@')[0];
      return msg.reply(`❌ *${character.name}* ya pertenece a *${ownerName}*.`);
    }

    // 🔥 VERIFICAR SI TIENE SUFICIENTES MONEDAS
    const price = character.value || 0;
    if (coins < price) {
      return msg.reply(`❌ No tienes suficientes *${currency}*. Necesitas *${price.toLocaleString()}* y tienes *${coins.toLocaleString()}*.`);
    }

    // 🔥 COMPRAR PERSONAJE
    const newCoins = coins - price;
    const newCharacters = [...userCharacters, {
      name: character.name,
      value: character.value || 0,
      gender: character.gender,
      source: character.source,
      keyword: character.keyword,
      image: character.image || '',
      images: character.images || [],
      claimedAt: Date.now()
    }];

    await db.updateChatUser(chatId, userId, 'coins', newCoins);
    await db.updateChatUser(chatId, userId, 'characters', newCharacters);

    return msg.reply(`✅ Has comprado a *${character.name}* por *${price.toLocaleString()} ${currency}*.\n💰 Total: *${newCoins.toLocaleString()}*`);
  }
};
