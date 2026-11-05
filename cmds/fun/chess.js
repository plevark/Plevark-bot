import { createCanvas } from '@napi-rs/canvas';
import { Chess } from 'chess.js';
import fs from 'fs';

const FILE = './chess_games.json';
let games = new Map();

if (fs.existsSync(FILE)) {
  try {
    let data = JSON.parse(fs.readFileSync(FILE));
    for (let [k, v] of Object.entries(data)) {
      let chess = new Chess();
      chess.load(v.fen);
      games.set(k, { board: chess, difficulty: v.diff || 'medio', wins: v.w || 0, losses: v.l || 0, draws: v.d || 0 });
    }
  } catch (e) {
    console.error('Error cargando chess_games.json:', e.message);
  }
}

function saveGames() {
  let obj = {};
  for (let [k, v] of games.entries()) {
    obj[k] = { fen: v.board.fen(), diff: v.difficulty, w: v.wins, l: v.losses, d: v.draws };
  }
  fs.writeFileSync(FILE, JSON.stringify(obj));
}

// ========== VALORES DE PIEZAS ==========
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// ========== TABLAS DE POSICIÓN ==========
const PAWN_TABLE = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];
const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];
const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];
const ROOK_TABLE = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0]
];
const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];
const KING_MID_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];
const KING_END_TABLE = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];

const TABLES = { p: PAWN_TABLE, n: KNIGHT_TABLE, b: BISHOP_TABLE, r: ROOK_TABLE, q: QUEEN_TABLE };

// ========== EVALUACIÓN ==========
function evaluateBoard(chess) {
  const board = chess.board();
  let score = 0;
  let totalMaterial = 0;

  // Detectar si es final (para usar tabla de rey distinta)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type !== 'k' && p.type !== 'p') {
        totalMaterial += PIECE_VALUES[p.type];
      }
    }
  }
  const isEndgame = totalMaterial < 1500;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const value = PIECE_VALUES[piece.type];
      let positional = 0;

      if (piece.type === 'k') {
        const table = isEndgame ? KING_END_TABLE : KING_MID_TABLE;
        positional = piece.color === 'w' ? table[row][col] : table[7 - row][col];
      } else {
        const table = TABLES[piece.type];
        if (table) {
          positional = piece.color === 'w' ? table[row][col] : table[7 - row][col];
        }
      }

      score += piece.color === 'w' ? value + positional : -(value + positional);
    }
  }

  // Bonificación por movilidad
  const turn = chess.turn();
  const moves = chess.moves().length;
  score += turn === 'w' ? moves * 3 : -moves * 3;

  // 🔥 Bonus por jaque
  if (chess.isCheck()) {
    score += turn === 'w' ? -30 : 30; // Si blancas están en jaque, malo para blancas
  }

  return score;
}

// ========== MINIMAX CON ALPHA-BETA ==========
function minimax(chess, depth, alpha, beta, isMaximizing, startTime, maxTime) {
  if (Date.now() - startTime > maxTime) {
    return evaluateBoard(chess);
  }

  if (chess.isCheckmate()) {
    // El bando que da mate gana. isMaximizing=true significa que es turno de blancas.
    // Si hay mate y es turno de blancas, blancas perdieron → malo para maximizing
    return isMaximizing ? (-100000 + (100 - depth)) : (100000 - (100 - depth));
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }
  if (depth === 0) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return evaluateBoard(chess);

  // Ordenar movimientos
  moves.sort((a, b) => {
    const aScore = (a.captured ? PIECE_VALUES[a.captured] * 10 : 0) + (a.promotion ? 8000 : 0);
    const bScore = (b.captured ? PIECE_VALUES[b.captured] * 10 : 0) + (b.promotion ? 8000 : 0);
    return bScore - aScore;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false, startTime, maxTime);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true, startTime, maxTime);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// ========== OBTENER MEJOR MOVIMIENTO (CORREGIDO) ==========
function getBestMove(chess, maxDepth, maxTime = 5000) {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Ordenar movimientos (capturas primero)
  moves.sort((a, b) => {
    const aScore = (a.captured ? PIECE_VALUES[a.captured] * 10 : 0) + (a.promotion ? 8000 : 0);
    const bScore = (b.captured ? PIECE_VALUES[b.captured] * 10 : 0) + (b.promotion ? 8000 : 0);
    return bScore - aScore;
  });

  const turnoBot = chess.turn(); // 'b' o 'w'
  const botEsNegras = turnoBot === 'b'; // El bot normalmente juega como negras

  const startTime = Date.now();
  let bestMove = moves[0];
  
  // 🔥 Si el bot es NEGRAS → quiere MINIMIZAR el score (score positivo = blancas ganan)
  // 🔥 Si el bot es BLANCAS → quiere MAXIMIZAR
  let bestValue = botEsNegras ? Infinity : -Infinity;

  // Iterative deepening
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (Date.now() - startTime > maxTime) {
      console.log(`  ⏱️ Timeout en profundidad ${depth}`);
      break;
    }

    let currentBestMove = bestMove;
    let currentBestValue = botEsNegras ? Infinity : -Infinity;

    for (const move of moves) {
      if (Date.now() - startTime > maxTime) break;

      chess.move(move);
      // Después del movimiento del bot, es turno del rival
      const rivalEsMax = turnoBot === 'b'; // Si bot es negras, blancas (rival) maximiza
      const value = minimax(chess, depth - 1, -Infinity, Infinity, rivalEsMax, startTime, maxTime);
      chess.undo();

      if (botEsNegras) {
        // Bot negras → quiere minimizar (bueno para negras = score bajo)
        if (value < currentBestValue) {
          currentBestValue = value;
          currentBestMove = move;
        }
      } else {
        // Bot blancas → quiere maximizar
        if (value > currentBestValue) {
          currentBestValue = value;
          currentBestMove = move;
        }
      }
    }

    bestMove = currentBestMove;
    bestValue = currentBestValue;
    console.log(`  📊 Profundidad ${depth}: ${Date.now() - startTime}ms | bestValue: ${bestValue}`);
  }

  return bestMove;
}

// ========== MOVIMIENTO DEL BOT ==========
function getBotMove(chess, difficulty) {
  const start = Date.now();

  if (difficulty === 'imposible') {
    const move = getBestMove(chess, 5, 8000); // Profundidad 5, 8 segundos
    console.log(`💀 Bot imposible pensó en ${Date.now() - start}ms`);
    return move;
  }

  if (difficulty === 'dificil' || difficulty === 'difícil') {
    const move = getBestMove(chess, 4, 5000);
    console.log(`🔥 Bot difícil pensó en ${Date.now() - start}ms`);
    return move;
  }

  if (difficulty === 'medio') {
    if (Math.random() < 0.8) {
      const move = getBestMove(chess, 3, 3000);
      console.log(`⚔️ Bot medio pensó en ${Date.now() - start}ms`);
      return move;
    }
  }

  const moves = chess.moves({ verbose: true });
  const move = moves[Math.floor(Math.random() * moves.length)];
  console.log(`😊 Bot fácil movió en ${Date.now() - start}ms`);
  return move;
}

// ========== COMANDO PRINCIPAL ==========
export default {
  command: ['chess', 'ajedrez'],
  category: 'game',

  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat;
    console.log(`♟️ CHESS: args=[${args.join(', ')}] | chat=${chatId}`);

    if (args[0] === 'dificultad' || args[0] === 'difficulty' || args[0] === 'diff') {
      const nivel = args[1]?.toLowerCase();
      const niveles = ['facil', 'fácil', 'medio', 'dificil', 'difícil', 'imposible'];

      if (!nivel || !niveles.includes(nivel)) {
        return msg.reply(`🎮 *Niveles:*\n▸ facil 😊\n▸ medio ⚔️\n▸ dificil 🔥\n▸ imposible 💀\n\n*Uso:* !chess new imposible`);
      }

      if (!games.has(chatId)) {
        games.set(chatId, { board: new Chess(), difficulty: nivel, wins: 0, losses: 0, draws: 0 });
      } else {
        games.get(chatId).difficulty = nivel;
      }
      saveGames();

      return msg.reply(`✅ *Dificultad:* ${nivel.toUpperCase()}`);
    }

    if (args[0] === 'undo') {
      if (!games.has(chatId)) return msg.reply('❌ No hay partida');
      let game = games.get(chatId);
      try {
        game.board.undo();
        game.board.undo();
      } catch {}
      saveGames();
      return sendBoard(sock, msg, game, 'Jugada deshecha');
    }

    if (args[0] === 'new' || !games.has(chatId)) {
      let nuevaDiff = 'medio';

      if (args[1]) {
        const nivel = args[1].toLowerCase();
        const niveles = ['facil', 'fácil', 'medio', 'dificil', 'difícil', 'imposible'];
        if (niveles.includes(nivel)) nuevaDiff = nivel;
      } else if (games.has(chatId)) {
        nuevaDiff = games.get(chatId).difficulty;
      }

      games.set(chatId, { board: new Chess(), difficulty: nuevaDiff, wins: 0, losses: 0, draws: 0 });
      saveGames();

      if (nuevaDiff === 'imposible') {
        await msg.reply(`💀 *MODO IMPOSIBLE ACTIVADO*\n\nLa IA piensa hasta 8 segundos por jugada.\n\n⚠️ *Prepárate para perder.*`);
      } else if (nuevaDiff === 'dificil' || nuevaDiff === 'difícil') {
        await msg.reply(`🔥 *Modo difícil activado*`);
      }

      return sendBoard(sock, msg, games.get(chatId));
    }

    let game = games.get(chatId);
    let chess = game.board;

    if (args[0] === 'move') {
      if (!args[1] || !args[2]) {
        return msg.reply('❌ Uso: *!chess move e2 e4*');
      }

      try {
        chess.move({ from: args[1].toLowerCase(), to: args[2].toLowerCase(), promotion: 'q' });
        console.log(`✅ Movimiento: ${args[1]} → ${args[2]}`);
      } catch (e) {
        console.log(`❌ Inválido: ${e.message}`);
        return msg.reply('❌ Movimiento inválido. Ej: *!chess move e2 e4*');
      }

      if (!chess.isGameOver()) {
        console.log(`🤖 Bot pensando (${game.difficulty})...`);
        let botMove = getBotMove(chess, game.difficulty);
        if (botMove) {
          chess.move(botMove);
          console.log(`✅ Bot: ${botMove.from} → ${botMove.to}`);
        }
      }

      if (chess.isGameOver()) {
        let resultado = 'empate';

        if (chess.isCheckmate()) {
          if (chess.turn() === 'w') {
            game.losses++;
            resultado = 'derrota';
          } else {
            game.wins++;
            resultado = 'victoria';
          }
        } else {
          game.draws++;
        }

        saveGames();
        games.delete(chatId);

        const nombre = msg.pushName || 'Jugador';
        const imageBuffer = await generarImagenResultado(resultado, nombre);

        let titulo = resultado === 'victoria' ? '¡VICTORIA!' : resultado === 'derrota' ? 'DERROTA' : 'EMPATE';
        let emoji = resultado === 'victoria' ? '🏆' : resultado === 'derrota' ? '💀' : '🤝';

        await sock.sendMessage(chatId, {
          image: imageBuffer,
          caption: `${emoji} *${titulo}*\n\n👤 *Jugador:* ${nombre}\n📈 *Wins:* ${game.wins} | *Losses:* ${game.losses} | *Draws:* ${game.draws}\n\n*Escribe !chess new para jugar otra vez*`
        }, { quoted: msg });

        return;
      }

      saveGames();
    }

    return sendBoard(sock, msg, game);
  }
};

// ========== GENERAR IMAGEN DE RESULTADO ==========
async function generarImagenResultado(resultado, nombre) {
  const canvas = createCanvas(700, 400);
  const ctx = canvas.getContext('2d');

  let color1, color2, emoji, titulo, subtitulo;
  if (resultado === 'victoria') {
    color1 = '#FFD700'; color2 = '#FF8C00'; emoji = '🏆';
    titulo = '¡VICTORIA!'; subtitulo = '¡Jaque mate, campeón!';
  } else if (resultado === 'derrota') {
    color1 = '#8B0000'; color2 = '#FF0000'; emoji = '💀';
    titulo = 'DERROTA'; subtitulo = 'El bot te ha ganado...';
  } else {
    color1 = '#4A4A4A'; color2 = '#808080'; emoji = '🤝';
    titulo = 'EMPATE'; subtitulo = 'Tablas, buen juego';
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.1;
  const sqSize = 50;
  for (let x = 0; x < canvas.width; x += sqSize) {
    for (let y = 0; y < canvas.height; y += sqSize) {
      if ((x / sqSize + y / sqSize) % 2 === 0) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, sqSize, sqSize);
      }
    }
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 8;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  ctx.font = 'bold 130px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 15;
  ctx.fillText(emoji, canvas.width / 2, 140);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 60px "Segoe UI", "Arial", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.strokeText(titulo, canvas.width / 2, 250);
  ctx.fillText(titulo, canvas.width / 2, 250);

  ctx.font = 'bold 22px "Segoe UI", "Arial", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.fillText(subtitulo, canvas.width / 2, 300);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 18px "Segoe UI", "Arial", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(`— ${nombre} —`, canvas.width / 2, 345);

  ctx.font = '14px "Segoe UI", "Arial", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('Plevark Ecosystem', canvas.width / 2, 375);

  return canvas.toBuffer('image/png');
}

// ========== TABLERO ==========
async function sendBoard(sock, msg, game, extra = '') {
  let chess = game.board;
  const boardSize = 640;
  const coordSize = 30;
  const radius = 22;
  const size = boardSize + coordSize * 2;

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const sq = boardSize / 8;
  const offset = coordSize;

  ctx.fillStyle = '#1a1a1a';
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fill();

  const light = '#eeeed2';
  const dark = '#769656';

  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;
  roundRect(ctx, offset - 5, offset - 5, boardSize + 10, boardSize + 10, radius);
  ctx.fill();
  ctx.shadowBlur = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? light : dark;
      ctx.fillRect(col * sq + offset, row * sq + offset, sq, sq);
    }
  }

  ctx.fillStyle = '#aaaaaa';
  ctx.font = 'bold 16px "Segoe UI"';
  ctx.textAlign = 'center';
  const letras = 'abcdefgh';
  for (let i = 0; i < 8; i++) {
    ctx.fillText(8 - i, offset / 2, i * sq + offset + sq / 2);
    ctx.fillText(letras[i], i * sq + offset + sq / 2, size - offset / 2);
  }

  ctx.font = 'bold 62px "Segoe UI Symbol"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      let piece = board[row][col];
      if (piece) {
        let x = col * sq + offset + sq / 2;
        let y = row * sq + offset + sq / 2;

        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;

        if (piece.color === 'w') {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1.8;
          ctx.strokeText(getPieceChar(piece), x, y);
          ctx.fillText(getPieceChar(piece), x, y);
        } else {
          ctx.fillStyle = '#4a4a4a';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1.8;
          ctx.strokeText(getPieceChar(piece), x, y);
          ctx.fillText(getPieceChar(piece), x, y);
        }
        ctx.shadowBlur = 0;
      }
    }
  }

  const buffer = canvas.toBuffer('image/png');
  const diffEmoji = game.difficulty === 'imposible' ? '💀' : (game.difficulty === 'dificil' || game.difficulty === 'difícil') ? '🔥' : game.difficulty === 'medio' ? '⚔️' : '😊';
  let turn = chess.isCheck()
    ? `🔥 JAQUE! Turno: ${chess.turn() === 'w' ? 'BLANCAS' : 'NEGRAS'}`
    : `Turno: ${chess.turn() === 'w' ? 'BLANCAS' : 'NEGRAS'}`;

  await sock.sendMessage(msg.chat, {
    image: buffer,
    caption: `*WABOT*\n*CHESS* ${diffEmoji} ${game.difficulty.toUpperCase()}\nWINS: ${game.wins} LOSSES: ${game.losses} DRAWS: ${game.draws}\n\n${turn}\n\n*Para mover:* !chess move e2 e4\n*Cambiar dificultad:* !chess new imposible\n${extra}`,
    footer: 'YOUR MOVE',
    buttons: [
      { buttonId: '!chess new', buttonText: { displayText: 'NEW GAME' }, type: 1 },
      { buttonId: '!chess undo', buttonText: { displayText: 'UNDO' }, type: 1 }
    ],
    headerType: 4
  }, { quoted: msg });
}

function getPieceChar(piece) {
  const map = {
    'w': { 'p': '♙', 'n': '♘', 'b': '♗', 'r': '♖', 'q': '♕', 'k': '♔' },
    'b': { 'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚' }
  };
  return map[piece.color][piece.type];
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}