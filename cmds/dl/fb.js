import fs from 'fs'

const COMMAND_NAME = "undressme"
const COOLDOWN_DIAS = 2
const COOLDOWN_MS = COOLDOWN_DIAS * 24 * 60 * 60 * 1000
const DB_PATH = "./db_undame.json"

function loadDB(){
  try{
    if(!fs.existsSync(DB_PATH)) return {}
    return JSON.parse(fs.readFileSync(DB_PATH,"utf8"))
  }catch{ return {} }
}
function saveDB(db){ fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2)) }

export default {
  command: [COMMAND_NAME],
  run: async ({ msg, sock }) => {
    const db = loadDB()
    const userId = msg.key.participant || msg.key.remoteJid
    const now = Date.now()
    const last = db[userId] || 0
    const diff = now - last

    if(diff < COOLDOWN_MS){
      const restante = COOLDOWN_MS - diff
      const horas = Math.floor(restante / (1000*60*60))
      const mins = Math.floor((restante % (1000*60*60)) / (1000*60))
      return await sock.sendMessage(msg.chat, { 
        text: `⏳ @${userId.split("@")[0]} ya usaste *!${COMMAND_NAME}*\n🕒 Podras usar de nuevo en: *${horas}h ${mins}m*\n📅 1 vez cada ${COOLDOWN_DIAS} dias`,
        mentions: [userId]
      }, { quoted: msg })
    }

    db[userId] = now
    saveDB(db)

    await sock.sendMessage(msg.chat, { 
      text: `✨ *GENERANDO...* ✨\n\n👤 Usuario: @${userId.split("@")[0]}\n⏳ Preparando tu contenido...\n\n`,
      mentions: [userId]
    }, { quoted: msg })
  }
}