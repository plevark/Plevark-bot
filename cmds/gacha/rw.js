import db from "#db";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const obtenerImagen = async (keyword) => {
  const endpoints = ["safebooru", "gelbooru", "danbooru"];

  for (const endpoint of endpoints) {
    try {
      const url = `${api.url}/nsfw/${endpoint}?keyword=${keyword}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}`);

      const buffer = await res.arrayBuffer();

      if (buffer.byteLength > 0) {
        return Buffer.from(buffer);
      }
    } catch (err) {
      console.error(`Error en ${endpoint}:`, err.message);
    }
  }

  return null;
};

// 🔥 FUNCIÓN CORREGIDA: devuelve un ARRAY de personajes
const obtenerPersonajes = () => {
  try {
    const contenido = fs.readFileSync('./lib/characters.json', 'utf-8')
    const data = JSON.parse(contenido)
    
    if (data.characters && Array.isArray(data.characters)) {
      return data.characters
    }
    if (Array.isArray(data)) {
      return data
    }
    return Object.values(data)
  } catch (error) {
    console.error('[Error] characters.json:', error)
    return []
  }
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const s = seconds.toString().padStart(2, '0')
  const msg = minutes.toString().padStart(2, '0')
  return msg === '00'
    ? `${s} segundo${s > 1 ? 's' : ''}`
    : `${msg} minuto${msg > 1 ? 's' : ''}, ${s} segundo${s > 1 ? 's' : ''}`
}

export default {
  command: ['rollwaifu', 'roll', 'rw', 'rf'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const userId = msg.sender
    const chat = await db.getChat(chatId)
    const user = await db.getUser(userId)
    const chatUser = await db.getChatUser(chatId, userId)
    const now = Date.now()

    if (chat.adminonly || !chat.gacha)
      return msg.reply(mess.comandooff)

    const cooldown = chatUser.rwCooldown || 0
    const restante = cooldown - now
    if (restante > 0) {
      return msg.reply(`✎ Espera *${msToTime(restante)}* para volver a usar este comando.`)
    }

    const loadingMsg = await msg.reply(`⏳ *Cargando personaje...*`);

    // 🔥 OBTENER ARRAY DE PERSONAJES
    const personajes = obtenerPersonajes()
    
    if (!Array.isArray(personajes) || personajes.length === 0) {
      await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `❌ No se encontró ningún personaje disponible.` });
      return;
    }

    // 🔥 ELEGIR PERSONAJE ALEATORIO
    const personaje = personajes[Math.floor(Math.random() * personajes.length)]
    if (!personaje) {
      await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `❌ No se encontró ningún personaje disponible.` });
      return;
    }

    const reservado = Array.isArray(chat.personajesReservados)
      ? chat.personajesReservados.find((p) => p.name === personaje.name)
      : null

    // 🔥 CORREGIDO: Obtener poseedor correctamente
    let poseedor = null;
    try {
      const chatUsers = await db.getChatUser(chatId);
      // Si chatUsers es un array, buscar el poseedor
      if (Array.isArray(chatUsers)) {
        poseedor = chatUsers.find(user =>
          Array.isArray(user.characters) && user.characters.some((c) => c.name === personaje.name)
        );
      }
    } catch (e) {
      console.log('Error al obtener poseedor:', e);
    }

    try {
      let estado = 'Libre'
      if (poseedor) {
        const userData = await db.getUser(poseedor.user_id)
        estado = `Reclamado por ${userData.name || 'Alguien'}`
      } else if (reservado) {
        const userData = await db.getUser(reservado.userId)
        estado = `Reservado por ${userData.name || 'Alguien'}`
      }

      await db.updateChatUser(chatId, userId, 'rwCooldown', now + 8 * 60000)

      // 🔥 VALOR ALEATORIO
      const rand = Math.random() * 100;
      let valorAleatorio;
      if (rand < 80) {
        valorAleatorio = Math.floor(Math.random() * (7000 - 50 + 1)) + 50;
      } else if (rand < 95) {
        valorAleatorio = Math.floor(Math.random() * (10000 - 8000 + 1)) + 8000;
      } else {
        valorAleatorio = Math.floor(Math.random() * (19000 - 11000 + 1)) + 11000;
      }
      const valorPersonaje = valorAleatorio.toLocaleString();

      const mensaje = `➩ Nombre › *${personaje.name || 'Desconocido'}*

ੈ⚥‧₊˚ Género › *${personaje.gender || 'Desconocido'}*
ੈ⛁‧₊˚ Valor › *${valorPersonaje}*
ੈ❖‧₊˚ Estado › *${estado}*
ੈ❀︎‧₊˚ Fuente › *${personaje.source || 'Desconocido'}*

${dev}`

      // ========== 🔥 OBTENER IMAGEN ==========
      let imagen = null;

      // 1️⃣ Si tiene múltiples imágenes, elegir UNA ALEATORIA
      if (personaje.images && Array.isArray(personaje.images) && personaje.images.length > 0) {
        try {
          const randomIndex = Math.floor(Math.random() * personaje.images.length);
          const imageUrl = personaje.images[randomIndex];
          console.log(`📸 Imagen ${randomIndex + 1}/${personaje.images.length} para: ${personaje.name}`);
          
          const response = await fetch(imageUrl);
          const arrayBuffer = await response.arrayBuffer();
          imagen = Buffer.from(arrayBuffer);
        } catch (e) {
          console.log(`❌ Error cargando imagen aleatoria: ${e.message}`);
        }
      }
      // 2️⃣ Si tiene una sola imagen fija
      else if (personaje.image) {
        try {
          const response = await fetch(personaje.image);
          const arrayBuffer = await response.arrayBuffer();
          imagen = Buffer.from(arrayBuffer);
          console.log(`📸 Imagen fija para: ${personaje.name}`);
        } catch (e) {
          console.log(`❌ Error cargando imagen fija: ${e.message}`);
        }
      }
      // 3️⃣ Si no tiene imagen, buscar por keyword
      if (!imagen) {
        imagen = await obtenerImagen(personaje.keyword, personaje.name);
      }

      if (!imagen) {
        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `✎ No se pudo obtener una imagen para *${personaje.name}*.` });
        return;
      }

      const payload = {
        image: imagen,
        caption: mensaje,
        mimetype: 'image/jpeg'
      };

      const sent = await sock.sendMessage(chatId, payload, { quoted: msg });

      await sock.sendMessage(chatId, { 
        edit: loadingMsg.key, 
        text: `✅ *${personaje.name}* cargado correctamente (Valor: ${valorPersonaje})` 
      });

      if (!poseedor) {
        const idUnico = uuidv4().slice(0, 8)
        const nuevoReservado = {
          id: idUnico,
          name: personaje.name,
          value: valorAleatorio,
          gender: personaje.gender,
          source: personaje.source,
          keyword: personaje.keyword,
          image: personaje.image || '',
          images: personaje.images || [],
          userId: userId,
          reservedUntil: now + 20000,
          expiresAt: now + 60000,
          messageId: sent.key.id
        }
        
        let personajesReservados = chat.personajesReservados || []
        const indexExistente = personajesReservados.findIndex(
          p => p.name === personaje.name
        )
        
        if (indexExistente !== -1) {
          personajesReservados[indexExistente] = nuevoReservado
        } else {
          personajesReservados.push(nuevoReservado)
        }
        
        await db.updateChat(chatId, 'personajesReservados', personajesReservados)
      }
    } catch (e) {
      await db.updateChatUser(chatId, userId, 'rwCooldown', 0)
      await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `❌ Ocurrió un error: ${e.message}` });
      return msg.reply(msgglobal)
    }
  },
};
