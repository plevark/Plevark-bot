export default {
  command: ['8ball', 'bolamagica', 'bola8'],
  category: 'fun',
  description: 'Pregúntale algo a la bola mágica',
  run: async ({ msg, sock, args }) => {
    if (!args[0]) return msg.reply('🎱 *Hazme una pregunta*\nEjemplo: !8ball ¿Me irá bien hoy?');

    const respuestas = [
      '✅ Sí, definitivamente.', '✅ Es cierto.', '✅ Sin duda alguna.',
      '✅ Sí, confía en ello.', '✅ Muy probablemente.', '✅ Las señales dicen que sí.',
      '✅ Todo apunta a que sí.', '✅ El universo conspira a tu favor.',
      '✅ Sí, pero con esfuerzo.', '✅ Obviamente sí, ¿lo dudabas?',
      '✅ Las estrellas dicen SÍ.', '✅ Hoy es tu día de suerte.',
      '✅ Sí, y será mejor de lo que esperas.', '✅ Definitivamente, ve por ello.',
      '✅ El destino ya lo decidió: SÍ.', '✅ Sin dudarlo ni un segundo.',
      '✅ Sí, el momento es ahora.', '✅ Claro que sí, campeón.',
      '❌ No cuentes con ello.', '❌ Definitivamente no.', '❌ Mis fuentes dicen que no.',
      '❌ Muy dudoso.', '❌ Ni lo sueñes.', '❌ Para nada.',
      '❌ Las señales dicen que no.', '❌ Hoy no, quizás mañana.',
      '❌ Mejor no lo intentes.', '❌ Eso no va a pasar.',
      '❌ Ni de broma.', '❌ El destino dijo NO.',
      '❌ No, y deberías aceptarlo.', '❌ Olvídalo, no es el momento.',
      '🤔 No estoy seguro, intenta de nuevo.', '🤔 Pregunta más tarde.',
      '🤔 El futuro es incierto.', '🤔 Depende de tus acciones.',
      '🤔 No puedo responder eso ahora.', '🤔 Las nubes no me dejan ver.',
      '🤔 Ni yo lo sé, amigo.', '🤔 Consulta con tu almohada.',
      '🤔 Quizás... quizás no.', '🤔 Solo el tiempo lo dirá.',
      '🤔 50% de probabilidades.', '🤔 Depende de si desayunaste.',
      '🌀 Las energías están confusas.', '🌀 Vuelve a preguntar en otra vida.',
      '🌀 Mi bola está en mantenimiento.', '🌀 Hoy no tengo WiFi cósmico.',
      '😂 Pregúntale a Google, yo no sé.', '😂 Ni en sueños, amigo.',
      '😂 Eso pregúntaselo a tu mamá.', '😂 La bola dice: "¿En serio?"',
      '😂 Estás preguntando mucho últimamente.', '😂 Ve a dormir, mañana lo sabrás.',
      '😂 Sí, pero solo si invitas pizza.', '😂 No, y no insistas.',
    ];

    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
    await sock.sendMessage(msg.chat, {
      text: `🎱 *Pregunta:* ${args.join(' ')}\n\n*Respuesta:* ${respuesta}`
    }, { quoted: msg });
  }
};