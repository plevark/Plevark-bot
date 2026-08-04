import ytsearch from "yt-search";
import ytdlp from "yt-dlp";
import { getBuffer } from "#serialize";
import fs from "fs";
import path from "path";

export default {
  command: ["play2", "ytaudio", "mp3"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) {
        return msg.reply("《✧》 Por favor, menciona el nombre o URL del video.");
      }

      const text = args.join(" ");
      const searchResult = await ytsearch(text);
      if (!searchResult.videos || !searchResult.videos.length) {
        return msg.reply("《✧》 No se encontró información del video.");
      }

      const video = searchResult.videos[0];
      const { title, author, timestamp: duration, views, url, image } = video;
      const vistas = (views || 0).toLocaleString();
      const canal = author?.name || author || "Desconocido";
      const thumbBuffer = await getBuffer(image);

      const caption = `【　✿　】 _\`୨୧  Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || ''}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _──  ִ    ۟  *¡Enviando audio, por favor espera!*_`;

      await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg });

      const outputPath = path.join(process.cwd(), 'temp', `${Date.now()}.mp3`);
      if (!fs.existsSync('temp')) fs.mkdirSync('temp');

      await new Promise((resolve, reject) => {
        const yt = ytdlp(url, {
          filter: 'audioonly',
          quality: '140',
          output: outputPath,
        });
        yt.on('end', resolve);
        yt.on('error', reject);
      });

      const audioBuffer = fs.readFileSync(outputPath);
      fs.unlinkSync(outputPath);

      await sock.sendMessage(msg.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: true,
      }, { quoted: msg });
    } catch (e) {
      console.error(e);
      await msg.reply("《✧》 Ocurrió un error al descargar el audio.");
    }
  },
};