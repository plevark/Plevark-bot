import fs from 'fs'
import path from 'path'
import axios from 'axios'

const GROQ_KEY = "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"

let games = new Map()
const aki = (n) => { try { const p = path.join(process.cwd(),'media','aki',n); return fs.existsSync(p) ? fs.readFileSync(p) : null } catch { return null } }

async function pinterest(q) {
  try {
    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/`
    const params = { source_url: `/search/pins/?q=${q}`, data: JSON.stringify({ options: { query: q, scope: "pins" } }) }
    const res = await axios.get(url, { params, headers: { "User-Agent": "Mozilla/5.0" }, timeout: 7000 })
    const pins = res.data?.resource_response?.data?.results?.filter(p => p.images?.orig?.url) || []
    if (pins.length) {
      const u = pins[Math.floor(Math.random()*pins.length)].images.orig.url
      const img = await axios.get(u, { responseType: 'arraybuffer', timeout: 7000 })
      return Buffer.from(img.data)
    }
  } catch {}
  return null
}

// UN SOLO PROMPT GIGANTE QUE HACE TODO
async function groqMaster(prompt) {
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Eres Akinator, un genio que adivina personajes. 
REGLAS ESTRICTAS:
- NUNCA repitas una pregunta que ya está en la lista de PREGUNTAS HECHAS.
- Si tienes suficiente información (4+ respuestas), ADIVINA.
- Si no tienes suficiente, haz 1 pregunta NUEVA, corta, si/no.
- Formato OBLIGATORIO:
Si preguntas: PREGUNTA: ¿Tu personaje ...?
Si adivinas: ADIVINA: Nombre del personaje
- No pongas DESCRIPCION, no pongas Paso X/12, no pongas explicaciones.
- No repitas nombres que ya fallaste.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })
    const j = await r.json()
    return j.choices?.[0]?.message?.content?.trim() || null
  } catch (e) {
    console.log(e)
    return null
  }
}

export default {
  command: ['akinator','aki'],
  category: 'fun',
  run: async ({ msg, sock, args }) => {
    const id = msg.sender, chat = msg.chat
    const t = args.join(" ").toLowerCase().trim()

    if (!t) return sock.sendMessage(chat, { text: `🧞 !aki start para jugar` }, { quoted: msg })
    if (t === 'stop') { games.delete(id); return sock.sendMessage(chat, { text: 'Terminado.' }, { quoted: msg }) }

    if (t === 'start') {
      games.set(id, { historial: [], preguntas: [], fallos: [], lastGuess: null })
      return sock.sendMessage(chat, { image: aki('pensando_facil.jpg'), caption: `🧞 Estoy pensando...\n\n¿Tu personaje es real?` }, { quoted: msg })
    }

    if (!games.has(id)) return sock.sendMessage(chat, { text: 'Pon !aki start' }, { quoted: msg })
    const g = games.get(id)

    // Respuesta a adivinanza
    if (g.lastGuess) {
      if (t.startsWith('si')) {
        games.delete(id)
        return sock.sendMessage(chat, { image: aki('gano.jpg'), caption: `🎉 ¡TE ATRAPÉ! Era ${g.lastGuess}` }, { quoted: msg })
      }
      if (t === 'no' || t.includes('seguir')) {
        g.fallos.push(g.lastGuess)
        g.historial.push(`No es ${g.lastGuess}`)
        g.lastGuess = null
      }
    } else {
      g.historial.push(`${g.preguntas[g.preguntas.length-1] || 'Inicio'} = ${t}`)
    }

    // PROMPT GIGANTE PARA GROQ - EL SOLO DECIDE TODO
    const promptGigante = `
HISTORIAL DE RESPUESTAS:
${g.historial.join('\n')}

PREGUNTAS QUE YA HICISTE Y ESTÁN PROHIBIDAS REPETIR:
${g.preguntas.join(', ') || 'Ninguna'}

PERSONAJES QUE YA FALLASTE Y ESTÁN PROHIBIDOS:
${g.fallos.join(', ') || 'Ninguno'}

INSTRUCCIÓN: Basado en el historial, si ya puedes adivinar con seguridad, responde ADIVINA: Nombre. Si no, haz una pregunta NUEVA que NO esté en la lista de prohibidas.
`

    const respuesta = await groqMaster(promptGigante)
    
    if (!respuesta) {
      // fallback si Groq no responde
      const fallback = "¿Tu personaje es muy famoso en internet?"
      g.preguntas.push(fallback)
      games.set(id, g)
      return sock.sendMessage(chat, { image: aki('seguro.jpg'), caption: fallback }, { quoted: msg })
    }

    if (respuesta.startsWith('ADIVINA:')) {
      const nombre = respuesta.replace('ADIVINA:', '').trim()
      if (g.fallos.includes(nombre)) {
        // si Groq repite un fallo, obligalo a preguntar
        g.preguntas.push("¿Tu personaje tiene más de 10M de seguidores?")
        games.set(id, g)
        return sock.sendMessage(chat, { image: aki('seguro.jpg'), caption: `¿Tu personaje tiene más de 10M de seguidores?` }, { quoted: msg })
      }
      g.lastGuess = nombre
      const img = await pinterest(nombre) || aki('seguro.jpg')
      games.set(id, g)
      return sock.sendMessage(chat, { image: img, caption: `🤔 Creo que ya sé...\n\n¿Es *${nombre}*?\n\n!aki si / !aki no` }, { quoted: msg })
    }

    // Es una pregunta
    let pregunta = respuesta.replace('PREGUNTA:', '').trim()
    if (!pregunta.endsWith('?')) pregunta += '?'

    // Anti-repetición final por si Groq se hace el loco
    if (g.preguntas.includes(pregunta)) {
      pregunta = "¿Tu personaje es más famoso que el anterior que pensé?"
    }

    g.preguntas.push(pregunta)
    games.set(id, g)

    return sock.sendMessage(chat, { image: aki('seguro.jpg') || await pinterest('Akinator'), caption: pregunta }, { quoted: msg })
  }
}