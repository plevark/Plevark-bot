export default {
  command: ['myid', 'idcanal'],
  category: 'tools',
  run: async ({ msg, sock, args }) => {
    const invite = "0029Vb93IH44IBhLAtGOvu2x";
    
    try {
      await msg.reply(`⏳ Buscando tu canal ${invite}...`);

      let meta;
      if (sock.newsletterFetchInvite) {
        meta = await sock.newsletterFetchInvite(invite);
      } else {
        meta = await sock.newsletterMetadata("invite", invite);
      }

      const texto = `✅ *CANAL ENCONTRADO*\n\n*Nombre:* ${meta.name}\n*ID NEWSLETTER:*\n${meta.id}\n\n*Invite:* ${meta.invite}\n*Link:* https://whatsapp.com/channel/${meta.invite}\n*Subs:* ${meta.subscribers || 0}`;

      await msg.reply(texto);

    } catch (e) {
      await msg.reply(`❌ Error: ${e.message}\n\n${e.stack}`);
    }
  }
}