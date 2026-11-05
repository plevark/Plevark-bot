import db from "#db";
import fs from 'fs';
import path from 'path';

const BANNER_DIR = path.join(process.cwd(), 'banners');
const CONFIG_FILE = path.join(process.cwd(), 'lib', 'groupMenuConfig.json');
if (!fs.existsSync(BANNER_DIR)) fs.mkdirSync(BANNER_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(CONFIG_FILE))) fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
if (!fs.existsSync(CONFIG_FILE)) fs.writeFileSync(CONFIG_FILE, '{}');

function loadConfigs() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')); } catch { return {}; }
}
function saveConfigs(cfg) {
  try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2)); } catch(e){ console.error(e); }
}

async function getGroupConfig(chatId) {
  const fileConfigs = loadConfigs();
  let cfg = fileConfigs[chatId] || {};
  if (typeof db.getChat === 'function') {
    try {
      const chat = await db.getChat(chatId);
      if (!cfg.name) cfg.name = chat?.customName || chat?.groupName || null;
      if (!cfg.banner) cfg.banner = chat?.customBanner || null;
      if (!cfg.currency) cfg.currency = chat?.customCurrency || chat?.currency || null;
      if (!cfg.prefix) cfg.prefix = chat?.customPrefix || null;
      if (!cfg.extraText) cfg.extraText = chat?.extraText || null;
      if (!cfg.hiddenCommands) cfg.hiddenCommands = chat?.hiddenCommands || [];
    } catch {}
  }
  return cfg;
}

async function updateGroupConfig(chatId, key, value) {
  const fileConfigs = loadConfigs();
  if (!fileConfigs[chatId]) fileConfigs[chatId] = {};
  fileConfigs[chatId][key] = value;
  saveConfigs(fileConfigs);
  if (typeof db.updateChat === 'function') {
    try {
      const map = { name: 'customName', banner: 'customBanner', currency: 'customCurrency', prefix: 'customPrefix', extraText: 'extraText', hiddenCommands: 'hiddenCommands' };
      const realKey = map[key] || key;
      await db.updateChat(chatId, realKey, value);
    } catch {}
  }
}

async function resetGroupConfig(chatId) {
  const fileConfigs = loadConfigs();
  const old = fileConfigs[chatId];
  if (old?.banner && fs.existsSync(old.banner)) { try{ fs.unlinkSync(old.banner); }catch{} }
  delete fileConfigs[chatId];
  saveConfigs(fileConfigs);
  if (typeof db.updateChat === 'function') {
    for (const k of ['customName','customBanner','customCurrency','customPrefix','extraText','hiddenCommands']) {
      try { await db.updateChat(chatId, k, null); } catch {}
    }
  }
}

export default {
  command: ['setmenu', 'custommenu', 'personalizar'],
  category: 'grupo',
  isAdmin: true,
  description: 'Personaliza el bot SOLO para este grupo',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      if (!msg.isGroup) return msg.reply('❌ Solo en grupos.');
      const chatId = msg.chat;
      const sub = args[0]?.toLowerCase();
      const config = await getGroupConfig(chatId);

      if (!sub || sub === 'ver' || sub === 'info') {
        let txt = `🎨 *MENÚ PERSONALIZADO*\n🆔 \`${chatId}\`\n\n`;
        txt += `▸ *Nombre:* ${config.name || '(por defecto)'}\n`;
        txt += `▸ *Banner:* ${config.banner && fs.existsSync(config.banner) ? '✅ Personalizado' : '❌ Por defecto'}\n`;
        txt += `▸ *Moneda:* ${config.currency || '(por defecto)'}\n`;
        txt += `▸ *Prefijo:* ${config.prefix || '(por defecto)'}\n`;
        txt += `▸ *Texto extra:* ${config.extraText || '(ninguno)'}\n`;
        txt += `▸ *Ocultos:* ${config.hiddenCommands?.length ? config.hiddenCommands.join(', ') : '(ninguno)'}\n\n`;
        txt += `📌 Subcomandos:\n`;
        txt += `▸ ${usedPrefix}${command} name <texto>\n`;
        txt += `▸ ${usedPrefix}${command} banner (responde imagen)\n`;
        txt += `▸ ${usedPrefix}${command} currency <texto>\n`;
        txt += `▸ ${usedPrefix}${command} prefix <simbolo>\n`;
        txt += `▸ ${usedPrefix}${command} extra <texto>\n`;
        txt += `▸ ${usedPrefix}${command} ocultar <cmd>\n`;
        txt += `▸ ${usedPrefix}${command} mostrar <cmd>\n`;
        txt += `▸ ${usedPrefix}${command} reset`;
        return msg.reply(txt);
      }

      if (sub === 'name' || sub === 'nombre') {
        const texto = args.slice(1).join(' ').trim();
        if (!texto) return msg.reply(`📌 Uso: ${usedPrefix}${command} name <texto>`);
        await updateGroupConfig(chatId, 'name', texto);
        return msg.reply(`✅ Nombre de este grupo cambiado a:\n> ${texto}`);
      }

      if (sub === 'banner') {
        const quoted = msg.quoted || msg;
        const mime = quoted.mimetype || quoted.msg?.mimetype || '';
        if (!mime || !/^image\/(jpe?g|png|webp)$/i.test(mime)) return msg.reply(`📌 Responde a una imagen con: ${usedPrefix}${command} banner`);
        try {
          const buffer = await quoted.download();
          const bannerPath = path.join(BANNER_DIR, `${chatId.replace(/[^\w]/g, '_')}.jpg`);
          fs.writeFileSync(bannerPath, buffer);
          await updateGroupConfig(chatId, 'banner', bannerPath);
          await sock.sendMessage(msg.chat, { image: buffer, caption: `✅ Banner guardado solo para este grupo` }, { quoted: msg });
        } catch (e) { return msg.reply(`❌ Error: ${e.message}`); }
        return;
      }

      if (sub === 'currency' || sub === 'moneda') {
        const texto = args.slice(1).join(' ').trim();
        if (!texto) return msg.reply(`📌 Uso: ${usedPrefix}${command} currency <texto>`);
        await updateGroupConfig(chatId, 'currency', texto);
        return msg.reply(`✅ Moneda de este grupo: ${texto}`);
      }

      if (sub === 'prefix' || sub === 'prefijo') {
        const texto = args[1];
        if (!texto) return msg.reply(`📌 Uso: ${usedPrefix}${command} prefix <simbolo>`);
        await updateGroupConfig(chatId, 'prefix', texto);
        return msg.reply(`✅ Prefijo de este grupo: ${texto}`);
      }

      if (sub === 'extra' || sub === 'texto') {
        const texto = args.slice(1).join(' ').trim();
        await updateGroupConfig(chatId, 'extraText', texto || null);
        return msg.reply(texto ? `✅ Extra: ${texto}` : '✅ Extra eliminado');
      }

      if (sub === 'ocultar' || sub === 'hide') {
        const cmd = args[1]?.toLowerCase();
        if (!cmd) return msg.reply(`📌 Uso: ${usedPrefix}${command} ocultar <comando>`);
        const hidden = Array.isArray(config.hiddenCommands) ? config.hiddenCommands : [];
        if (!hidden.includes(cmd)) { hidden.push(cmd); await updateGroupConfig(chatId, 'hiddenCommands', hidden); }
        return msg.reply(`✅ Comando oculto en este grupo: ${cmd}`);
      }

      if (sub === 'mostrar' || sub === 'show') {
        const cmd = args[1]?.toLowerCase();
        if (!cmd) return msg.reply(`📌 Uso: ${usedPrefix}${command} mostrar <comando>`);
        const hidden = (config.hiddenCommands || []).filter(c => c !== cmd);
        await updateGroupConfig(chatId, 'hiddenCommands', hidden);
        return msg.reply(`✅ Comando visible: ${cmd}`);
      }

      if (sub === 'reset' || sub === 'borrar') {
        await resetGroupConfig(chatId);
        return msg.reply('✅ Personalización de este grupo eliminada');
      }

      return msg.reply(`❌ Subcomando no válido. Usa ${usedPrefix}${command} ver`);
    } catch (e) {
      console.error('❌ Error en setmenu:', e);
      await msg.reply(`❌ Error: ${e.message}`);
    }
  }
};