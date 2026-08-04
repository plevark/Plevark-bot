import db from "#db"
import { promises as fs } from 'fs';
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

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    const parsed = JSON.parse(data)
    
    // 🔥 SI EL ARCHIVO TIENE { characters: [...] }, EXTRAER EL ARRAY
    if (parsed.characters && Array.isArray(parsed.characters)) {
      return parsed.characters
    }
    // SI YA ES UN ARRAY, DEVOLVERLO DIRECTAMENTE
    if (Array.isArray(parsed)) {
      return parsed
    }
    // SI ES OTRO TIPO DE OBJETO, CONVERTIRLO A ARRAY
    return Object.values(parsed)
  } catch (error) {
    console.error('❀ Error al cargar characters.json:', error)
    throw new Error('❀ No se pudo cargar el archivo characters.json')
  }
}

function findSimilarCharacter(name, characters) {
  // 🔥 VERIFICAR QUE characters SEA UN ARRAY
  if (!Array.isArray(characters)) {
    console.error('❌ characters no es un array:', characters)
    return null
  }
  
  name = name.toLowerCase().trim()
  return (
    characters.find((c) => c.name?.toLowerCase() === name) ||
    characters.find((c) => c.name?.toLowerCase().includes(name)) ||
    characters.find((c) => name.includes(c.name?.toLowerCase()))
  )
}

export default {
  command: ['charimage', 'wimage', 'cimage'],
  category: 'gacha',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat
    
    const chatConfig = await db.getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return msg.reply(mess.comandooff)

    if (args.length === 0)
      return msg.reply(`《✤》 Por favor, proporciona el nombre de un personaje.`)

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      
      // 🔥 VERIFICAR QUE TENEMOS PERSONAJES
      if (!Array.isArray(characters) || characters.length === 0) {
        return msg.reply(`✎ No se encontraron personajes en el archivo.`)
      }
      
      const character = findSimilarCharacter(characterName, characters)

      if (!character)
        return msg.reply(`✎ No se ha encontrado el personaje *${characterName}*, ni uno similar.`)

      const message = `➭ Nombre › *${character.name}*

ੈ⚥‧₊˚ Género › *${character.gender || 'Desconocido'}*
ੈ⛁‧₊˚ Valor › *${character.value ? character.value.toLocaleString() : '0'}*
ੈ❀︎‧₊˚ Fuente › *${character.source || 'Desconocido'}*

${dev}`

      // 🔥 BUSCAR IMAGEN: primero en el array de imágenes, luego por keyword
      let imagen = null;

      // 1️⃣ Si tiene múltiples imágenes, elegir una aleatoria
      if (character.images && Array.isArray(character.images) && character.images.length > 0) {
        try {
          const randomIndex = Math.floor(Math.random() * character.images.length);
          const imageUrl = character.images[randomIndex];
          console.log(`📸 Imagen ${randomIndex + 1}/${character.images.length} para: ${character.name}`);
          
          const response = await fetch(imageUrl);
          const arrayBuffer = await response.arrayBuffer();
          imagen = Buffer.from(arrayBuffer);
        } catch (e) {
          console.log(`❌ Error cargando imagen aleatoria: ${e.message}`);
        }
      }
      
      // 2️⃣ Si tiene una sola imagen fija
      if (!imagen && character.image) {
        try {
          const response = await fetch(character.image);
          const arrayBuffer = await response.arrayBuffer();
          imagen = Buffer.from(arrayBuffer);
          console.log(`📸 Imagen fija para: ${character.name}`);
        } catch (e) {
          console.log(`❌ Error cargando imagen fija: ${e.message}`);
        }
      }
      
      // 3️⃣ Si no tiene imagen, buscar por keyword
      if (!imagen) {
        imagen = await obtenerImagen(character.keyword, character.name);
      }

      if (!imagen) {
        return msg.reply(`✐ No se pudo obtener una imagen para *${character.name}*.`);
      }

      const payload = {
        image: imagen, 
        caption: message, 
        mimetype: 'image/jpeg'
      };

      await sock.sendMessage(chatId, payload, { quoted: msg });

    } catch (error) {
      console.error(error)
      await msg.reply(msgglobal)
    }
  },
}