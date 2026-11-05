import db from "#db";
import { createCanvas } from "canvas";

const MAX_JUGADORES = 10;
const MIN_JUGADORES = 2;
const COLORES = ["rojo", "azul", "verde", "amarillo"];
const COLORES_HEX = { rojo: "#e74c3c", azul: "#2980b9", verde: "#27ae60", amarillo: "#f1c40f", negro: "#2c3e50" };
const COLORES_EMOJI = { rojo: "🟥", azul: "🟦", verde: "🟩", amarillo: "🟨", negro: "⬛" };

function crearMazo() {
  let mazo = [];
  for (const color of COLORES) {
    mazo.push({ color, valor: "0", id: `${color}_0_0` });
    for (let n = 1; n <= 9; n++) {
      mazo.push({ color, valor: `${n}`, id: `${color}_${n}_1` });
      mazo.push({ color, valor: `${n}`, id: `${color}_${n}_2` });
    }
    for (let i = 0; i < 2; i++) {
      mazo.push({ color, valor: "salto", id: `${color}_salto_${i}` });
      mazo.push({ color, valor: "reversa", id: `${color}_reversa_${i}` });
      mazo.push({ color, valor: "+2", id: `${color}_+2_${i}` });
    }
  }
  for (let i = 0; i < 4; i++) {
    mazo.push({ color: "negro", valor: "+4", id: `negro_+4_${i}` });
    mazo.push({ color: "negro", valor: "comodin", id: `negro_comodin_${i}` });
  }
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  return mazo;
}
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
function cartaToString(c) { return `${COLORES_EMOJI[c.color] || "⬜"} ${c.color.toUpperCase()} ${c.valor.toUpperCase()}`; }
function puedeTirar(carta, tope, colorActual) { if (carta.color === "negro") return true; if (carta.color === colorActual) return true; if (carta.valor === tope.valor) return true; return false; }

// ===== CANVA PROFESIONAL =====
async function generarTableroUNO(game) {
  const W = 1000, H = 650;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Fondo mesa casino - gradiente radial
  const grad = ctx.createRadialGradient(W/2, H/2, 100, W/2, H/2, 800);
  grad.addColorStop(0, "#1a8a4a");
  grad.addColorStop(1, "#0a4d2a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Borde madera
  ctx.strokeStyle = "#5d3a1a";
  ctx.lineWidth = 16;
  ctx.strokeRect(0, 0, W, H);
  ctx.strokeStyle = "#8d5e2b";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, W-32, H-32);

  // Header superior
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  roundRect(ctx, 20, 20, W-40, 60, 12, true);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 26px Sans";
  ctx.fillText(`UNO • ${game.players.length} JUGADORES • MAZO: ${game.deck.length}`, 35, 58);
  ctx.font = "bold 16px Sans";
  ctx.fillStyle = "#f1c40f";
  ctx.fillText(`TURNO: ${game.nombres[game.players[game.turnIndex]]?.toUpperCase() || game.players[game.turnIndex].split("@")[0]}`, W-280, 58);

  // Centro - mazo y descarte
  const centerX = W/2, centerY = H/2 + 20;

  // Sombra mazo
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  roundRect(ctx, centerX - 170, centerY - 90, 120, 180, 12, true);
  // Mazo boca abajo (dorso)
  ctx.fillStyle = "#2c3e50";
  roundRect(ctx, centerX - 175, centerY - 95, 120, 180, 12, true);
  ctx.fillStyle = "#34495e";
  roundRect(ctx, centerX - 170, centerY - 90, 110, 170, 10, true);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 36px Sans";
  ctx.fillText("UNO", centerX - 145, centerY + 10);
  ctx.font = "12px Sans";
  ctx.fillText(`${game.deck.length}`, centerX - 125, centerY + 30);

  // Sombra descarte
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  roundRect(ctx, centerX + 55, centerY - 90, 120, 180, 12, true);

  // Carta tope - PROFESIONAL
  const tope = game.discard[game.discard.length - 1];
  if (tope) {
    const x = centerX + 50, y = centerY - 95;
    // Borde blanco carta
    ctx.fillStyle = "#fff";
    roundRect(ctx, x, y, 120, 180, 12, true);
    // Interior color
    ctx.fillStyle = COLORES_HEX[tope.color] || "#2c3e50";
    roundRect(ctx, x+6, y+6, 108, 168, 8, true);
    
    // Valor grande centro
    ctx.fillStyle = "#fff";
    ctx.font = "bold 52px Sans";
    ctx.textAlign = "center";
    const valorTxt = tope.valor === "comodin" ? "★" : tope.valor === "salto" ? "⊘" : tope.valor === "reversa" ? "⇄" : tope.valor.toUpperCase();
    ctx.fillText(valorTxt, x+60, y+105);
    
    // Esquina superior
    ctx.font = "bold 18px Sans";
    ctx.textAlign = "left";
    ctx.fillText(valorTxt, x+14, y+28);
    // Esquina inferior invertida
    ctx.save();
    ctx.translate(x+108, y+160);
    ctx.rotate(Math.PI);
    ctx.fillText(valorTxt, 8, 8);
    ctx.restore();
    
    // Circulo blanco central (como carta UNO real)
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.ellipse(x+60, y+90, 38, 48, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // Indicador color actual - circulo grande
  const colorActual = game.colorActual;
  const cx = centerX - 10, cy = centerY + 140;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = COLORES_HEX[colorActual] || "#fff";
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px Sans";
  ctx.textAlign = "center";
  ctx.fillText(colorActual.toUpperCase(), cx, cy+4);
  ctx.textAlign = "left";

  // Jugadores - abajo tipo casino
  const startY = H - 140;
  const cardW = Math.min(150, (W - 60) / game.players.length - 10);
  game.players.forEach((jid, i) => {
    const x = 30 + i * (cardW + 10);
    const y = startY;
    const isTurn = i === game.turnIndex;
    const cartasCount = game.manos[jid]?.length || 0;
    const nombre = (game.nombres[jid] || jid.split("@")[0]).slice(0, 12);

    // Fondo jugador
    ctx.fillStyle = isTurn ? "#f1c40f" : "rgba(0,0,0,0.55)";
    roundRect(ctx, x, y, cardW, 90, 10, true);
    
    if (isTurn) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      roundRect(ctx, x, y, cardW, 90, 10, false);
    }

    ctx.fillStyle = isTurn ? "#000" : "#fff";
    ctx.font = isTurn ? "bold 13px Sans" : "11px Sans";
    ctx.fillText(isTurn ? `▶ ${nombre}` : nombre, x+8, y+20);
    
    ctx.font = "bold 20px Sans";
    ctx.fillText(`🃏 ${cartasCount}`, x+8, y+50);
    
    ctx.font = "10px Sans";
    ctx.fillStyle = isTurn ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)";
    ctx.fillText(isTurn ? "TURNO" : cartasCount === 1 ? "¡UNO!" : "", x+8, y+70);
  });

  // Footer direccion
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "13px Sans";
  ctx.fillText(`Dirección: ${game.direccion === 1 ? "Horario ↻" : "Antihorario ↺"} | Descarte: ${game.discard.length} | ${new Date().toLocaleTimeString()}`, 30, H-12);

  return canvas.toBuffer("image/png");
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  if (fill) ctx.fill(); else ctx.stroke();
}

async function enviarManoPrivada(sock, playerJid, mano, colorActual, tope) {
  let texto = `🃏 *TUS CARTAS - UNO* 🔒\n*Solo tú puedes ver este mensaje*\n\n`;
  texto += `Mesa: ${cartaToString(tope)} | Color actual: ${colorActual.toUpperCase()} ${COLORES_EMOJI[colorActual] || ""}\n`;
  texto += `━━━━━━━━━━━━━━━━━━━━\n`;
  mano.forEach((c, idx) => {
    texto += `${idx + 1} › ${cartaToString(c)} | *!uno tirar ${idx+1}*\n`;
  });
  texto += `━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `Tirar: *!uno tirar <num>* o *!uno tirar <color> <valor>*\nEj: !uno tirar 2 | !uno tirar rojo +2 | !uno tirar +4 azul`;

  // DM PRIVADO - solo el jugador ve esto, el rival NO
  try {
    await sock.sendMessage(playerJid, { text: texto });
  } catch (e) {
    console.log(`DM fallo a ${playerJid}`);
  }
}

export default {
  command: ['uno'],
  category: 'juegos',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat;
    const sender = msg.sender;
    const chat = await db.getChat(chatId);
    const sub = args[0]?.toLowerCase() || "help";

    if (!chat.uno) chat.uno = null;

    if (sub === "help" || sub === "ayuda") {
      return msg.reply(
`🎮 *UNO PROFESIONAL - CANVA*

» *!uno create* - Crear sala (solo host inicia)
» *!uno join* - Unirse (2-10 jug)
» *!uno start* - Iniciar (solo host)
» *!uno ver* - Ver TUS cartas en privado (solo tú las ves, rival no)
» *!uno tirar 3* o *!uno tirar rojo 7* o *!uno tirar +4 azul*
» *!uno robar* - Robar carta
» *!uno tabla* - Ver mesa profesional
» *!uno terminar* - Terminar (solo host)

🔒 Tus cartas solo se envían a TU privado, nadie más las ve.`
      );
    }

    if (sub === "create" || sub === "crear") {
      if (chat.uno && chat.uno.status !== "finalizado") return msg.reply(`❌ Ya hay partida ${chat.uno.status === "waiting" ? "esperando" : "en curso"}. Host: @${chat.uno.creator.split("@")[0]}`, { mentions: [chat.uno.creator] });
      const nombre = (await db.getUser(sender))?.name || sender.split("@")[0];
      chat.uno = { status: "waiting", creator: sender, players: [sender], nombres: { [sender]: nombre }, turnIndex: 0, direccion: 1, deck: [], discard: [], manos: {}, colorActual: null, createdAt: Date.now() };
      await db.updateChat(chatId, 'uno', chat.uno);
      return sock.sendMessage(chatId, { text: `✅ *SALA UNO CREADA* 🎴\nHost: @${sender.split("@")[0]}\n\n👥 1/${MAX_JUGADORES}\n➥ @${sender.split("@")[0]}\n\nOtros: *!uno join*\nHost: *!uno start* (min ${MIN_JUGADORES})`, mentions: [sender] }, { quoted: msg });
    }

    if (sub === "join" || sub === "unirse") {
      if (!chat.uno || chat.uno.status !== "waiting") return msg.reply(`No hay sala. *!uno create*`);
      if (chat.uno.players.includes(sender)) return msg.reply(`Ya estás en la sala.`);
      if (chat.uno.players.length >= MAX_JUGADORES) return msg.reply(`Sala llena (${MAX_JUGADORES})`);
      const nombre = (await db.getUser(sender))?.name || sender.split("@")[0];
      chat.uno.players.push(sender);
      chat.uno.nombres[sender] = nombre;
      await db.updateChat(chatId, 'uno', chat.uno);
      const lista = chat.uno.players.map(j => `➥ @${j.split("@")[0]}`).join("\n");
      return sock.sendMessage(chatId, { text: `✅ @${sender.split("@")[0]} se unió!\n\n👥 ${chat.uno.players.length}/${MAX_JUGADORES}\n${lista}\n\nEsperando host: *!uno start*`, mentions: chat.uno.players }, { quoted: msg });
    }

    if (sub === "salir" || sub === "leave") {
      if (!chat.uno) return msg.reply(`No hay partida.`);
      if (!chat.uno.players.includes(sender)) return msg.reply(`No estás.`);
      if (chat.uno.status !== "waiting") return msg.reply(`En curso no se puede salir. Host: *!uno terminar*`);
      chat.uno.players = chat.uno.players.filter(j => j !== sender);
      delete chat.uno.nombres[sender];
      if (chat.uno.players.length === 0) chat.uno = null;
      await db.updateChat(chatId, 'uno', chat.uno);
      return msg.reply(`Saliste.`);
    }

    if (sub === "terminar" || sub === "end") {
      if (!chat.uno) return msg.reply(`No hay partida.`);
      if (chat.uno.creator !== sender) return msg.reply(`Solo host @${chat.uno.creator.split("@")[0]} puede terminar.`, { mentions: [chat.uno.creator] });
      chat.uno = null;
      await db.updateChat(chatId, 'uno', chat.uno);
      return msg.reply(`🛑 Partida terminada por host.`);
    }

    if (sub === "start" || sub === "iniciar") {
      if (!chat.uno) return msg.reply(`No hay sala.`);
      if (chat.uno.creator !== sender) return msg.reply(`Solo host puede iniciar.`);
      if (chat.uno.status !== "waiting") return msg.reply(`Ya inició.`);
      if (chat.uno.players.length < MIN_JUGADORES) return msg.reply(`Mínimo ${MIN_JUGADORES}. Ahora: ${chat.uno.players.length}`);

      const mazo = crearMazo();
      chat.uno.deck = mazo;
      chat.uno.manos = {};
      chat.uno.discard = [];
      for (const p of chat.uno.players) {
        chat.uno.manos[p] = [];
        for (let i = 0; i < 7; i++) chat.uno.manos[p].push(chat.uno.deck.pop());
      }
      let primera;
      do { primera = chat.uno.deck.pop(); } while (primera.color === "negro");
      chat.uno.discard.push(primera);
      chat.uno.colorActual = primera.color;
      chat.uno.status = "playing";
      chat.uno.turnIndex = 0;
      await db.updateChat(chatId, 'uno', chat.uno);

      for (const p of chat.uno.players) {
        await enviarManoPrivada(sock, p, chat.uno.manos[p], chat.uno.colorActual, primera);
      }

      try {
        const buffer = await generarTableroUNO(chat.uno);
        await sock.sendMessage(chatId, { image: buffer, caption: `🎮 *UNO INICIADO* 🎴\n\nMesa: ${cartaToString(primera)}\nColor: ${chat.uno.colorActual.toUpperCase()} ${COLORES_EMOJI[chat.uno.colorActual]}\nTurno: @${chat.uno.players[0].split("@")[0]}\n\n🔒 Cartas enviadas al PRIVADO de cada uno (solo ustedes ven las suyas, rival NO las ve)\n\n*!uno ver* para ver de nuevo | *!uno tirar 1* para jugar`, mentions: chat.uno.players }, { quoted: msg });
      } catch (e) {
        console.error(e);
        await sock.sendMessage(chatId, { text: `UNO INICIADO - Mesa: ${cartaToString(primera)} Turno @${chat.uno.players[0].split("@")[0]}`, mentions: chat.uno.players }, { quoted: msg });
      }
      return;
    }

    if (sub === "ver" || sub === "mano") {
      if (!chat.uno || chat.uno.status !== "playing") return msg.reply(`No hay partida.`);
      if (!chat.uno.players.includes(sender)) return msg.reply(`No estás en partida.`);
      const tope = chat.uno.discard[chat.uno.discard.length - 1];
      await enviarManoPrivada(sock, sender, chat.uno.manos[sender], chat.uno.colorActual, tope);
      return msg.reply(`✅ @${sender.split("@")[0]} te envié TUS cartas al privado 🔒 (solo tú las ves, tu rival NO)`, { mentions: [sender] });
    }

    if (sub === "tabla" || sub === "mesa" || sub === "board") {
      if (!chat.uno || chat.uno.status !== "playing") return msg.reply(`No hay partida.`);
      try {
        const buffer = await generarTableroUNO(chat.uno);
        const tope = chat.uno.discard[chat.uno.discard.length - 1];
        await sock.sendMessage(chatId, { image: buffer, caption: `Mesa: ${cartaToString(tope)} | Color: ${chat.uno.colorActual.toUpperCase()} | Turno: @${chat.uno.players[chat.uno.turnIndex].split("@")[0]}`, mentions: chat.uno.players }, { quoted: msg });
      } catch (e) { return msg.reply(`Error: ${e.message}`); }
      return;
    }

    if (sub === "tirar" || sub === "jugar" || sub === "play") {
      if (!chat.uno || chat.uno.status !== "playing") return msg.reply(`No hay partida.`);
      if (!chat.uno.players.includes(sender)) return msg.reply(`No estás en partida.`);
      const turnoActual = chat.uno.players[chat.uno.turnIndex];
      if (turnoActual !== sender) return msg.reply(`No es tu turno. Turno de @${turnoActual.split("@")[0]}`, { mentions: [turnoActual] });

      const mano = chat.uno.manos[sender];
      const tope = chat.uno.discard[chat.uno.discard.length - 1];
      const input = args.slice(1).join(" ").toLowerCase().trim();
      if (!input) { await enviarManoPrivada(sock, sender, mano, chat.uno.colorActual, tope); return msg.reply(`Usa *!uno tirar <numero>* Ej: !uno tirar 3`); }

      let cartaIdx = -1;
      const numIdx = parseInt(args[1]);
      if (!isNaN(numIdx) && args.length === 2) { if (numIdx >= 1 && numIdx <= mano.length) cartaIdx = numIdx - 1; }
      else {
        let colorBuscado = null, valorBuscado = null;
        for (const c of COLORES.concat(["negro"])) if (input.includes(c)) colorBuscado = c;
        const posibles = ["0","1","2","3","4","5","6","7","8","9","+2","+4","salto","reversa","comodin"];
        for (const v of posibles) if (input.includes(v)) valorBuscado = v;
        mano.forEach((c, i) => {
          if (cartaIdx !== -1) return;
          if (valorBuscado && colorBuscado) { if (c.valor === valorBuscado && c.color === colorBuscado) cartaIdx = i; }
          else if (valorBuscado) { if (c.valor === valorBuscado) cartaIdx = i; }
          else if (colorBuscado) { if (c.color === colorBuscado) cartaIdx = i; }
        });
      }

      if (cartaIdx === -1) { await enviarManoPrivada(sock, sender, mano, chat.uno.colorActual, tope); return msg.reply(`No encontré esa carta. *!uno ver* y usa el número. Ej: !uno tirar 2`); }

      const carta = mano[cartaIdx];
      if (!puedeTirar(carta, tope, chat.uno.colorActual)) return msg.reply(`No puedes tirar ${cartaToString(carta)} sobre ${cartaToString(tope)} color actual ${chat.uno.colorActual}`);

      mano.splice(cartaIdx, 1);
      chat.uno.discard.push(carta);

      if (carta.color !== "negro") {
        chat.uno.colorActual = carta.color;
      } else {
        let nuevoColor = null;
        for (const col of COLORES) if (args.join(" ").toLowerCase().includes(col)) nuevoColor = col;
        if (!nuevoColor) {
          mano.push(carta); chat.uno.discard.pop();
          return msg.reply(`Elige color para +4/comodin. Ej: *!uno tirar +4 azul*`);
        }
        chat.uno.colorActual = nuevoColor;
      }

      let roba = 0, salta = false;
      if (carta.valor === "+2") roba = 2;
      if (carta.valor === "+4") roba = 4;
      if (carta.valor === "salto") salta = true;
      if (carta.valor === "reversa") { if (chat.uno.players.length === 2) salta = true; else chat.uno.direccion *= -1; }

      if (mano.length === 0) {
        try {
          const buffer = await generarTableroUNO(chat.uno);
          await sock.sendMessage(chatId, { image: buffer, caption: `🏆 *¡GANÓ @${sender.split("@")[0]}!* Tiró ${cartaToString(carta)}\n¡Partida terminada!`, mentions: [sender] }, { quoted: msg });
        } catch { await sock.sendMessage(chatId, { text: `🏆 ¡GANÓ @${sender.split("@")[0]}!`, mentions: [sender] }, { quoted: msg }); }
        chat.uno = null;
        await db.updateChat(chatId, 'uno', chat.uno);
        return;
      }

      let nextIdx = chat.uno.turnIndex;
      const nextPlayer = () => { nextIdx = (nextIdx + chat.uno.direccion + chat.uno.players.length) % chat.uno.players.length; return nextIdx; };
      nextIdx = nextPlayer();
      if (salta) nextIdx = nextPlayer();

      if (roba > 0) {
        const victimaIdx = nextIdx;
        const victimaJid = chat.uno.players[victimaIdx];
        for (let i = 0; i < roba; i++) {
          if (chat.uno.deck.length === 0) { const topeActual = chat.uno.discard.pop(); chat.uno.deck = shuffle(chat.uno.discard); chat.uno.discard = [topeActual]; }
          chat.uno.manos[victimaJid].push(chat.uno.deck.pop());
        }
        await sock.sendMessage(chatId, { text: `😈 @${victimaJid.split("@")[0]} roba ${roba} por ${carta.valor}!`, mentions: [victimaJid] }, { quoted: msg });
        await enviarManoPrivada(sock, victimaJid, chat.uno.manos[victimaJid], chat.uno.colorActual, carta);
      }

      chat.uno.turnIndex = nextIdx;
      if (chat.uno.deck.length < 5) { const topeActual = chat.uno.discard.pop(); chat.uno.deck = shuffle([...chat.uno.deck, ...chat.uno.discard]); chat.uno.discard = [topeActual]; }
      await db.updateChat(chatId, 'uno', chat.uno);

      const siguienteJid = chat.uno.players[chat.uno.turnIndex];
      try {
        const buffer = await generarTableroUNO(chat.uno);
        await sock.sendMessage(chatId, { image: buffer, caption: `✅ @${sender.split("@")[0]} tiró ${cartaToString(carta)}\nColor: ${chat.uno.colorActual.toUpperCase()} ${COLORES_EMOJI[chat.uno.colorActual]}\n\nTurno de @${siguienteJid.split("@")[0]} (${chat.uno.manos[siguienteJid].length} cartas)`, mentions: [sender, siguienteJid] }, { quoted: msg });
      } catch { await sock.sendMessage(chatId, { text: `✅ @${sender.split("@")[0]} tiró ${cartaToString(carta)} | Turno @${siguienteJid.split("@")[0]}`, mentions: [sender, siguienteJid] }, { quoted: msg }); }

      await enviarManoPrivada(sock, siguienteJid, chat.uno.manos[siguienteJid], chat.uno.colorActual, carta);
      return;
    }

    if (sub === "robar" || sub === "draw") {
      if (!chat.uno || chat.uno.status !== "playing") return;
      const turnoActual = chat.uno.players[chat.uno.turnIndex];
      if (turnoActual !== sender) return msg.reply(`No es tu turno.`);
      if (chat.uno.deck.length === 0) { const topeActual = chat.uno.discard.pop(); chat.uno.deck = shuffle(chat.uno.discard); chat.uno.discard = [topeActual]; }
      const cartaRobada = chat.uno.deck.pop();
      chat.uno.manos[sender].push(cartaRobada);
      chat.uno.turnIndex = (chat.uno.turnIndex + chat.uno.direccion + chat.uno.players.length) % chat.uno.players.length;
      await db.updateChat(chatId, 'uno', chat.uno);
      const tope = chat.uno.discard[chat.uno.discard.length - 1];
      await enviarManoPrivada(sock, sender, chat.uno.manos[sender], chat.uno.colorActual, tope);
      return sock.sendMessage(chatId, { text: `🃏 @${sender.split("@")[0]} robó y pasó. Turno @${chat.uno.players[chat.uno.turnIndex].split("@")[0]}`, mentions: [sender, chat.uno.players[chat.uno.turnIndex]] }, { quoted: msg });
    }

    return msg.reply(`Usa *!uno help*`);
  }
};