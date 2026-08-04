import db from '#db';

export default {
  command: ['delwarn', 'quitarwarn', 'removewarn'],
  category: 'group',
  description: 'Eliminar una advertencia de un miembro del grupo.',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    try {
      // 🔥 Obtener usuario objetivo
      const targetId = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
      if (!targetId) {
        return msg.reply('《✧》 Debes mencionar o responder al usuario cuya advertencia deseas eliminar.');
      }

      // 🔥 Obtener usuario del chat (con await)
      let user = await db.getChatUser(msg.chat, targetId);
      if (!user) {
        return msg.reply('《✧》 No se encontró al usuario en la base de datos.');
      }

      // 🔥 Obtener advertencias
      let warnings = user.warnings || [];
      if (typeof warnings === 'string') {
        try { warnings = JSON.parse(warnings); } catch { warnings = []; }
      }
      if (!Array.isArray(warnings)) warnings = [];

      const total = warnings.length;
      if (total === 0) {
        return sock.reply(msg.chat, `《✧》 El usuario @${targetId.split('@')[0]} no tiene advertencias registradas.`, msg, { mentions: [targetId] });
      }

      // 🔥 Obtener nombre del usuario
      const userGlobal = await db.getUser(targetId);
      const name = userGlobal?.name || 'Usuario';

      // 🔥 Determinar índice
      const rawIndex = (msg.mentionedJid?.length > 0) ? args[1] : args[0];

      // 🔥 Si es "all", eliminar todas
      if (rawIndex?.toLowerCase() === 'all' || rawIndex?.toLowerCase() === 'todas') {
        await db.updateChatUser(msg.chat, targetId, 'warnings', []);
        return sock.reply(msg.chat, `✐ Se han eliminado todas las advertencias del usuario @${targetId.split('@')[0]} (${name}).`, msg, { mentions: [targetId] });
      }

      // 🔥 Validar índice
      const index = parseInt(rawIndex);
      if (isNaN(index)) {
        return msg.reply('《✧》 Debes especificar el índice de la advertencia que deseas eliminar.\nEjemplo: *delwarn @usuario 2*\nO usa *delwarn @usuario all* para borrar todas.');
      }
      if (index < 1 || index > total) {
        return msg.reply(`ꕥ El índice debe ser un número entre 1 y ${total}.`);
      }

      // 🔥 Eliminar advertencia específica (orden inverso: 1 = más reciente)
      const realIndex = total - index;
      const warningEliminada = warnings[realIndex];
      warnings.splice(realIndex, 1);

      // 🔥 Guardar cambios (con await)
      await db.updateChatUser(msg.chat, targetId, 'warnings', warnings);

      await sock.reply(msg.chat, 
        `ꕥ Se ha eliminado la advertencia #${index} del usuario @${targetId.split('@')[0]} (${name}).\n` +
        `> Motivo: ${warningEliminada?.reason || 'Sin motivo'}\n` +
        `> Fecha: ${warningEliminada?.timestamp || 'Desconocida'}`,
        msg, { mentions: [targetId] }
      );
      
    } catch (error) {
      console.error('Error en delwarn:', error);
      await msg.reply(`❌ Ocurrió un error al eliminar la advertencia.\n> Error: ${error.message || 'Desconocido'}`);
    }
  },
};