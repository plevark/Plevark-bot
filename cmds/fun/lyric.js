export default {
  command: ['lyric', 'letra'],
  category: 'busqueda',
  description: 'Busca la letra de una canción',
  run: async ({ msg, sock, args, usedPrefix, chat }) => {
    
    const text = args.join(' ').trim();
    if (!text) {
      return sock.sendMessage(chat || msg.key.remoteJid, { 
        text: `🎵 *Uso correcto:* ${usedPrefix}letra <nombre>\n\nEj: ${usedPrefix}letra believer imagine dragons` 
      }, { quoted: msg });
    }

    try {
      const res = await fetch(`https://gawrgura-api.onrender.com/search/lyrics?q=${encodeURIComponent(text)}`);
      const json = await res.json();

      if (!json.status || !json.result) throw new Error("No lyrics");

      let lyric = json.result.replace(/\n{3,}/g, "\n\n").trim();

      // Limitar a 4000 caracteres por si es muy larga
      if (lyric.length > 4000) lyric = lyric.slice(0, 4000) + "\n\n...[letra cortada]";

      await sock.sendMessage(chat || msg.key.remoteJid, {
        text: `🎵 *Letra encontrada*\n\n📖 *Búsqueda:* ${text}\n\n${lyric}`
      }, { quoted: msg });

    } catch (e) {
      console.error("lyric error:", e.message);
      return sock.sendMessage(chat || msg.key.remoteJid, { 
        text: "❌ No se pudo obtener la letra. Prueba con `artista - cancion`\nEj: `!letra believer imagine dragons`" 
      }, { quoted: msg });
    }
  }
};