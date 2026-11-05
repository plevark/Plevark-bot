import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'

global.owner = ['595994299377']

/*  ⚠ INFORMATION ⚠
Esta key solo está disponible en *cafirexos.com*.  
Si intentas usarla en otros hosts, no funcionará.  
Para acceder a la API en otro host, debes crear una cuenta en api.stellarwa.xyz y adquirir un plan Premium. */

global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'NekoWare@Stellar' 
}

global.msgglobal = '《✧》 Se encontró un error en este comando, intenta mas tarde.\n> ✿ Si el error persiste, reportalo con el comando *#report*.'
global.dev = `ʙᴜɪʟᴛ ʙʏ ɪ'ᴍ luan
 ♡`

global.mess = {
  socket: '(∩´͈ ᴖ `͈∩ ྀི) Este comando solo puede ser ejecutado por un Socket.',
  admin: '٩ʕ◕౪◕ʔو Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '(𓂂꜆◕⩊◕꜀𓂂) Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.',
  nsfw: '(•ૢ⚈͒⌄⚈͒•ૢ) Los comandos de *NSFW* están desactivados en este grupo.',
  comandooff: 'ღゝ◡╹ )ノ Estos comandos estan desactivados en este grupo.'
}

global.my = {
ch: "120363412235157082@newsletter",
ch2: "120363412235157082@newsletterr"
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(pathToFileURL(file).href + `?update=${Date.now()}`)
})