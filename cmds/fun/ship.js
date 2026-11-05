import { createCanvas, loadImage } from '@napi-rs/canvas';
import db from "#db";
import { getBuffer } from "#serialize";

// ========== CACHÉ DEL FONDO (se carga UNA sola vez) ==========
let cachedBackground = null;

// ========== LIMPIAR NOMBRES ==========
function cleanName(name) {
  if (!name) return 'Usuario';
  let cleaned = name
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s.'-]/gu, '')
    .trim();
  return cleaned || 'Usuario';
}

// ========== MEDIR ANCHO DE TEXTO ==========
function getTextWidth(ctx, text, fontSize) {
  ctx.font = `bold ${fontSize}px "Segoe UI", "Arial", sans-serif`;
  return ctx.measureText(text).width;
}

// ========== DIBUJAR TEXTO CON BORDE ==========
function drawTextWithBorder(ctx, text, x, y, size, align = 'center', baseline = 'middle') {
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.font = `bold ${size}px "Segoe UI", "Arial", sans-serif`;
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'black';
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'white';
  ctx.fillText(text, x, y);
}

export default {
  command: ['ship'],
  category: 'fun',
  description: 'Calcula la compatibilidad amorosa entre 2 o 3 personas',
  
  run: async ({ msg, sock, args }) => {
    const startTime = Date.now();
    const sender = msg.sender;
    const mentions = msg.mentionedJid || [];
    const hasMe = args.some(a => /^(me|yo)$/i.test(a));

    // ========== CONSTRUIR LISTA DE PARTICIPANTES ==========
    let participants = [...mentions];
    if (hasMe && !participants.includes(sender)) {
      participants.push(sender);
    }
    if (participants.length === 1 && !hasMe) {
      participants.push(sender);
    }
    participants = [...new Set(participants)];

    if (participants.length < 2) {
      return msg.reply('❌ Menciona al menos a una persona.\n• Pareja: #ship @usuario\n• Trío: #ship @usuario1 @usuario2 me');
    }
    if (participants.length > 3) {
      return msg.reply('⚠️ Solo se admiten hasta 3 personas.');
    }

    // ========== OBTENER NOMBRES EN PARALELO ==========
    const namesPromises = participants.map(async (jid) => {
      if (jid === sender) return cleanName(msg.pushName || jid.split('@')[0]);
      try {
        const user = await db.getUser(jid);
        return cleanName(user?.name || jid.split('@')[0]);
      } catch {
        return cleanName(jid.split('@')[0]);
      }
    });
    const names = await Promise.all(namesPromises);

    const randomPercent = Math.floor(Math.random() * 101);

    // ========== CREAR CANVAS ==========
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    // ========== 🖼️ FONDO CON CACHÉ (FLASH) ==========
    if (!cachedBackground) {
      try {
        const bgBuffer = await getBuffer('https://i.postimg.cc/x1HVh3z5/neviorory-by-frenzy-i-ruin.jpg');
        cachedBackground = await loadImage(bgBuffer);
        console.log('✅ Fondo de ship cargado en caché');
      } catch {
        cachedBackground = null;
      }
    }

    if (cachedBackground) {
      ctx.drawImage(cachedBackground, 0, 0, canvas.width, canvas.height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ff9a9e');
      gradient.addColorStop(0.5, '#fad0c4');
      gradient.addColorStop(1, '#fbc2eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ========== CORAZONES DECORATIVOS ==========
    ctx.font = '40px "Segoe UI", "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 8; i++) {
      const x = 50 + i * 100;
      const y = 30 + Math.random() * 440;
      ctx.fillText('♥', x, y);
    }

    // ========== PORCENTAJE ==========
    const percentX = 400;
    const percentY = 120;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(percentX, percentY, 75, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#ff6b81';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 52px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ff4757';
    ctx.fillText(`${randomPercent}%`, percentX, percentY - 2);

    // ========== NOMBRES Y CORAZONES ==========
    const count = participants.length;
    const nameY = 280;
    const maxTotalWidth = 650;
    const heartChar = '♥';
    const heartSize = 40;
    let fontSize = 38;
    const gap = 30;

    let widths = names.map(n => getTextWidth(ctx, n, fontSize));
    let heartWidth = getTextWidth(ctx, heartChar, heartSize);
    let totalWidth = widths.reduce((a,b) => a + b, 0) + (count-1) * heartWidth + (count-1) * 2 * gap;

    // Ajustar fuente si excede
    if (totalWidth > maxTotalWidth) {
      const ratio = (maxTotalWidth - (count-1)*2*gap) / (widths.reduce((a,b) => a + b, 0) + (count-1)*heartWidth);
      fontSize = Math.max(18, Math.floor(fontSize * ratio));
      widths = names.map(n => getTextWidth(ctx, n, fontSize));
      heartWidth = getTextWidth(ctx, heartChar, heartSize);
      totalWidth = widths.reduce((a,b) => a + b, 0) + (count-1) * heartWidth + (count-1) * 2 * gap;
    }

    // Dibujar nombres y corazones
    const startX = (canvas.width - totalWidth) / 2;
    let currentX = startX;

    for (let i = 0; i < count; i++) {
      drawTextWithBorder(ctx, names[i], currentX + widths[i]/2, nameY, fontSize, 'center');
      currentX += widths[i] + gap;

      if (i < count - 1) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${heartSize}px "Segoe UI", "Arial", sans-serif`;
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'black';
        ctx.fillText(heartChar, currentX + heartWidth/2, nameY);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ff6b81';
        ctx.fillText(heartChar, currentX + heartWidth/2, nameY);
        currentX += heartWidth + gap;
      }
    }

    // ========== TEXTO DE COMPATIBILIDAD ==========
    let compatibilityText = '';
    if (randomPercent >= 80) compatibilityText = '🔥 ¡Alma gemela!';
    else if (randomPercent >= 60) compatibilityText = '💕 Muy buena conexión';
    else if (randomPercent >= 40) compatibilityText = '🤔 Hay potencial';
    else if (randomPercent >= 20) compatibilityText = '😅 Amistad interesante';
    else compatibilityText = '💀 Mejor como amigos';

    drawTextWithBorder(ctx, compatibilityText, 400, 450, 28, 'center', 'bottom');

    // ========== PIE DE PÁGINA ==========
    ctx.font = '16px "Segoe UI", "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('Hecho por Plevark Ecosystem', 400, 490);
    ctx.shadowBlur = 0;

    // ========== BUFFER (JPEG = MÁS RÁPIDO) ==========
    const buffer = canvas.toBuffer('image/jpeg', 85);

    // ========== CAPTION ==========
    let captionText = '';
    if (count === 2) {
      captionText = `💕 *${names[0]}* y *${names[1]}* tienen un ${randomPercent}% de compatibilidad.`;
    } else {
      captionText = `💕 *${names[0]}*, *${names[1]}* y *${names[2]}* tienen un ${randomPercent}% de compatibilidad en conjunto.`;
    }

    await sock.sendMessage(msg.chat, {
      image: buffer,
      caption: captionText
    }, { quoted: msg });

    console.log(`✅ Ship complehr   rtado en ${Date.now() - startTime}ms`);
  }
};