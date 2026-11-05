export default {
  command: ['id'],
  category: 'utils',
  description: 'Obtener el ID del chat actual',

  run: async ({ msg, sock }) => {
    try {
      // Obtener el ID del chat
      const chatId = msg.chat || msg.key?.remoteJid || '';
      
      // Obtener el nombre del chat (si es posible)
      let chatName = 'Chat desconocido';
      
      // Si es un grupo, intentar obtener el nombre
      if (chatId.endsWith('@g.us')) {
        try {
          // Usar groupMetadata en lugar de getName
          const metadata = await sock.groupMetadata(chatId);
          chatName = metadata.subject || 'Grupo sin nombre';
        } catch (e) {
          chatName = 'Grupo (sin metadata)';
        }
      } else if (chatId.endsWith('@s.whatsapp.net')) {
        // Es un chat privado, intentar obtener el nombre del contacto
        try {
          // Método alternativo para obtener el nombre
          const contact = await sock.getContact(chatId);
          chatName = contact?.name || contact?.notify || 'Contacto desconocido';
        } catch (e) {
          chatName = 'Chat privado';
        }
      }

      // Construir mensaje
      const message = `📋 *INFORMACIÓN DEL CHAT*

📌 *ID del chat:* \`${chatId}\`
👤 *Nombre:* ${chatName}
📱 *Tipo:* ${chatId.endsWith('@g.us') ? '👥 Grupo' : '💬 Chat privado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Para usar este ID:*
▸ Copia el ID que aparece arriba
▸ Úsalo en ${global.prefijo || '#'}setgrupo o donde necesites

✨ *Hecho por Plevark Ecosystem* ✨`;

      await sock.sendMessage(msg.chat, {
        text: message
      }, { quoted: msg });

    } catch (e) {
      console.error('❌ Error en comando id:', e);
      await msg.reply(`❌ Error: ${e.message || 'Error desconocido'}`);
    }
  }
};