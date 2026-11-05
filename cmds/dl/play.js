import ytsearch from "yt-search"
import axios from "axios"
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

async function getBuffer(url) {
  try {
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
    return Buffer.from(r.data)
  } catch { return null }
}

async function tryDownload(videoUrl) {
  const apis = [
    `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    `https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(videoUrl)}`
  ]

  for (const api of apis) {
    try {
      console.log(`Probando API: ${api.slice(8, 40)}...`)
      const res = await axios.get(api, { timeout: 25000 })
      const dl = res.data?.result?.downloadUrl || res.data?.result?.download_url || res.data?.result?.url || res.data?.downloadUrl || res.data?.data?.download || res.data?.url || res.data?.download
      if (dl && dl.startsWith('http')) {
        console.log(`API OK: ${dl.slice(0, 60)}`)
        return dl
      }
      console.log(`API sin link: ${JSON.stringify(res.data).slice(0, 200)}`)
    } catch (e) {
      console.log(`API falló: ${e.message}`)
    }
  }
  return null
}

export default {
  command: ["play", "mp3", "ytmp3", "ytaudio", "playaudio"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {
    let tmpPath = null
    try {
      if (!args[0]) return await sock.sendMessage(msg.chat, { text: "Pon nombre" }, { quoted: msg })
      
      const query = args.join(" ")
      let videos = []

      if (query.includes("youtube.com") || query.includes("youtu.be")) {
        videos = [{ url: query, title: "audio", image: null, author: { name: "" }, timestamp: "" }]
      } else {
        const search = await ytsearch(query)
        if (!search.videos?.length) return await sock.sendMessage(msg.chat, { text: "No encontré nada para " + query }, { quoted: msg })
        videos = search.videos.slice(0, 3) // Prueba 3 primeros
      }

      const thumb = videos[0].image ? await getBuffer(videos[0].image) : null
      const cap = `*${videos[0].title}*\n> ${videos[0].author?.name || ""} • ${videos[0].timestamp || ""}\n\n⏳ Probando descargas...`
      if (thumb) await sock.sendMessage(msg.chat, { image: thumb, caption: cap }, { quoted: msg })
      else await sock.sendMessage(msg.chat, { text: cap }, { quoted: msg })

      let dlUrl = null
      let finalTitle = videos[0].title

      // Prueba los 3 videos hasta que uno funcione
      for (const v of videos) {
        console.log(`Intentando video: ${v.url} - ${v.title}`)
        dlUrl = await tryDownload(v.url)
        if (dlUrl) {
          finalTitle = v.title
          break
        }
      }

      if (!dlUrl) throw new Error('Todas las APIs fallaron - YouTube bloqueó intruso, prueba !playaudio intruso 【entity-arcangel¦canonical_name=Arcangel】 o nombre más completo')

      const tmpDir = path.join(process.cwd(), 'tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
      tmpPath = path.join(tmpDir, `${randomBytes(6).toString('hex')}.mp3`)

      console.log(`Bajando mp3 de: ${dlUrl.slice(0, 80)}`)
      const audioRes = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 })
      fs.writeFileSync(tmpPath, Buffer.from(audioRes.data))

      if (fs.statSync(tmpPath).size < 5000) throw new Error('Archivo vacío')

      const audioBuffer = fs.readFileSync(tmpPath)

      await sock.sendMessage(msg.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${finalTitle.replace(/[^\w\s]/gi, '').slice(0, 30)}.mp3`,
        ptt: false
      }, { quoted: msg })

    } catch (e) {
      console.log('Play final error:', e.message, e.response?.data)
      await sock.sendMessage(msg.chat, { text: `《✧》 No pude con "${args.join(" ")}"\n\n${e.message}\n\nPrueba: !playaudio intruso arcangel` }, { quoted: msg })
    } finally {
      if (tmpPath) try { fs.unlinkSync(tmpPath) } catch {}
    }
  }
}