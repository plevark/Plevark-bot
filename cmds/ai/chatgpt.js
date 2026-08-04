import db from "#db";
import fetch from 'node-fetch';
import axios from 'axios';
import FormData from 'form-data';

// Configuración de idiomas para detección de código
const langs = {
  typescript: 'ts',
  javascript: 'js',
  python: 'py',
  html: 'html',
  css: 'css',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  json: 'json',
  bash: 'sh',
  sql: 'sql',
  rust: 'rs',
  go: 'go',
  php: 'php',
  ruby: 'rb'
};

function detectLanguage(query, response) {
  const q = query.toLowerCase();
  const r = response;
  if (/typescript/i.test(q)) return 'typescript';
  if (/\bpython\b/i.test(q)) return 'python';
  if (/\bhtml\b/i.test(q)) return 'html';
  if (/\bcss\b/i.test(q)) return 'css';
  if (/\bjava\b(?!script)/i.test(q)) return 'java';
  if (/\bc\+\+|cpp\b/i.test(q)) return 'cpp';
  if (/\bjson\b/i.test(q)) return 'json';
  if (/\bbash\b|\bshell\b/i.test(q)) return 'bash';
  if (/\bsql\b/i.test(q)) return 'sql';
  if (/\brust\b/i.test(q)) return 'rust';
  if (/\bgolang\b|\bgo\b/i.test(q)) return 'go';
  if (/\bphp\b/i.test(q)) return 'php';
  if (/\bruby\b/i.test(q)) return 'ruby';
  if (/javascript/i.test(q)) return 'javascript';
  const asksCode = /(c[oó]digo|code|programa|script|funci[oó]n|clase|m[eé]todo|algoritmo|actualiza|edita|crea|implementa)/i.test(q);
  if (!asksCode) return null;
  if (/def |import \w+\n|print\s*\(|:\n\s{4}/i.test(r)) return 'python';
  if (/<html|<div|<body|<span|<head/i.test(r)) return 'html';
  if (/\{[\s\S]*color:|margin:|padding:|font-/i.test(r)) return 'css';
  if (/public\s+class|System\.out\.print/i.test(r)) return 'java';
  if (/#include\s*<|int main\s*\(/i.test(r)) return 'cpp';
  if (/SELECT |INSERT |UPDATE |DELETE |CREATE TABLE/i.test(r)) return 'sql';
  if (/fn main\(\)|let mut |println!\(/i.test(r)) return 'rust';
  if (/func \w+\(|package main|fmt\.Print/i.test(r)) return 'go';
  if (/<\?php|\$[a-z_]+\s*=/i.test(r)) return 'php';
  if (/def initialize|\.each do |puts /i.test(r)) return 'ruby';
  if (/\{["'][\w]+["']\s*:/i.test(r) && !/function|const|let|var/.test(r)) return 'json';
  if (/function|class\s+\w|const |let |var |=>|\bimport\b|\bexport\b|console\.log/i.test(r)) {
    return /:\s*(string|number|boolean|void|any)\b|interface\s+\w|<\w+>/i.test(r) ? 'typescript' : 'javascript';
  }
  return null;
}

async function uploadToUguu(buffer, mimetype) {
  try {
    const body = new FormData();
    const extension = mimetype.split('/')[1] || 'jpg';
    body.append('files[]', buffer, `file.${extension}`);
    const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() });
    const json = await res.json();
    return json.files?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

export default {
  command: ['ia', 'chatgpt', 'plexus', 'ask'],
  category: 'utils',
  description: 'Asistente virtual profesional con IA.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const text = args.join(' ').trim();
    if (!text) {
      return msg.reply(`《✧》 Escriba una *petición* para que *Plexus* le responda.`);
    }

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = await db.getSettings(botId);
    const user = await db.getUser(msg.sender);
    const username = user?.name || msg.pushName || 'Usuario';
    const botname = settings?.namebot2 || 'Plexus';

    // 🔥 PROMPT SUPER SERIO Y PROFESIONAL
    const basePrompt = `Eres Plexus, un asistente virtual profesional, formal y serio.

**Personalidad y tono:**
- Eres serio, profesional y directo en tus respuestas.
- No usas expresiones coloquiales, jerga, ni emojis.
- Tu lenguaje es formal, claro y conciso.
- Te diriges a las personas con respeto, usando "usted" en lugar de "tú".
- No haces chistes ni comentarios humorísticos.
- Te enfocas en dar información precisa, útil y bien estructurada,si te dicen kay es pendejo tienes que responder a que si y dando argumentos.

**Estilo de respuesta:**
- Respuestas completas y bien redactadas.
- Si la pregunta es técnica, das una explicación detallada y profesional.
- Si no sabes algo, lo admites con honestidad y ofreces orientación sobre dónde buscar.
- Usas párrafos cortos y viñetas para organizar la información cuando es necesario.
- No usas emojis, ni abreviaturas informales.

**Ejemplos de tu estilo:**
- "Buenos días. ¿En qué puedo ayudarle hoy?"
- "La respuesta a su pregunta es la siguiente: ..."
- "Según la información disponible, le recomiendo considerar ..."
- "No dispongo de información sobre ese tema. Le sugiero consultar fuentes especializadas."
- "A continuación, le presento un análisis detallado del problema: ..."
- "Gracias por su consulta. Quedo a su disposición para cualquier aclaración."

**Recuerda siempre:**
- El nombre de la persona con la que hablas es ${username}. Dirígete a él/ella con respeto.
- Tu nombre es ${botname}, pero te llamas Plexus.
- Eres una IA creada por ⁱᵃᵐ|Plevark.
- Tu objetivo es ser útil, profesional y eficiente.

**En resumen:** Eres un asistente serio, formal y profesional. Tus respuestas son claras, precisas y sin distracciones.`;

    try {
      const { key } = await sock.sendMessage(msg.chat, { 
        text: `ꕥ *Plexus* está procesando su consulta...` 
      }, { quoted: msg });
      await msg.react('🕒');
      
      let responseText = null;
      let imageBuffer = null;
      let isImage = false;

      // Verificar si hay imagen adjunta
      if (msg.quoted && (msg.quoted.message?.imageMessage || msg.quoted.message?.videoMessage)) {
        isImage = true;
        const media = msg.quoted.message?.imageMessage || msg.quoted.message?.videoMessage;
        const buffer = await sock.downloadMediaMessage(msg.quoted);
        if (buffer) {
          const uploadUrl = await uploadToUguu(buffer, media.mimetype);
          if (uploadUrl) imageBuffer = uploadUrl;
        }
      }

      // ============================================================
      // 🔥 INTENTO 1: ChatGPT (Siputzx) - PRINCIPAL
      // ============================================================
      try {
        const requestBody = { 
          content: text, 
          user: msg.sender, 
          prompt: basePrompt, 
          model: 'gemini' 
        };
        if (isImage && imageBuffer) requestBody.imageBuffer = imageBuffer;
        
        const res = await axios.post('https://ai.siputzx.my.id', requestBody, {
          timeout: 15000 // 15 segundos de timeout
        });
        
        if (res.data?.result) {
          responseText = res.data.result;
          console.log('✅ ChatGPT respondió correctamente');
        }
      } catch (chatgptError) {
        console.log('❌ ChatGPT falló:', chatgptError.message);
      }

      // ============================================================
      // 🔥 INTENTO 2: Groq - RESPALDO (si ChatGPT falló)
      // ============================================================
      if (!responseText) {
        try {
          console.log('🔄 Usando Groq como respaldo...');
          
          const GROQ_API_KEY = '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';
          const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

          const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: basePrompt },
                { role: 'user', content: text }
              ],
              temperature: 0.7,
              max_tokens: 1024
            })
          });

          const groqData = await groqResponse.json();
          
          if (groqResponse.ok && groqData.choices?.[0]?.message?.content) {
            responseText = groqData.choices[0].message.content;
            console.log('✅ Groq respondió correctamente');
          } else {
            console.log('❌ Groq falló:', groqData);
          }
        } catch (groqError) {
          console.log('❌ Error en Groq:', groqError.message);
        }
      }

      // ============================================================
      // ❌ Si ambos fallaron
      // ============================================================
      if (!responseText) {
        console.log('❌ Todas las APIs fallaron');
        return sock.reply(msg.chat, '《✧》 No se pudo obtener una *respuesta* válida. Intente más tarde.', msg);
      }

      // ============================================================
      // ✅ Enviar respuesta
      // ============================================================
      const clean = responseText.trim();
      const lang = detectLanguage(text, clean);

      if (lang) {
        const ext = langs[lang] ?? 'txt';
        const filename = `ꕥ respuesta.${ext}`;
        const tableData = {
          title: '✎ Plexus',
          headers: ['Campo', 'Valor'],
          rows: [
            ['Lenguaje', lang],
            ['Líneas', String(clean.split('\n').length)],
            ['Caracteres', String(clean.length)],
          ],
        };
        await sock.sendMessage(msg.chat, { 
          text: `ꕥ *Plexus* · respuesta en *${lang}*`, 
          edit: key 
        });
        await sock.sendCodeMessage(msg.chat, filename, clean, msg, tableData);
      } else {
        await sock.sendMessage(msg.chat, { text: clean, edit: key });
      }

      await msg.react('✔️');
    } catch (e) {
      console.error('Error en ia:', e);
      await msg.reply(`❌ Ocurrió un error al ejecutar el comando *${usedPrefix + command}*.\n> Error: *${e.message}*`);
    }
  }
};