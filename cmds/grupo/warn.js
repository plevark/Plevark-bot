import db from '#db';

export default {
  command: ['warn', 'advertir'],
  category: 'group',
  description: 'Darle una advertencia a un miembro del grupo.',
  isAdmin: true,
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      // Configurar límite de advertencias por defecto
      const chat = await db.getChat(msg.chat);
      if (!chat.warnLimit) {
        await db.updateChat(msg.chat, 'warnLimit', 3);
      }
      if (chat.expulsar === undefined) {
        await db.updateChat(msg.chat, 'expulsar', 0);
      }

      // Obtener el usuario objetivo
      const targetId = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
      if (!targetId) {
        return msg.reply('《✧》 Debes mencionar o responder al usuario que deseas advertir.');
      }

      const reason = msg.mentionedJid?.length > 0 
        ? args.slice(1).join(' ') || 'Sin razón.' 
        : args.slice(0).join(' ') || 'Sin razón.';

      // Obtener o crear el usuario en el chat
      let user = await db.getChatUser(msg.chat, targetId);
      if (!user) {
        // Si no existe, crearlo con estructura básica
        await db.createChatUser(msg.chat, targetId, { warnings: [] });
        user = await db.getChatUser(msg.chat, targetId);
      }

      // Obtener las advertencias actuales
      let warnings = user.warnings || [];
      if (typeof warnings === 'string') {
        try { warnings = JSON.parse(warnings); } catch { warnings = []; }
      }
      if (!Array.isArray(warnings)) warnings = [];

      // Agregar nueva advertencia
      const now = new Date();
      const timestamp = now.toLocaleString('es-CO', { 
        timeZone: 'America/Bogota', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      warnings.unshift({ 
        reason, 
        timestamp, 
        by: msg.sender 
      });

      // Guardar las advertencias actualizadas
      await db.updateChatUser(msg.chat, targetId, 'warnings', warnings);

      const total = warnings.length;
      const userGlobal = await db.getUser(targetId);
      const name = userGlobal?.name || 'Usuario';

      // Construir mensaje con lista de advertencias
      const warningList = warnings.map((w, i) => {
        const index = total - i;
        return `\`#${index}\` » ${w.reason}\n> » Fecha: ${w.timestamp}`;
      }).join('\n');

      let message = `✐ Se ha añadido una advertencia a @${targetId.split('@')[0]}.\n✿ Advertencias totales \`(${total})\`:\n\n${warningList}`;

      // Verificar límite de advertencias
      const warnLimit = chat.warnLimit || 3;
      const expulsar = chat.expulsar === 1;

      if (total >= warnLimit && expulsar) {
        try {
          await sock.groupParticipantsUpdate(msg.chat, [targetId], 'remove');
          // Limpiar advertencias después de expulsar
          await db.updateChatUser(msg.chat, targetId, 'warnings', []);
          message += `\n\n> ❖ El usuario ha alcanzado el límite de advertencias y fue expulsado del grupo.`;
        } catch (e) {
          message += `\n\n> ❖ El usuario alcanzó el límite, pero no se pudo expulsar automáticamente.`;
        }
      } else if (total >= warnLimit && !expulsar) {
        message += `\n\n> ❖ El usuario ha alcanzado el límite de advertencias.`;
      }

      await sock.reply(msg.chat, message, msg, { mentions: [targetId] });
      
    } catch (e) {
      console.error('Error en warn:', e);
      return msg.reply(`❌ Ocurrió un error al ejecutar el comando *${usedPrefix + command}*.\n> Error: *${e.message}*`);
    }
  }
};