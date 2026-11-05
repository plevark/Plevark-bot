export default {
  command: ['dado', 'dice', 'dados'],
  category: 'fun',
  description: 'Lanza uno o varios dados',
  run: async ({ msg, sock, args }) => {
    const input = (args[0] || '1d6').toLowerCase();
    const match = input.match(/^(\d+)d(\d+)$/);
    
    let cantidad = 1, caras = 6;
    if (match) {
      cantidad = Math.min(parseInt(match[1]), 20);
      caras = Math.min(parseInt(match[2]), 1000);
    } else if (!isNaN(args[0])) {
      caras = Math.min(parseInt(args[0]), 1000);
    }

    if (caras < 2) return msg.reply('❌ El dado debe tener al menos 2 caras.');

    const resultados = [];
    for (let i = 0; i < cantidad; i++) {
      resultados.push(Math.floor(Math.random() * caras) + 1);
    }
    const suma = resultados.reduce((a, b) => a + b, 0);
    const emojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];

    let texto = `🎲 *Dado${cantidad > 1 ? 's' : ''} de ${caras} caras*\n\n`;
    if (cantidad === 1 && caras === 6) {
      texto += `${emojis[resultados[0] - 1]}  *${resultados[0]}*`;
    } else {
      texto += `🎯 Resultados: ${resultados.join(' + ')}\n`;
      if (cantidad > 1) texto += `\n📊 *Total:* ${suma}`;
    }

    await sock.sendMessage(msg.chat, { text: texto }, { quoted: msg });
  }
};