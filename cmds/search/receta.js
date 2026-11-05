import fetch from 'node-fetch'

export default {
  command: ['receta', 'recetas'],
  category: 'search',
  run: async ({ msg, sock, args }) => {
    const query = args.join(' ').trim()
    if (!query) return msg.reply(`✿ Usa: *!receta brownie*`)

    const finalQuery = query.split('|')[0].trim()

    const queryPinterest = `${finalQuery} imagen de comida`

    const promptChef = `Actúa como chef profesional. REGLAS OBLIGATORIAS:
- No uses #
- No uses ** ni ****, usa SOLO UN asterisco *texto* para resaltar
- Nunca pongas :::writing, variant, title, id ni nada parecido
- Deja un renglón en blanco entre cada sección

Formato exacto:

🍽️ *${finalQuery}*

📝 *Ingredientes:*
- lista con cantidades

👨‍🍳 *Preparación:*
1. paso 1
2. paso 2

⏱️ *Tiempo:*

🔥 *Dificultad:*

💡 *Tip:*

Receta: ${finalQuery}`

    await sock.sendPresenceUpdate('composing', msg.chat)
    const interval = setInterval(() => sock.sendPresenceUpdate('composing', msg.chat).catch(()=>{}), 4000)

    try {
      const iaApi = `${api.url}/ai/chatgpt?text=${encodeURIComponent(promptChef)}&key=${api.key}`
      const pinApi = `${api.url}/search/pinterest?query=${encodeURIComponent(queryPinterest)}&key=${api.key}`

      const [iaRes, pinRes] = await Promise.all([
        fetch(iaApi).then(r => r.json()),
        fetch(pinApi).then(r => r.json()).catch(()=>({data:[]}))
      ])

      clearInterval(interval)
      await sock.sendPresenceUpdate('paused', msg.chat)

      let texto = iaRes.result || iaRes.data || ""
      // Limpieza por si tu API mete ****, lo paso a *
      texto = texto.replace(/\*\*\*\*/g, '*').replace(/\*\*/g, '*').replace(/:::writing[\s\S]*?:::/g, '').trim()

      const img = pinRes.data?.[0]?.hd || pinRes.data?.[0]?.url

      if (img) {
        await sock.sendMessage(msg.chat, { image: { url: img }, caption: texto }, { quoted: msg })
      } else {
        await sock.sendMessage(msg.chat, { text: texto }, { quoted: msg })
      }

    } catch (e) {
      clearInterval(interval)
      await sock.sendPresenceUpdate('paused', msg.chat)
      await msg.reply(`✿ Error: ${e.message}`)
    }
  }
}