import yts from "yt-search"
import youtubedl from "youtube-dl-exec"
import fs from "fs"
import os from "os"
import path from "path"

const FAST = true // true = audio liviano (más rápido) | false = mejor calidad
const MAX_SECONDS = 15 * 60
const CACHE_MAX = 15
const YT_REGEX = /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i
const FORMAT = FAST ? "139/140/bestaudio[ext=m4a]" : "140/bestaudio[ext=m4a]"

const cache = new Map()    // clave -> Buffer
const pending = new Map()  // clave -> Promise (evita descargar lo mismo dos veces)

async function download(url) {
  const file = path.join(os.tmpdir(), `pa_${Date.now()}_${Math.random().toString(36).slice(2)}.m4a`)
  try {
    await youtubedl(url, {
      format: FORMAT,
      output: file,
      noPlaylist: true,
      noWarnings: true,
      noCheckCertificates: true,
      retries: 2
    })
    return fs.readFileSync(file)
  } finally {
    fs.rmSync(file, { force: true })
  }
}

function getAudio(key, url) {
  if (cache.has(key)) return Promise.resolve(cache.get(key))
  if (pending.has(key)) return pending.get(key)

  const p = download(url)
    .then(buf => {
      cache.set(key, buf)
      if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value)
      return buf
    })
    .finally(() => pending.delete(key))

  pending.set(key, p)
  return p
}

export default {
  command: ["playaudio", "paudio"],
  category: "dl",
  run: async ({ msg, sock, args }) => {
    const text = args.join(" ").trim()
    if (!text) return msg.reply(`✿ Ingresa el nombre o link.\nEj: !playaudio bad bunny monaco`)

    try {
      let url = text
      let key = text
      let title = "audio"

      if (!YT_REGEX.test(text)) {
        const { videos } = await yts(text)
        const v = videos?.[0]
        if (!v) return msg.reply(`✿ Sin resultados para *${text}*`)
        if (v.seconds > MAX_SECONDS) return msg.reply(`✿ El audio dura demasiado (máx. 15 min)`)
        url = v.url
        key = v.videoId
        title = v.title
      }

      const buffer = await getAudio(key, url)

      await sock.sendMessage(
        msg.chat,
        { audio: buffer, mimetype: "audio/mp4", ptt: false, fileName: `${title}.m4a` },
        { quoted: msg }
      )
    } catch (e) {
      console.log(e)
      await msg.reply(`✿ No pude descargar el audio: ${e.message}`)
    }
  },
}