import axios from 'axios'

const cooldowns = new Map()
const COOLDOWN = 30 * 1000

export default {
  command: ['img', 'imagen', 'gen', 'crear'],
  category: 'ai',
  isSocket: true,
  run: async ({ msg, sock, text }) => {
    if (!text) return sock.reply(msg.chat, `✿ Que quieres crear?\nEj: .img gato tomando terere`, msg)

    const userId = msg.sender
    const now = Date.now()
    if (cooldowns.has(userId) && now - cooldowns.get(userId) < COOLDOWN) {
      const falta = Math.ceil((COOLDOWN - (now - cooldowns.get(userId))) / 1000)
      return sock.reply(msg.chat, `⏳ *ESPERA, EL BOT TIENE COOLDOWN, INTENTA DENTRO DE ${falta} SEGUNDOS*`, msg)
    }
    cooldowns.set(userId, now)

    await sock.sendMessage(msg.chat, { react: { text: "✨", key: msg.key } })

    const QUALITY = "masterpiece, best quality, ultra detailed, 8k, hyper realistic, photorealistic, sharp focus, intricate details, professional photography, volumetric lighting"
    const prompt = `${text}, ${QUALITY}`

    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1280&height=1280&enhance=true&nologo=true&nofeed=true&seed=${Date.now()}`
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 })
      
      await sock.sendMessage(msg.chat, { 
        image: Buffer.from(res.data), 
        caption: `✨ POLLINATIONS FLUX [INFINITO]\n✦ ${text}` 
      }, { quoted: msg })
      
      await sock.sendMessage(msg.chat, { react: { text: "✅", key: msg.key } })
    } catch (e) {
      cooldowns.delete(userId)
      await sock.reply(msg.chat, `❌ Error: ${e.message}`, msg)
    }
  }
}