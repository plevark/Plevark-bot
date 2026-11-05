import sharp from 'sharp';

export default {
  command: ['brat'],
  category: 'fun',
  description: 'Genera un sticker estilo Brat con el texto que escribas',

  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      if (!args || args.length === 0) {
        return msg.reply(
          `📌 *Uso:* ${usedPrefix}${command} <texto>\n\n` +
          `*Ejemplos:*\n` +
          `▸ ${usedPrefix}${command} hola\n` +
          `▸ ${usedPrefix}${command} soy un bot\n` +
          `▸ ${usedPrefix}${command} brat summer`
        );
      }

      const texto = args.join(' ').toLowerCase();

      console.log(`🎨 Generando sticker brat: "${texto}"`);

      const stickerBuffer = await generarBratSticker(texto);

      if (!stickerBuffer || stickerBuffer.length === 0) {
        return msg.reply('❌ No se pudo generar el sticker.');
      }

      await sock.sendMessage(msg.chat, {
        sticker: stickerBuffer
      }, { quoted: msg });

      await msg.react('✅');

    } catch (e) {
      console.error('❌ Error en brat:', e);
      await msg.react('❌');
      await msg.reply(`❌ *Error:* ${e.message || 'Error desconocido'}`);
    }
  }
};

// ============================================
// 🔥 MEDIR ANCHO REAL DE TEXTO
// ============================================
function medirTexto(texto, fontSize) {
  const anchos = {
    'i': 0.22, 'l': 0.22, 'j': 0.22, 'I': 0.28, 'f': 0.28, 't': 0.28, 'r': 0.33,
    'm': 0.85, 'w': 0.72, 'M': 0.83, 'W': 0.94,
    ' ': 0.28,
    '.': 0.28, ',': 0.28, ':': 0.28, ';': 0.28, '!': 0.28, '|': 0.26,
    "'": 0.22, '"': 0.35, '-': 0.33,
    '0': 0.55, '1': 0.55, '2': 0.55, '3': 0.55, '4': 0.55,
    '5': 0.55, '6': 0.55, '7': 0.55, '8': 0.55, '9': 0.55
  };
  
  let anchoTotal = 0;
  for (const char of texto) {
    const factor = anchos[char] !== undefined ? anchos[char] : 0.55;
    anchoTotal += factor;
  }
  return anchoTotal * fontSize;
}

// ============================================
// 🔥 ENVOLVER TEXTO EN LÍNEAS
// ============================================
function envolverTexto(texto, anchoMax, fontSize) {
  const palabras = texto.split(' ');
  const lineas = [];
  let lineaActual = '';

  for (const palabra of palabras) {
    const textoProbar = lineaActual ? lineaActual + ' ' + palabra : palabra;
    const anchoProbar = medirTexto(textoProbar, fontSize);

    if (anchoProbar <= anchoMax) {
      lineaActual = textoProbar;
    } else {
      if (lineaActual) lineas.push(lineaActual);
      if (medirTexto(palabra, fontSize) > anchoMax) {
        let resto = palabra;
        while (resto.length > 0) {
          let corte = resto.length;
          while (corte > 1 && medirTexto(resto.slice(0, corte), fontSize) > anchoMax) {
            corte--;
          }
          lineas.push(resto.slice(0, corte));
          resto = resto.slice(corte);
        }
        lineaActual = '';
      } else {
        lineaActual = palabra;
      }
    }
  }
  if (lineaActual) lineas.push(lineaActual);
  return lineas;
}

// ============================================
// 🔥 CALCULAR FONT SIZE ÓPTIMO
// ============================================
function calcularFontSizeOptimo(texto, anchoDisp, altoDisp) {
  const lineHeightFactor = 0.85;
  const minFontSize = 8;

  let fontSize = Math.floor(altoDisp / lineHeightFactor);

  while (fontSize > minFontSize) {
    const lineas = envolverTexto(texto, anchoDisp, fontSize);
    const numLineas = lineas.length;
    const alturaNecesaria = numLineas * fontSize * lineHeightFactor;

    if (alturaNecesaria <= altoDisp) {
      let anchoMax = 0;
      for (const linea of lineas) {
        const a = medirTexto(linea, fontSize);
        if (a > anchoMax) anchoMax = a;
      }
      if (anchoMax <= anchoDisp) {
        return { fontSize, lineas };
      }
    }

    fontSize -= 2;
  }

  return {
    fontSize: minFontSize,
    lineas: envolverTexto(texto, anchoDisp, minFontSize)
  };
}

// ============================================
// 🔥 GENERADOR BRAT (CALIDAD BAJA)
// ============================================
async function generarBratSticker(texto) {
  const ancho = 512;
  const alto = 512;
  const padding = 8;
  const anchoDisponible = ancho - padding * 2;
  const altoDisponible = alto - padding * 2;

  const escapar = (t) => t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const { fontSize, lineas } = calcularFontSizeOptimo(texto, anchoDisponible, altoDisponible);

  console.log(`📏 Font: ${fontSize}px | Líneas: ${lineas.length}`);

  const lineHeightFactor = 0.85;
  const lineHeight = fontSize * lineHeightFactor;
  const alturaTotalTexto = lineas.length * lineHeight;
  const yInicial = (alto - alturaTotalTexto) / 2 + fontSize * 0.85;

  let tspans = '';
  lineas.forEach((linea, i) => {
    tspans += `<tspan x="${padding}" y="${yInicial + i * lineHeight}" text-anchor="start">${escapar(linea)}</tspan>`;
  });

  const svg = `
    <svg width="${ancho}" height="${alto}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${ancho}" height="${alto}" fill="#FFFFFF"/>
      <text
        font-family="Helvetica, Arial, sans-serif"
        font-weight="normal"
        font-size="${fontSize}px"
        fill="#000000"
        letter-spacing="-${(fontSize * 0.02).toFixed(2)}"
        x="${padding}"
        y="${yInicial}"
        text-anchor="start"
      >${tspans}</text>
    </svg>
  `;

  // ==========================================
  // 🔥 CALIDAD MÁS BAJA
  // ==========================================
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  const jpegBuffer = await sharp(pngBuffer)
    .jpeg({ quality: 8, chromaSubsampling: '4:2:0' }) // 🔥 q8 (antes 15)
    .toBuffer();

  const stickerBuffer = await sharp(jpegBuffer)
    .blur(2.6) // 🔥 Blur 2.6 (antes 2.2)
    .webp({ quality: 60 }) // 🔥 WebP q60 (antes 70)
    .toBuffer();

  return stickerBuffer;
}