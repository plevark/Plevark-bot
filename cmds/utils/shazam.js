import db from "#db"
import fetch from 'node-fetch'
import FormData from 'form-data'

export default {
  command: ['shazam', 'whatmusic'],
  category: 'utils',

  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      const q = msg.quoted ? msg.quoted : msg
      const mime = q.mimetype || q.msg?.mimetype || ''

      if (!mime) {
        return msg.reply(
          `✐ Responde a un audio o video usando el comando.`
        )
      }

      if (!/audio|video/.test(mime)) {
        return msg.reply('✎ Solo se admiten audios o videos')
      }

      const media = await q.download()
      const url = await uploadToUguu(media, mime)

      if (!url) {
        return msg.reply('✎ Error al subir el archivo')
      }

      const apis = `${api.url}/tools/whatmusic?url=${encodeURIComponent(url)}&key=${api.key}`
      const res = await fetch(apis)
      const json = await res.json()

      if (!json || json.status === false || !json.data?.length) {
        return msg.reply('✎ No se pudo reconocer la canción')
      }

      const data = json.data[0] 

      const title = data.title || 'Desconocido'
      const artist = data.artist || 'Desconocido'
      const album = data.album || 'No disponible'
      const genre = data.genres || 'No disponible'
      const duration = data.duration || 'No disponible'
      const release = data.release_date || 'No disponible'

      const links = Array.isArray(data.url) ? data.url.map(u => `- ${u}`).join('\n') : ''

      const caption =
`ㅤ۟∩　ׅ　★ ໌　ׅ　🅢𝗁𝖺𝗓𝖺𝗆　ׄᰙ

𖣣ֶㅤ֯⌗ ☄︎ ⬭ *Título ::* ${title}
𖣣ֶㅤ֯⌗ ❖ ⬭ *Artista ::* ${artist}
𖣣ֶㅤ֯⌗ ★ ⬭ *Álbum ::* ${album}
𖣣ֶㅤ֯⌗ ♡ ⬭ *Género ::* ${genre}
𖣣ֶㅤ֯⌗ ❀ ⬭ *Duración ::* ${duration}
𖣣ֶㅤ֯⌗ ❑ ⬭ *Lanzamiento ::* ${release}

> ➥ *Links*
${links}`

      if (data.image) {
        await sock.sendMessage(
          msg.chat,
          {
            image: { url: data.image },
            caption
          },
          { quoted: msg }
        )
      } else {
        await msg.reply(caption)
      }

    } catch (e) {
     // console.error(e)
      msg.reply(
        msgglobal
      )
    }
  }
}

async function uploadToUguu(buffer, mime) {
  try {
    const ext = mime.includes('video')
      ? 'mp4'
      : mime.includes('audio')
      ? 'mp3'
      : 'bin'

    const body = new FormData()
    body.append('files[]', buffer, `file.${ext}`)

    const res = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body,
      headers: body.getHeaders()
    })

    const json = await res.json()
    return json.files?.[0]?.url || null

  } catch (e) {
    console.error(e)
    return null
  }
}