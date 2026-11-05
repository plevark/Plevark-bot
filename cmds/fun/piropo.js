const inicios = [
  'Si fueras', 'Eres como', 'Tienes el', 'Contigo hasta', '¿Eres un',
  'Tu sonrisa es como', 'Tus ojos son como', 'Eres más', 'Serías mi',
  'Hasta el', 'Si la', 'Definitivamente eres', 'Me gustas más que'
];
const medios = [
  'un código', 'el café', 'un atardecer', 'una estrella', 'un poema',
  'el WiFi', 'la luna', 'un imán', 'un sueño', 'una canción',
  'un bug', 'la pizza', 'el sol', 'una obra de arte', 'la noche'
];
const finales = [
  'serías mi función favorita. 💻❤️',
  'porque me despiertas y me encantas. ☕',
  'porque no puedo dejar de mirarte. 🌅',
  'porque brillas más que todas. ⭐',
  'porque tus versos son mi vida. 📜',
  'porque siento una conexión. 📶',
  'porque iluminas mis noches. 🌙',
  'porque me atraes sin remedio. 🧲',
  'porque no quiero despertar. 💭',
  'porque eres mi melodía. 🎵',
  'porque me arreglas el día. 🐛✨',
  'porque no puedo vivir sin ti. 🍕',
  'porque calientas mi corazón. ☀️',
  'porque eres perfecta. 🎨',
  'porque en la oscuridad eres mi luz. 🌌'
];

const piropos = [
  'Si la belleza fuera un delito, estarías cumpliendo cadena perpetua. 🔒',
  '¿Tienes un mapa? Porque me acabo de perder en tus ojos. 🗺️',
  'Eres como el café: fuerte, dulce y adictiva. ☕',
  '¿Trabajas en un banco? Porque acabas de capturar mi interés. 🏦',
  'Perdona, ¿te conozco? Es que pareces mi futuro. 💍',
  'Si fueras una fruta, serías una fresa: la más dulce del mercado. 🍓',
  'Eres tan especial que hasta mis neuronas se sincronizan al verte. 🧠',
  'Si estuvieras en un menú, serías el plato del día todos los días. 🍽️',
  'Contigo hasta programar en lunes sería divertido. 📅💕',
  'Eres más especial que un bug que se arregla solo. 🐛✨',
  '¿De dónde saliste? ¿Del cielo o de mis sueños? ☁️💭',
  'Si las estrellas te vieran, tendrían celos. ⭐',
  'Me gustas más que el primer bocado de pizza. 🍕',
  'Eres la excepción a todas mis reglas. 📏💖',
  'Contigo el tiempo se detiene y solo existes tú. ⏳',
  'Tienes una sonrisa que podría acabar guerras. 🕊️',
  'Si me pidieras un deseo, solo pediría más tiempo contigo. 🧞',
  'Eres el match perfecto que ningún algoritmo puede explicar. 📱❤️',
  'Hasta mis complejos de inferioridad se sienten superiores contigo. 😅',
  'Contigo hasta el lunes huele a viernes. 📅🌸',
  'Eres la prueba de que Dios crea cosas perfectas. ✝️✨',
  '¿Vienes del espacio? Porque eres de otro planeta. 🪐',
  'Me gustas más que dormir hasta tarde los domingos. 😴💕',
  'Si tuviera que elegir entre ti y el WiFi, elegiría el WiFi... es broma, a ti. 📶😅',
  'Eres la razón por la que creo en el amor a primera vista. 👀❤️',
  'Contigo hasta cocinar sería un placer. 👨‍🍳💕',
  'Si el amor fuera una lotería, tú serías el boleto ganador. 🎰',
  'Eres el capítulo que no quiero terminar de leer. 📖',
  'Tienes la clase que no se enseña en ninguna escuela. 🎓',
  'Contigo hasta los lunes se sienten como viernes. 📅🎉'
];

export default {
  command: ['piropo', 'flirt', 'piropos'],
  category: 'fun',
  description: 'Lanza un piropo aleatorio',
  run: async ({ msg, sock, args }) => {
    const target = msg.mentionedJid?.[0] || msg.quoted?.sender;

    let piropo;
    if (Math.random() < 0.5) {
      piropo = piropos[Math.floor(Math.random() * piropos.length)];
    } else {
      const a = inicios[Math.floor(Math.random() * inicios.length)];
      const b = medios[Math.floor(Math.random() * medios.length)];
      const c = finales[Math.floor(Math.random() * finales.length)];
      piropo = `${a} ${b}, ${c}`;
    }

    const texto = target 
      ? `@${target.split('@')[0]} 💘 ${piropo}`
      : `💘 ${piropo}`;
    await sock.sendMessage(msg.chat, { 
      text: texto, 
      mentions: target ? [target] : [] 
    }, { quoted: msg });
  }
};