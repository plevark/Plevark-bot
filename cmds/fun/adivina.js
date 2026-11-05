const partidas = new Map();

export default {
  command: ['adivina', 'guess', 'numero'],
  category: 'fun',
  description: 'Adivina el número secreto',
  run: async ({ msg, sock, args }) => {
    const userId = msg.sender;
    const chatId = msg.chat;

    if (!args[0] || args[0].toLowerCase() === 'nuevo' || args[0].toLowerCase() === 'iniciar') {
      const max = parseInt(args[1]) || 100;
      const random = Math.floor(Math.random() * max) + 1;
      partidas.set(userId, { num: random, intentos: 0, max, chatId, start: Date.now() });
      return msg.reply(`🎲 *¡Nueva partida!*\n\nHe pensado un número del *1 al ${max}*.\n\n📝 Escribe *!adivina <número>* para intentar.\n💡 Tienes *10 intentos*.`);
    }

    const p = partidas.get(userId);
    if (!p) return msg.reply('❌ No tienes partida activa. Escribe *!adivina nuevo* para empezar.');

    const num = parseInt(args[0]);
    if (isNaN(num)) return msg.reply('❌ Escribe un número válido.');

    p.intentos++;

    if (num === p.num) {
      const tiempo = Math.round((Date.now() - p.start) / 1000);
      partidas.delete(userId);
      return msg.reply(`🎉 *¡GANASTE!*\n\n✅ El número era *${p.num}*\n📊 Intentos: *${p.intentos}*\n⏱️ Tiempo: *${tiempo}s*`);
    }

    if (p.intentos >= 10) {
      partidas.delete(userId);
      return msg.reply(`💀 *¡PERDISTE!*\n\nEl número era *${p.num}*.\n\nEscribe *!adivina nuevo* para jugar otra vez.`);
    }

    const pista = num < p.num ? '📈 El número es MÁS ALTO.' : '📉 El número es MÁS BAJO.';
    const restantes = 10 - p.intentos;
    await sock.sendMessage(msg.chat, {
      text: `❌ *${num}* no es el número.\n${pista}\n\n🎯 Intentos restantes: *${restantes}*`
    }, { quoted: msg });
  }
};