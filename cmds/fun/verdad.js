const verdades = [
  '¿Cuál es tu mayor miedo? 😨', '¿Cuál fue la última mentira que dijiste? 🤥',
  '¿A quién del grupo le tienes más cariño? ❤️', '¿Cuál es tu mayor vergüenza? 😳',
  '¿Alguna vez te has enamorado de alguien del grupo? 👀',
  '¿Cuál es tu peor hábito? 🙈', '¿A quién le has mentido más seguido? 🤫',
  '¿Cuál fue tu momento más vergonzoso en público? 😅',
  '¿Cuál es tu secreto más oscuro? 🌑', '¿A quién le debes dinero? 💸',
  '¿Alguna vez has llorado por una película? 🎬', '¿Qué es lo más loco que has hecho por amor? 💘',
  '¿Cuál es tu red social más usada? 📱', '¿Cuánto tiempo pasas en el celular al día? 📲',
  '¿Cuál es tu comida favorita? 🍕', '¿A quién te gustaría besar? 💋',
  '¿Cuál es tu sueño imposible? 💭', '¿Alguna vez has traicionado a un amigo? 🗡️',
  '¿Qué es lo que más te da miedo perder? 💔', '¿Cuál es tu talento oculto? ✨',
  '¿A quién admiras más en el grupo? 🌟', '¿Qué es lo más raro que has buscado en Google? 🔍',
  '¿Cuál ha sido tu peor cita? 💔', '¿Cuántas veces has estado enamorado? 💗',
  '¿Cuál es tu serie favorita? 📺', '¿Qué es lo que nunca harías por dinero? 💰',
  '¿Cuál es tu mayor inseguridad? 😔', '¿Alguna vez has mentido en una entrevista? 💼',
  '¿A quién le has contado un secreto que no debías? 🤐',
  '¿Qué es lo que más te molesta de los demás? 😤'
];

const retos = [
  'Manda un audio cantando tu canción favorita. 🎤',
  'Escribe un piropo a la última persona que te escribió. 💌',
  'Cambia tu foto de perfil por un meme por 1 hora. 🖼️',
  'Manda un sticker random al grupo. 🎨',
  'Di 3 cosas positivas de la persona que está arriba tuya en el chat. ✨',
  'Manda una foto haciendo tu cara más fea. 🤪',
  'Escribe un poema improvisado de 4 líneas. 📝',
  'Llama a un amigo y dile que lo quieres (sin razón). 📞',
  'Imita a alguien del grupo con un audio. 🎭',
  'Manda un mensaje a tu ex diciendo "hola". 😱',
  'Publica una historia de Instagram random. 📸',
  'Di un trabalenguas 3 veces seguidas rápido. 🗣️',
  'Haz 10 flexiones y mándalo en video. 💪',
  'Canta el estribillo de tu canción favorita. 🎶',
  'Manda una selfie sin filtro. 🤳',
  'Cuenta un chiste malo. 😂',
  'Habla como bebé por 3 mensajes seguidos. 👶',
  'Escribe con la mano no dominante. ✍️',
  'Manda un audio diciendo 5 cosas que te gustan de ti. 💖',
  'Imita a un animal hasta que alguien adivine cuál es. 🐘'
];

export default {
  command: ['verdad', 'reto', 'tod', 'vrd'],
  category: 'fun',
  description: 'Verdad o reto aleatorio',
  run: async ({ msg, sock, args }) => {
    const tipo = args[0]?.toLowerCase();
    let tipoFinal = tipo === 'verdad' ? 'VERDAD' : tipo === 'reto' ? 'RETO' : (Math.random() < 0.5 ? 'VERDAD' : 'RETO');
    const lista = tipoFinal === 'VERDAD' ? verdades : retos;
    const texto = lista[Math.floor(Math.random() * lista.length)];
    const emoji = tipoFinal === 'VERDAD' ? '🔍' : '🎯';

    await sock.sendMessage(msg.chat, {
      text: `${emoji} *${tipoFinal}*\n\n${texto}`
    }, { quoted: msg });
  }
};