import db from "#db";

export default {
  command: ['topmensajes', 'topmsg', 'top'],
  category: 'economy',
  run: async ({ msg, sock }) => {
    try {
      // 🔥 OBTENER TODOS LOS USUARIOS DEL CHAT
      // Primero intentamos obtener el chat completo
      const chat = await db.getChat(msg.chat);
      
      if (!chat) {
        return msg.reply('《✧》 No se encontró información del chat.');
      }

      // 🔥 OBTENER USUARIOS DEL CHAT (DE LA BASE DE DATOS)
      // Si el chat tiene un objeto 'users', extraemos los IDs
      let userIds = [];
      
      if (chat.users) {
        // Si chat.users es un objeto con IDs como claves
        if (typeof chat.users === 'object' && !Array.isArray(chat.users)) {
          userIds = Object.keys(chat.users);
        }
        // Si chat.users es un array
        else if (Array.isArray(chat.users)) {
          userIds = chat.users.map(u => u.user_id || u.id).filter(Boolean);
        }
      }

      // Si no hay usuarios en chat.users, intentar obtener de otra forma
      if (userIds.length === 0) {
        // Intentar obtener todos los chatUsers
        const chatUsers = await db.getChatUser(msg.chat);
        if (Array.isArray(chatUsers)) {
          userIds = chatUsers.map(u => u.user_id || u.id).filter(Boolean);
        } else if (typeof chatUsers === 'object') {
          userIds = Object.keys(chatUsers);
        }
      }

      if (userIds.length === 0) {
        return msg.reply('《✧》 No hay usuarios registrados en este chat.');
      }

      // 🔥 RECOPILAR ESTADÍSTICAS DE CADA USUARIO
      const userStats = [];
      const today = new Date().toLocaleDateString('es-CO', { 
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').reverse().join('-');

      for (const userId of userIds) {
        if (!userId) continue;
        
        // Obtener datos del usuario en el chat
        const userData = await db.getChatUser(msg.chat, userId);
        if (!userData) continue;
        
        // Obtener nombre del usuario
        const userInfo = await db.getUser(userId);
        const name = userInfo?.name || userId.split('@')[0] || 'Desconocido';
        
        // Obtener stats
        const stats = userData.stats || {};
        const todayStats = stats[today] || { msgs: 0, cmds: 0 };
        
        // Calcular total de mensajes de todos los días
        let totalMsgs = 0;
        let totalCmds = 0;
        for (const day in stats) {
          if (stats[day]?.msgs) totalMsgs += stats[day].msgs;
          if (stats[day]?.cmds) totalCmds += stats[day].cmds;
        }
        
        userStats.push({
          userId: userId,
          name: name,
          totalMsgs: totalMsgs,
          totalCmds: totalCmds,
          todayMsgs: todayStats.msgs || 0,
          todayCmds: todayStats.cmds || 0
        });
      }

      if (userStats.length === 0) {
        return msg.reply('《✧》 No hay estadísticas disponibles.');
      }

      // 🔥 ORDENAR POR TOTAL DE MENSAJES (DE MAYOR A MENOR)
      userStats.sort((a, b) => b.totalMsgs - a.totalMsgs);

      // 🔥 TOMAR SOLO LOS TOP 10
      const top10 = userStats.slice(0, 10);

      // 🔥 CONSTRUIR MENSAJE
      let mensaje = '📊 *TOP 10 - USUARIOS CON MÁS MENSAJES*\n';
      mensaje += '━━━━━━━━━━━━━━━━━━━━━━\n\n';

      const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      for (let i = 0; i < top10.length; i++) {
        const user = top10[i];
        const medalla = medallas[i] || `${i+1}.`;
        mensaje += `${medalla} *${user.name}*\n`;
        mensaje += `   📩 Mensajes: *${user.totalMsgs.toLocaleString()}*\n`;
        mensaje += `   📝 Comandos: *${user.totalCmds.toLocaleString()}*\n`;
        if (i < top10.length - 1) mensaje += '\n';
      }

      mensaje += '\n━━━━━━━━━━━━━━━━━━━━━━\n';
      mensaje += `📅 *Hoy:* ${today}\n`;
      mensaje += `👥 *Usuarios registrados:* ${userStats.length}`;

      await msg.reply(mensaje);
    } catch (e) {
      console.error('Error en topcount:', e);
      await msg.reply(`❌ Ocurrió un error: ${e.message}`);
    }
  }
};
