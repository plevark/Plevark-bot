import db from "#db"
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'lib', 'groupMenuConfig.json');
function getGroupConfig(chatId) {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    const all = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    return all[chatId] || {};
  } catch { return {}; }
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock, args }) => {
    try {
      const prefix = '!'
      const chatId = msg.chat;
      const groupCfg = getGroupConfig(chatId);

      const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';
      const botSettings = await db.getSettings(botId);
      const botname = groupCfg.name || botSettings.namebot || 'Alya';
      const botname2 = groupCfg.name || botSettings.namebot2 || 'Pusheen the cat';
      let banner = groupCfg.banner || botSettings.banner || '';
      const currency = groupCfg.currency || botSettings.currency || '';
      const extraText = groupCfg.extraText || '';
      const hiddenCommands = groupCfg.hiddenCommands || [];
      const owner = botSettings.owner || '';
      const links = botSettings.link || 'https://whatsapp.com/channel/0029Vb93IH44IBhLAtGOvu2x';
      const channelJid = global.my?.ch || '120363412235157082@newsletter';

      const oficialId = global?.sock ? global.sock.user.id.split(':')[0] + '@s.whatsapp.net' : '';
      const isOficialBot = botId === oficialId;
      const botType = isOficialBot ? '𝐎𝐰𝐧𝐞𝐫' : '𝐒𝐮𝐛-𝐁𝐨𝐭';
      const own = await db.getUser(owner);

      let menu = `   ── ˙ ¡𝐇ola!, soy ${botname2} (*${botType}*) .
✎ ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ʟᴏs ᴄᴏᴍᴀɴᴅᴏs
${extraText ? `\n> ${extraText}\n` : ''}

︵𝆣᷼ ͡︵᷼𝆣 ᷼͡︵᷼𝆣 ᷼͡︵ ິ︵𝆣᷼ ͡︵᷼𝆣 ᷼͡︵᷼𝆣 ᷼͡︵

- 𐫦ϟ │ 𝐄nlace ❚❙    ❀  
⸺　${links}
${currency ? `- 𐫦ϟ │ 𝐌oneda ❚❙    ❀  \n⸺　${currency}\n` : ''}

︶͜︶͜︶֪֪︶͜︶͜︶

${String.fromCharCode(8206).repeat(4000)}`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      for (const [cmdName, data] of global.comandos) {
        if (hiddenCommands.includes(cmdName.toLowerCase())) continue;
        const category = data.category || 'otros';
        if (!categories[category]) categories[category] = [];
        if (categories[category].some(c => c.name === cmdName)) continue;
        categories[category].push({ name: cmdName, category, desc: data.description || 'Sin descripcion' });
      }

      const categoryEmojisList = ["˚୨•(=^●ω●^=)•", "☆(ゝω·)>", "ღゝ◡╹ )ノ", "ଘ៸៸᳐⦁⩊⦁៸៸᳐ଓ", "(•ૢ⚈͒⌄⚈͒•ૢ)", "ฅ^·ﻌ·^ฅ", "≽^• ˕ • ྀི≼", "(𓂂꜆◕⩊◕꜀𓂂)", "ʚ(꒪ˊ꒳ˋ꒪)ɞ", "ෆ(՞ ⌯'ᵕ'⌯ ՞)ෆ ̖́-", "(ᯫ᳐˶ꔷ֊ꔷᯫ᳐)ฅ", "(✿◡‿◡)", "ᜊ(꒪ˊ꒳ˋ꒪)ᜊ"];
      const categoryNameMap = { 'anime': '𝐀𝗇𝗂𝗆𝖾', 'download': '𝐃ownload', 'economia': '𝐄conomia', 'gacha': '𝐆acha', 'grupo': '𝐆rupo', 'ia': '𝐈a', 'info': '𝐈nfo', 'nsfw': '𝐍sfw', 'profile': '𝐏rofile', 'search': '𝐒earch', 'sockets': '𝐒ocket', 'stickers': '𝐒ticker', 'utils': '𝐔tils' };
      const categoryDescriptions = { 'anime': 'Comandos de anime.', 'download': 'Descargas.', 'economia': 'Economia.', 'gacha': 'Gacha.', 'grupo': 'Admins.', 'ia': 'IA.', 'info': 'Info.', 'nsfw': 'NSFW.', 'profile': 'Perfil.', 'search': 'Busqueda.', 'sockets': 'Sub-bots.', 'stickers': 'Stickers.', 'utils': 'Utils.' };

      const availableCategories = Object.keys(categories).map(c => c.toLowerCase());
      if (categoryArg && !availableCategories.includes(categoryArg)) {
        return msg.reply(`La categoria *${categoryArg}* no existe.\nCategorias: ${availableCategories.join(', ')}`);
      }

      let emojiIndex = 0;
      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;
        const catName = categoryNameMap[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1);
        const catEmoji = categoryEmojisList[emojiIndex % categoryEmojisList.length];
        emojiIndex++;
        const description = categoryDescriptions[category.toLowerCase()] || `Comandos de ${catName}.`;
        menu += `\n- ꪆ  ❬ ${catEmoji} ❭  *\`${catName}\`*  ᰨᰍ    *;*\n> ✐ ${description}\n\n`;
        cmds.forEach((cmd) => { menu += `❀   ᠀᠀۟  ${prefix}${cmd.name}\n> ── 𑁪ׅ۫ _${cmd.desc}_\n`; });
        menu += `\n ׅ۫      ﹙❀﹚ׅ˚\n`;
      }

      // Owner abajo del todo
      menu += `\n\n︶͜︶͜︶֪֪︶͜︶͜︶\n`;
      menu += `- 𐫦ϟ │ 𝐃eveloper  ❚❙    ✿  \n⸺　${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `${own?.name || owner}` : owner) : 'Oculto por privacidad'}\n`;
      menu += `︶͜︶͜︶֪֪︶͜︶͜︶\n`;

      // --- ESTILO COMO LA CAPTURA: Reenviado del canal + banner + Ver canal ---
      const newsletterName = `${botname2} - Oficial Channel`;
      const contextInfo = {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelJid,
          newsletterName: newsletterName,
          serverMessageId: 1
        }
      };

      // 1. Banner como imagen con el menu como caption + estilo canal
      if (banner && fs.existsSync(banner)) {
        try {
          if (banner.includes('.mp4') || banner.includes('.gif') || banner.includes('.webm')) {
            return sock.sendMessage(msg.chat, { video: fs.readFileSync(banner), caption: menu.trim(), contextInfo }, { quoted: msg });
          } else {
            return sock.sendMessage(msg.chat, { image: fs.readFileSync(banner), caption: menu.trim(), contextInfo }, { quoted: msg });
          }
        } catch (e) { console.log('Error banner local', e.message); }
      }

      if (banner && (banner.startsWith('http://') || banner.startsWith('https://'))) {
        try {
          if (banner.includes('.mp4') || banner.includes('.gif') || banner.includes('.webm')) {
            return sock.sendMessage(msg.chat, { video: { url: banner }, caption: menu.trim(), contextInfo }, { quoted: msg });
          } else {
            return sock.sendMessage(msg.chat, { image: { url: banner }, caption: menu.trim(), contextInfo }, { quoted: msg });
          }
        } catch (e) { 
          console.log(chalk.yellow(`[ !menu ] Banner URL caido: ${e.message}`));
        }
      }

      // Fallback sin banner pero igual con estilo canal
      return sock.sendMessage(msg.chat, { text: menu.trim(), contextInfo }, { quoted: msg });

    } catch (e) {
      console.error(e);
      await msg.reply(`Error en menu: ${e.message}`);
    }
  },
};
