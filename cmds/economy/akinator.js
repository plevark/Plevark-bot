import db from "#db";
import { Aki } from 'aki-api';

// 🔥 Estados del juego para cada usuario
const games = {};

// 🔥 Función para generar barra de progreso
function generarBarraProgreso(progreso) {
  const total = 10;
  const llenos = Math.floor((progreso / 100) * total);
  const vacios = total - llenos;
  return `[${'█'.repeat(llenos)}${'░'.repeat(vacios)}] ${Math.round(progreso)}%`;
}

// 🔥 Función para manejar respuestas
async function handleAnswer(msg, sock, args, usedPrefix) {
  const sender = msg.sender;

  if (!games[sender]) {
    return msg.reply(`《✧》 No tienes una partida activa.\nInicia una con *${usedPrefix}akinator*`);
  }

  const game = games[sender];

  if (game.ended) {
    delete games[sender];
    return msg.reply(`《✧》 Tu partida ha terminado. Inicia una nueva con *${usedPrefix}akinator*`);
  }

  const respuesta = args[0]?.toLowerCase();

  if (!respuesta || !['si', 'no', 'nose', 'no sé', 'no se', 'probablemente', 'probablemente no', 'terminar'].includes(respuesta)) {
    return msg.reply(`《✧》 Responde con:\n*${usedPrefix}aki si*\n*${usedPrefix}aki no*\n*${usedPrefix}aki no sé*\n*${usedPrefix}aki probablemente*\n*${usedPrefix}aki probablemente no*\n*${usedPrefix}aki terminar*`);
  }

  if (respuesta === 'terminar') {
    delete games[sender];
    return msg.reply(`《✧》 Has terminado la partida. ¡Vuelve cuando quieras!`);
  }

  // 🔥 Mapear respuesta a formato Aki
  // 0=Si, 1=No, 2=No sé, 3=Probablemente, 4=Probablemente no
  const answerMap = {
    'si': 0,
    'no': 1,
    'nose': 2,
    'no sé': 2,
    'no se': 2,
    'probablemente': 3,
    'probablemente no': 4
  };

  const answerCode = answerMap[respuesta] ?? 2;

  try {
    await msg.react('🔄');

    const aki = game.aki;
    
    // 🔥 Enviar respuesta
    await aki.step(answerCode);

    // 🔥 Verificar si adivinó
    const guess = aki.guess;
    if (guess && guess.name) {
      game.guessMode = true;
      game.guessData = guess;
      
      let guessMsg = `🎉 *¡Lo sé!*\n\nEstás pensando en...\n*${guess.name}*\n${guess.description || ''}\n\n¿Adiviné? *${usedPrefix}aki si* o *${usedPrefix}aki no*`;

      await sock.sendMessage(msg.chat, {
        text: guessMsg,
        ...(guess.photo ? { image: { url: guess.photo } } : {})
      }, { quoted: msg });

      return;
    }

    // 🔥 Si no adivinó, mostrar siguiente pregunta
    game.question = aki.question;
    game.progress = aki.progress || 0;
    game.step = (game.step || 0) + 1;

    const progressBar = generarBarraProgreso(game.progress);
    
    // 🔥 Mostrar opciones de respuesta
    const answersText = aki.answers ? `\n_Respuestas disponibles:_ ${aki.answers.join(', ')}` : '';
    
    await msg.reply(`🤔 *Pregunta ${game.step}:*\n${game.question}\n\n${progressBar}${answersText}\n\n_Responde con ${usedPrefix}aki si/no/no sé_`);

  } catch (error) {
    console.error('Error en Akinator:', error);
    delete games[sender];
    await msg.reply(`《✧》 Ocurrió un error. La partida se ha reiniciado.`);
  }
}

// 🔥 Comando principal
export default {
  command: ['akinator', 'aki', 'adivina'],
  category: 'fun',
  description: 'Juego de Akinator: adivina el personaje en el que piensas.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const sender = msg.sender;

    // 🔥 Si ya tiene partida activa
    if (games[sender]) {
      if (args.length > 0) {
        return await handleAnswer(msg, sock, args, usedPrefix);
      }
      
      const game = games[sender];
      if (game.guessMode && game.guessData) {
        return msg.reply(`🎯 Estoy esperando tu respuesta: *¿Adiviné?*\nResponde con *${usedPrefix}aki si* o *${usedPrefix}aki no*`);
      }
      
      return msg.reply(`《✧》 Ya tienes una partida activa.\nResponde con *${usedPrefix}aki si/no/no sé*\nO termina con *${usedPrefix}aki terminar*`);
    }

    try {
      await msg.react('🕒');
      await msg.reply(`《✧》 *Akinator* 🤔\nPiensa en un personaje (real o ficticio) y responde mis preguntas.\n\n_Responde con:_\n*${usedPrefix}aki si*\n*${usedPrefix}aki no*\n*${usedPrefix}aki no sé*\n*${usedPrefix}aki probablemente*\n*${usedPrefix}aki probablemente no*\n*${usedPrefix}aki terminar*`);

      // 🔥 Iniciar nueva partida en ESPAÑOL
      const aki = new Aki({ 
        region: 'es',  // 🔥 Español
        childMode: false 
      });
      
      await aki.start();

      games[sender] = {
        aki: aki,
        question: aki.question,
        progress: aki.progress || 0,
        step: 0,
        ended: false,
        guessMode: false,
        guessData: null
      };

      const progressBar = generarBarraProgreso(0);
      const answersText = aki.answers ? `\n_Respuestas disponibles:_ ${aki.answers.join(', ')}` : '';
      
      await msg.reply(`🤔 *Pregunta 1:*\n${aki.question}\n\n${progressBar}${answersText}\n\n_Responde con ${usedPrefix}aki si/no/no sé_`);

    } catch (error) {
      console.error('Error iniciando Akinator:', error);
      
      // 🔥 Si falla con 'es', intentar con 'en' (inglés)
      try {
        await msg.reply(`《✧》 Intentando con servidor en inglés... (responde en español)`);
        
        const aki = new Aki({ 
          region: 'en',
          childMode: false 
        });
        
        await aki.start();

        games[sender] = {
          aki: aki,
          question: aki.question,
          progress: aki.progress || 0,
          step: 0,
          ended: false,
          guessMode: false,
          guessData: null
        };

        const progressBar = generarBarraProgreso(0);
        await msg.reply(`🤔 *Pregunta 1:*\n${aki.question}\n\n${progressBar}\n\n_Responde con ${usedPrefix}aki si/no/no sé_\n*(Las preguntas están en inglés, responde en español)*`);
        
      } catch (altError) {
        console.error('Error con región alternativa:', altError);
        await msg.reply(`《✧》 No se pudo conectar con el servidor de Akinator. Intenta más tarde.`);
      }
    }
  }
};