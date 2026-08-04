import db from "#db";

export default {
  command: ['saveview', 'guardarvideo', 'descargarvideo'],
  category: 'utils',
  description: 'Descargar un video de visualización única.',
  run: async ({ msg, sock }) => {
    if (!msg.quoted) {
      return msg.reply(`《✧》 Responde al *video de visualización única* que deseas descargar.`);
    }

    const quoted = msg.quoted;
    
    // Verificar que sea un video
    const isVideo = quoted.message?.videoMessage || 
                    quoted.mimetype?.startsWith('video/');
    
    if (!isVideo) {
      return msg.reply(`《✧》 El mensaje citado no es un *video*.\nSolo puedes descargar videos de visualización única.`);
    }

    try {
      await msg.react('🕒');
      
      // 🔥 Descargar el video usando el método correcto
      const buffer = await sock.downloadMediaMessage(quoted);

      if (!buffer || buffer.length < 100) {
        return msg.reply(`《✧》 No se pudo descargar el video.\nAsegúrate de que sea un video válido.`);
      }

      // Enviar el video descargado
      await sock.sendMessage(msg.chat, {
        video: buffer,
        caption: `✎ *Video descargado* ✅\n> Este video era de visualización única.`,
        gifPlayback: false
      }, { quoted: msg });

      await msg.react('✅');
    } catch (error) {
      console.error('Error en saveview:', error);
      await msg.react('✖️');
      await msg.reply(`《✧》 Ocurrió un error al descargar el video.\n> Error: ${error.message || 'Desconocido'}`);
    }
  }
};
