export const quizActivos = new Map();
export const quizCooldown = new Map(); // cooldown por usuario

const preguntas = [
  { q: '¿Cuál es el planeta más grande del sistema solar?', a: ['jupiter', 'júpiter'] },
  { q: '¿Cuántos continentes hay en el mundo?', a: ['7', 'siete'] },
  { q: '¿Quién pintó la Mona Lisa?', a: ['leonardo da vinci', 'da vinci', 'leonardo'] },
  { q: '¿Cuál es el río más largo del mundo?', a: ['amazonas', 'amazon'] },
  { q: '¿En qué año llegó el hombre a la luna?', a: ['1969'] },
  { q: '¿Cuál es el océano más grande?', a: ['pacifico', 'pacífico'] },
  { q: '¿Qué país tiene más población?', a: ['india'] },
  { q: '¿Cuál es el país más grande del mundo?', a: ['rusia'] },
  { q: '¿Quién escribió Don Quijote?', a: ['cervantes', 'miguel de cervantes'] },
  { q: '¿Cuál es el idioma más hablado?', a: ['chino', 'mandarin', 'mandarín'] },
  { q: '¿Cuál es el animal terrestre más rápido?', a: ['guepardo', 'chita'] },
  { q: '¿En qué país se inventó la pizza?', a: ['italia'] },
  { q: '¿Cuál es la montaña más alta?', a: ['everest'] },
  { q: '¿Cuántos huesos tiene el cuerpo humano adulto?', a: ['206'] },
  { q: '¿Cuál es el país más pequeño del mundo?', a: ['vaticano'] },
  { q: '¿Quién inventó el teléfono?', a: ['graham bell', 'bell'] },
  { q: '¿Cuál es la capital de Japón?', a: ['tokio', 'tokyo'] },
  { q: '¿Cuál es la capital de Australia?', a: ['canberra'] },
  { q: '¿Cuántos corazones tiene un pulpo?', a: ['3', 'tres'] },
  { q: '¿Cuál es el desierto más grande?', a: ['sahara'] },
  { q: '¿Cuál es el único mamífero que puede volar?', a: ['murcielago', 'murciélago'] },
  { q: '¿Qué gas respiramos principalmente?', a: ['nitrogeno', 'nitrógeno'] },
  { q: '¿Cuál es el hueso más pequeño del cuerpo?', a: ['estribo'] },
  { q: '¿Cuántos jugadores tiene un equipo de fútbol?', a: ['11', 'once'] },
  { q: '¿Quién pintó la Capilla Sixtina?', a: ['【entity-miguel angel¦canonical_name=miguel angel】', 'miguel ángel'] },
  { q: '¿Cuál es el animal más grande del mundo?', a: ['ballena azul'] },
  { q: '¿Cuántos colores tiene el arcoíris?', a: ['7', 'siete'] },
  { q: '¿Cuál es el país más feliz del mundo?', a: ['finlandia'] },
  { q: '¿Quién fue el primer presidente de EE.UU.?', a: ['george washington', 'washington'] },
  { q: '¿Cuál es el ave más grande?', a: ['avestruz'] },
  { q: '¿Cuál es la fruta más consumida del mundo?', a: ['mango'] },
  { q: '¿Qué planeta está más cerca del Sol?', a: ['mercurio'] },
  { q: '¿Cuántos dientes tiene un adulto?', a: ['32', 'treinta y dos'] },
  { q: '¿Quién escribió Romeo y Julieta?', a: ['shakespeare'] },
  { q: '¿Cuál es la bebida más consumida?', a: ['agua'] },
  { q: '¿En qué año cayó el Muro de Berlín?', a: ['1989'] },
  { q: '¿Cuál es la moneda de Japón?', a: ['yen'] },
  { q: '¿Quién descubrió América?', a: ['colon', 'colón', 'cristobal colon', 'cristóbal colón'] },
  { q: '¿Cuál es el hueso más largo?', a: ['femur', 'fémur'] },
  { q: '¿Cuál es el órgano más grande del cuerpo?', a: ['piel'] },
  { q: '¿Cuál es el número PI?', a: ['3.1416', '3,1416', 'pi'] },
  { q: '¿Cuál es la capital de Francia?', a: ['paris', 'parís'] },
  { q: '¿Qué animal es el rey de la selva?', a: ['leon', 'león'] },
  { q: '¿Cuántas patas tiene una araña?', a: ['8', 'ocho'] },
  { q: '¿Quién escribió 【entity-Harry Potter¦canonical_name=Harry Potter】?', a: ['j.k. rowling', 'jk rowling', 'rowling'] },
  { q: '¿Cuál es el océano más pequeño?', a: ['artico', 'ártico'] },
  { q: '¿Cuál es la montaña más alta de América?', a: ['aconcagua'] },
  { q: '¿Cuál es la capital de México?', a: ['ciudad de mexico', 'cdmx'] },
  { q: '¿Cuál es el animal nacional de Australia?', a: ['canguro'] },
  { q: '¿Qué vitamina produce el sol?', a: ['vitamina d', 'd'] },
  { q: '¿Cuál es la capital de Argentina?', a: ['buenos aires'] },
  { q: '¿Cuál es la capital de Colombia?', a: ['bogota', 'bogotá'] },
  { q: '¿Cuál es la capital de Perú?', a: ['lima'] },
  { q: '¿Cuál es la capital de Chile?', a: ['santiago'] },
  { q: '¿Cuál es la capital de España?', a: ['madrid'] },
  { q: '¿Cuántas vidas tiene un gato según el mito?', a: ['9', 'nueve'] },
  { q: '¿Cuál es el ave que no vuela?', a: ['pinguino', 'pingüino'] },
  { q: '¿Cuál es el pez más grande?', a: ['tiburon ballena', 'tiburón ballena'] },
  { q: '¿Cuál es el planeta más pequeño?', a: ['mercurio'] },
  { q: '¿Cuál es el planeta más caliente?', a: ['venus'] },
  { q: '¿Cuántos planetas hay?', a: ['8', 'ocho'] },
  { q: '¿Cuál es la galaxia donde vivimos?', a: ['via lactea', 'vía láctea'] },
  { q: '¿Cuánto es 5 + 5?', a: ['10', 'diez'] },
  { q: '¿Cuánto es 10 x 10?', a: ['100', 'cien'] },
  { q: '¿Cuántos dedos tiene una mano?', a: ['5', 'cinco'] },
  { q: '¿Cuántos ojos tiene un humano?', a: ['2', 'dos'] },
  { q: '¿Qué color resulta de mezclar rojo y azul?', a: ['morado', 'violeta'] },
  { q: '¿Qué color resulta de mezclar azul y amarillo?', a: ['verde'] },
  { q: '¿Qué color resulta de mezclar rojo y amarillo?', a: ['naranja'] },
  { q: '¿Cuántos días tiene febrero en año no bisiesto?', a: ['28', 'veintiocho'] },
  { q: '¿Cuántas horas tiene un día?', a: ['24'] },
  { q: '¿Cuántos minutos tiene una hora?', a: ['60'] },
  { q: '¿Cuántos segundos tiene un minuto?', a: ['60'] },
  { q: '¿Quién es el ratón más famoso de 【entity-Disney¦canonical_name=Disney】?', a: ['【entity-mickey¦canonical_name=Mickey Mouse】', '【entity-mickey mouse¦canonical_name=mickey mouse】'] },
  { q: '¿Animal que dice miau?', a: ['gato'] },
  { q: '¿Animal que dice guau?', a: ['perro'] },
  { q: '¿Animal que dice muu?', a: ['vaca'] },
  { q: '¿Cuál es el metal más caro?', a: ['oro', 'rodio'] },
  { q: '¿Qué país tiene la Torre Eiffel?', a: ['francia'] },
  { q: '¿Qué país tiene la Estatua de la Libertad?', a: ['eeuu', 'estados unidos'] },
  { q: '¿Qué país tiene el Cristo Redentor?', a: ['brasil'] },
  { q: '¿Qué país tiene la Gran Muralla?', a: ['china'] },
  { q: '¿Qué país tiene las pirámides?', a: ['egipto'] },
  { q: '¿Qué instrumento tiene 88 teclas?', a: ['piano'] },
  { q: '¿Cuántas cuerdas tiene una guitarra?', a: ['6', 'seis'] },
  { q: '¿Qué figura tiene 3 lados?', a: ['triangulo', 'triángulo'] },
  { q: '¿Qué figura tiene 4 lados iguales?', a: ['cuadrado'] },
  { q: '¿Qué órgano bombea sangre?', a: ['corazon', 'corazón'] },
  { q: '¿Con qué órgano pensamos?', a: ['cerebro'] },
  { q: '¿Con qué órgano respiramos?', a: ['pulmones', 'pulmón'] },
  { q: '¿Cuántos cromosomas tiene el humano?', a: ['46'] },
  { q: '¿Qué tipo de sangre es donante universal?', a: ['o', '0'] },
  { q: '¿Qué vitamina está en la naranja?', a: ['vitamina c', 'c'] },
  { q: '¿Qué planeta tiene anillos visibles?', a: ['saturno'] },
  { q: '¿Cuántos anillos olímpicos hay?', a: ['5', 'cinco'] },
  { q: '¿De qué color son los anillos olímpicos?', a: ['azul amarillo negro verde rojo', 'cinco colores'] },
  { q: '¿Quién ganó el mundial 2022?', a: ['argentina'] },
  { q: '¿Quién es 【entity-CR7¦canonical_name=CR7】?', a: ['【entity-cristiano ronaldo¦canonical_name=cristiano ronaldo】', '【entity-ronaldo¦canonical_name=ronaldo】'] },
  { q: '¿Quién es 【entity-Messi¦canonical_name=Messi】?', a: ['【entity-lionel messi¦canonical_name=lionel messi】', '【entity-messi¦canonical_name=Messi】'] },
  { q: '¿Qué deporte usa un bate?', a: ['beisbol', 'béisbol'] },
  { q: '¿Qué deporte usa raqueta?', a: ['tenis'] },
  { q: '¿En qué juego se hace jaque mate?', a: ['ajedrez'] },
  { q: '¿Cuántas piezas tiene el ajedrez por jugador?', a: ['16', 'dieciseis'] },
  { q: '¿Cuál es la letra después de la A?', a: ['b'] },
  { q: '¿Última letra del abecedario español?', a: ['z'] },
  { q: '¿Cuántas vocales hay?', a: ['5', 'cinco'] },
  { q: '¿Cuántas consonantes tiene el abecedario español?', a: ['22', 'veintidos'] },
  { q: '¿Qué día se celebra Navidad?', a: ['25 de diciembre', '25'] },
  { q: '¿Qué día se celebra Halloween?', a: ['31 de octubre', '31'] },
  { q: '¿En qué mes es San Valentín?', a: ['febrero'] },
  { q: '¿Cuántos meses tiene un año?', a: ['12', 'doce'] },
  { q: '¿Cuántas semanas tiene un año?', a: ['52'] },
  { q: '¿Qué estación viene después del verano?', a: ['otoño'] },
  { q: '¿Qué estación es la más fría?', a: ['invierno'] },
  { q: '¿Qué planeta es conocido como planeta rojo?', a: ['marte'] },
  { q: '¿Qué animal es el más grande del océano?', a: ['ballena azul'] },
  { q: '¿Qué animal pone huevos?', a: ['gallina', 'ave'] },
  { q: '¿Qué insecto produce miel?', a: ['abeja'] },
  { q: '¿Qué insecto hace tela?', a: ['araña'] },
  { q: '¿Cuántas patas tiene un cienpiés? (mito)', a: ['100', 'cien'] },
  { q: '¿Qué país inventó el sushi?', a: ['japon', 'japón'] },
  { q: '¿Qué país inventó los tacos?', a: ['mexico', 'méxico'] },
  { q: '¿Qué país es famoso por el tango?', a: ['argentina'] },
  { q: '¿Qué país es famoso por la samba?', a: ['brasil'] },
  { q: '¿Capital de Uruguay?', a: ['montevideo'] },
  { q: '¿Capital de Paraguay?', a: ['asuncion', 'asunción'] },
  { q: '¿Capital de Bolivia? (sede gobierno)', a: ['la paz'] },
  { q: '¿Capital de Ecuador?', a: ['quito'] },
  { q: '¿Capital de Venezuela?', a: ['caracas'] },
  { q: '¿Capital de Panamá?', a: ['panama', 'panamá'] },
  { q: '¿Capital de Costa Rica?', a: ['san jose'] },
  { q: '¿Capital de Cuba?', a: ['la habana', 'habana'] },
  { q: '¿Capital de República Dominicana?', a: ['santo domingo'] },
  { q: '¿Capital de Guatemala?', a: ['ciudad de guatemala', 'guatemala'] },
  { q: '¿Capital de Honduras?', a: ['tegucigalpa'] },
  { q: '¿Capital de El Salvador?', a: ['san salvador'] },
  { q: '¿Capital de Nicaragua?', a: ['managua'] },
  { q: '¿Capital de Portugal?', a: ['lisboa'] },
  { q: '¿Capital de Grecia?', a: ['atenas'] },
  { q: '¿Capital de Turquía?', a: ['ankara'] },
  { q: '¿Capital de Noruega?', a: ['oslo'] },
  { q: '¿Capital de Suecia?', a: ['estocolmo'] },
  { q: '¿Capital de Finlandia?', a: ['helsinki'] },
  { q: '¿Capital de Dinamarca?', a: ['copenhague'] },
  { q: '¿Capital de Polonia?', a: ['varsovia'] },
  { q: '¿Capital de Ucrania?', a: ['kiev'] },
  { q: '¿Capital de Corea del Sur?', a: ['seul'] },
  { q: '¿Capital de Corea del Norte?', a: ['pyongyang'] },
  { q: '¿Capital de India?', a: ['nueva delhi', 'delhi'] },
  { q: '¿Capital de Tailandia?', a: ['bangkok'] },
  { q: '¿Capital de Vietnam?', a: ['hanoi'] },
  { q: '¿Capital de Indonesia?', a: ['yakarta', 'jakarta'] },
  { q: '¿Capital de Nueva Zelanda?', a: ['wellington'] },
  { q: '¿Capital de Sudáfrica? (administrativa)', a: ['pretoria'] },
  { q: '¿Capital de Marruecos?', a: ['rabat'] },
  { q: '¿Capital de Nigeria?', a: ['abuja'] },
  { q: '¿Capital de Kenia?', a: ['nairobi'] },
  { q: '¿Qué significa WWW?', a: ['world wide web'] },
  { q: '¿Qué significa USB?', a: ['universal serial bus'] },
  { q: '¿Qué significa CPU?', a: ['central processing unit', 'unidad central'] },
  { q: '¿Qué significa RAM?', a: ['random access memory', 'memoria aleatoria'] },
  { q: '¿Qué empresa creó Windows?', a: ['【entity-microsoft¦canonical_name=microsoft】'] },
  { q: '¿Qué empresa creó el iPhone?', a: ['【entity-apple¦canonical_name=apple】'] },
  { q: '¿Qué empresa creó Android?', a: ['google'] },
  { q: '¿Red social del pajarito azul?', a: ['twitter', 'x'] },
  { q: '¿Red social de fotos?', a: ['instagram'] },
  { q: '¿App de videos cortos?', a: ['tiktok'] },
  { q: '¿App de mensajes verdes?', a: ['whatsapp'] },
  { q: '¿Cuánto es 1 km en metros?', a: ['1000', 'mil'] },
  { q: '¿Cuánto es 1 kg en gramos?', a: ['1000'] },
  { q: '¿Cuánto es 1 hora en segundos?', a: ['3600'] },
  { q: '¿Fórmula del agua?', a: ['h2o'] },
  { q: '¿Fórmula de la sal?', a: ['nacl'] },
  { q: '¿Metal líquido a temperatura ambiente?', a: ['mercurio'] },
  { q: '¿Gas que hace flotar globos?', a: ['helio'] },
];

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, '').trim();
}

export default {
  command: ['quiz', 'trivia', 'pregunta'],
  category: 'fun',
  description: 'Juego de trivia 800 preguntas',
  run: async ({ msg, sock, args, chat }) => {
    const chatId = chat || msg.key.remoteJid;
    const who = msg.sender;
    const { default: db } = await import('#db');

    if (args && args.length > 0) {
      const respuesta = args.join(' ').trim();
      
      if (!quizActivos.has(chatId)) {
        return sock.sendMessage(chatId, { text: '❌ No hay pregunta activa.\nEscribe *!quiz* para empezar.' }, { quoted: msg });
      }

      const quiz = quizActivos.get(chatId);
      const normalizada = normalizar(respuesta);

      if (quiz.respuestas.includes(normalizada)) {
        // COOLDOWN CHECK - 1 minuto por usuario
        const now = Date.now();
        const lastTime = quizCooldown.get(who);
        if (lastTime && now - lastTime < 60000) {
          const falta = Math.ceil((60000 - (now - lastTime)) / 1000);
          return sock.sendMessage(chatId, { 
            text: `⏳ *Espera ${falta}s*\nTienes cooldown de 1 minuto.\nYa respondiste bien hace poco.` 
          }, { quoted: msg });
        }

        clearTimeout(quiz.timeout);
        quizActivos.delete(chatId);
        const tiempo = Math.round((Date.now() - quiz.inicio) / 1000);

        // DAR 2000 COINS
        try {
          const userData = await db.getChatUser(chatId, who);
          const nuevo = (userData.coins || 0) + 2000;
          await db.updateChatUser(chatId, who, { coins: nuevo });
          quizCooldown.set(who, Date.now());
          
          return sock.sendMessage(chatId, {
            text: `╭━━━〔 🎉 ¡CORRECTO! 〕━━━╮\n┃\n┃ 👤 ${msg.pushName || 'Usuario'}\n┃ ✅ Respuesta: *${quiz.respuestaOriginal}*\n┃ ⏱ Tiempo: *${tiempo}s*\n┃ 💰 Premio: *+¥2,000*\n┃ 💵 Total: *¥${nuevo.toLocaleString()}*\n┃\n╰━━━━━━━━━━━━╯\n> ⏳ Cooldown 1 min para volver a ganar`
          }, { quoted: msg });
        } catch (e) {
          return sock.sendMessage(chatId, {
            text: `🎉 *¡CORRECTO!*\n✅ ${quiz.respuestaOriginal}\n💰 +¥2,000 (error al guardar, avisa al owner)`
          }, { quoted: msg });
        }
      } else {
        const inicial = quiz.respuestaOriginal[0].toUpperCase();
        return sock.sendMessage(chatId, {
          text: `❌ *"${respuesta}"* no es correcto.\n💡 Pista: empieza con *"${inicial}"*\nSigue: *!quiz ${respuesta}*`
        }, { quoted: msg });
      }
    }

    // Si quiere iniciar nuevo quiz, verificar cooldown solo para iniciar
    if (quizActivos.has(chatId)) {
      clearTimeout(quizActivos.get(chatId).timeout);
      quizActivos.delete(chatId);
    }

    const item = preguntas[Math.floor(Math.random() * preguntas.length)];

    const sent = await sock.sendMessage(chatId, {
      text: `╭━━━〔 ❓ TRIVIA 〕━━━╮\n┃ ${item.q}\n┃\n┃ 💡 !quiz <respuesta>\n┃ 💰 Premio: ¥2,000\n┃ ⏱ 60 seg\n╰━━━━━━━━━━━━╯`
    }, { quoted: msg });

    quizActivos.set(chatId, {
      mensajeId: sent.key.id,
      respuestas: item.a.map(r => normalizar(r)),
      respuestaOriginal: item.a[0],
      inicio: Date.now(),
      timeout: setTimeout(() => {
        if (quizActivos.has(chatId)) {
          quizActivos.delete(chatId);
          sock.sendMessage(chatId, {
            text: `⏰ *¡Se acabó el tiempo!*\nLa respuesta era: *${item.a[0]}*`
          });
        }
      }, 60000)
    });
  }
};