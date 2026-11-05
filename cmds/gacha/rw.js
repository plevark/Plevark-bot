import db from "#db";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

let lastCall = 0
let cachePinterest = new Map()

const obtenerImagenPinterest = async (nombre, anime = '') => {
  try {
    const cacheKey = `${anime}_${nombre}`.toLowerCase()
    if (cachePinterest.has(cacheKey)) return cachePinterest.get(cacheKey)
    const diff = Date.now() - lastCall
    if (diff < 1200) await new Promise(r => setTimeout(r, 1200 - diff))
    lastCall = Date.now()
    const queries = []
    if (anime) {
      queries.push(`${anime} ${nombre} anime character`)
      queries.push(`${nombre} from ${anime} anime`)
      queries.push(`${anime} ${nombre}`)
    }
    queries.push(`${nombre} ${anime} anime character`)
    queries.push(`${nombre} character`)
    for (const query of queries) {
      try {
        const url = `https://www.pinterest.com/resource/BaseSearchResource/get/`
        const params = { source_url: `/search/pins/?q=${encodeURIComponent(query)}`, data: JSON.stringify({ options: { query, scope: "pins" } }) }
        const res = await axios.get(url, { params, headers: { "User-Agent": "Mozilla/5.0", "X-Pinterest-PWS-Handler": "www/search/[scope].js" }, timeout: 15000 })
        const pins = res.data?.resource_response?.data?.results || []
        const validPins = pins.filter(p => p.images?.orig?.url)
        if (validPins.length) {
          const pool = validPins.slice(0, 20)
          const random = pool[Math.floor(Math.random() * pool.length)]
          const imgUrl = random.images.orig.url
          const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 })
          const buffer = Buffer.from(imgRes.data)
          cachePinterest.set(cacheKey, buffer)
          if (cachePinterest.size > 100) cachePinterest.delete(cachePinterest.keys().next().value)
          return buffer
        }
      } catch {}
      try {
        const res = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 15000 })
        const regex = /"url":"(https:\/\/i\.pinimg\.com\/originals\/[^"]+)"/g
        const matches = [...res.data.matchAll(regex)]
        if (matches.length) {
          const randomMatch = matches[Math.floor(Math.random() * Math.min(matches.length, 15))]
          const imageUrl = randomMatch[1].replace(/\\u002F/g, '/')
          const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 })
          const buffer = Buffer.from(imgRes.data)
          cachePinterest.set(cacheKey, buffer)
          return buffer
        }
      } catch {}
    }
    return null
  } catch { return null }
};

const obtenerPersonajes = () => {
  try {
    const contenido = fs.readFileSync('./lib/characters.json', 'utf-8')
    const data = JSON.parse(contenido)
    if (data.characters && Array.isArray(data.characters)) return data.characters
    if (Array.isArray(data)) return data
    return Object.values(data)
  } catch { return [] }
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const s = seconds.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  return m === '00' ? `${s}s` : `${m}m, ${s}s`
}

export default {
  command: ['rollwaifu', 'roll', 'rw', 'rf'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    const userId = msg.sender
    const chat = await db.getChat(chatId)
    const chatUser = await db.getChatUser(chatId, userId)
    const now = Date.now()

    if (chat.adminonly || !chat.gacha) return msg.reply(mess.comandooff)

    const cooldown = chatUser.rwCooldown || 0
    const restante = cooldown - now
    if (restante > 0) return msg.reply(`✎ Espera *${msToTime(restante)}* - cooldown 15m`)

    const loadingMsg = await msg.reply(`⏳ *Cargando...*`);
    const personajes = obtenerPersonajes()
    if (!personajes.length) {
      await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `❌ Sin personajes` }); return;
    }

    const personaje = personajes[Math.floor(Math.random() * personajes.length)]
    const reservado = chat.personajesReservados?.find((p) => p.name === personaje.name)
    let poseedor = null;
    try {
      const chatUsers = await db.getChatUser(chatId);
      if (Array.isArray(chatUsers)) poseedor = chatUsers.find(u => u.characters?.some((c) => c.name === personaje.name));
    } catch {}

    try {
      let estado = 'Libre'
      if (poseedor) { const ud = await db.getUser(poseedor.user_id); estado = `Reclamado por ${ud.name || 'Alguien'}` }
      else if (reservado) { const ud = await db.getUser(reservado.userId); estado = `Reservado por ${ud.name || 'Alguien'}` }

      // ✅ CADA 15 MINUTOS
      await db.updateChatUser(chatId, userId, 'rwCooldown', now + 15 * 60 * 1000)

      const rand = Math.random() * 100;
      let valorAleatorio = rand < 80 ? Math.floor(Math.random() * (7000 - 50 + 1)) + 50 : rand < 95 ? Math.floor(Math.random() * (10000 - 8000 + 1)) + 8000 : Math.floor(Math.random() * (19000 - 11000 + 1)) + 11000;
      
      const valorPersonaje = valorAleatorio.toLocaleString();
      const mensaje = `➩ Nombre › *${personaje.name}*\n\nੈ⚥‧₊˚ Género › *${personaje.gender}*\nੈ⛁‧₊˚ Valor › *${valorPersonaje}*\nੈ❖‧₊˚ Estado › *${estado}*\nੈ❀‧₊˚ Fuente › *${personaje.source}*\n\n${dev}`

      let imagen = null;
      if (personaje.images?.length > 0) {
        try { const url = personaje.images[Math.floor(Math.random() * personaje.images.length)]; const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 }); imagen = Buffer.from(r.data); } catch {}
      }
      if (!imagen && personaje.image) {
        try { const r = await axios.get(personaje.image, { responseType: 'arraybuffer', timeout: 10000 }); imagen = Buffer.from(r.data); } catch {}
      }
      if (!imagen) imagen = await obtenerImagenPinterest(personaje.name, personaje.source);

      if (!imagen) {
        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `✅ *${personaje.name}* (sin imagen)\n\n${mensaje}` });
      } else {
        const sent = await sock.sendMessage(chatId, { image: imagen, caption: mensaje, mimetype: 'image/jpeg' }, { quoted: msg });
        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `✅ *${personaje.name}* (${valorPersonaje})` });
        if (!poseedor) {
          const idUnico = uuidv4().slice(0, 8)
          const nuevoReservado = { id: idUnico, name: personaje.name, value: valorAleatorio, gender: personaje.gender, source: personaje.source, keyword: personaje.keyword, image: personaje.image || '', images: personaje.images || [], userId: userId, reservedUntil: now + 20000, expiresAt: now + 60000, messageId: sent.key.id }
          let personajesReservados = chat.personajesReservados || []
          const i = personajesReservados.findIndex(p => p.name === personaje.name)
          if (i !== -1) personajesReservados[i] = nuevoReservado; else personajesReservados.push(nuevoReservado)
          await db.updateChat(chatId, 'personajesReservados', personajesReservados)
        }
        return
      }

      if (!poseedor) {
        const idUnico = uuidv4().slice(0, 8)
        const nuevoReservado = { id: idUnico, name: personaje.name, value: valorAleatorio, gender: personaje.gender, source: personaje.source, keyword: personaje.keyword, image: personaje.image || '', images: personaje.images || [], userId: userId, reservedUntil: now + 20000, expiresAt: now + 60000, messageId: null }
        let personajesReservados = chat.personajesReservados || []
        const i = personajesReservados.findIndex(p => p.name === personaje.name)
        if (i !== -1) personajesReservados[i] = nuevoReservado; else personajesReservados.push(nuevoReservado)
        await db.updateChat(chatId, 'personajesReservados', personajesReservados)
      }

    } catch (e) {
      console.error(e)
      await db.updateChatUser(chatId, userId, 'rwCooldown', 0)
      await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `❌ Error: ${e.message}` });
    }
  },
};
