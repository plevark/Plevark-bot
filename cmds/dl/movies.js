export default {
  command: ['movies', 'peliculas', 'lista', 'catalogo'],
  category: 'util',
  description: '📽️ Ver todas las películas y series disponibles',
  
  run: async ({ msg, sock, usedPrefix }) => {
    try {
      // ========== LISTA DE PELÍCULAS Y SERIES ==========
      const movies = {
        // === PELÍCULAS ===
        "🍿 Películas": [
          "🕷️ Spider-Man: Sin camino a casa",
          "🕷️ Across the Spider-Verse",
          "🧚 Shrek",
          "🧚 Shrek 2",
          "🧚 Shrek 3",
          "🧚 Shrek 4: Felices para siempre",
          "⚡ Harry Potter y la piedra filosofal",
          "⚡ Harry Potter y la cámara secreta",
          "⚡ Harry Potter y el prisionero de Azkaban",
          "⚡ Harry Potter y el cáliz de fuego",
          "⚡ Harry Potter y la orden del Fénix",
          "⚡ Harry Potter y el misterio del príncipe",
          "⚡ Harry Potter y las reliquias de la muerte (Parte 1)",
          "⚡ Harry Potter y las reliquias de la muerte (Parte 2)",
          "👯 Donde están las rubias",
          "🦍 King Kong",
          "🌊 Moana (Live Action)",
          "🦎 Godzilla vs Kong",
          "🐑 Las ovejas detectives",
          "🏢 Corporate Retreat",
          "🎸 Strung",
          "🔪 Backwoods Blood Feud",
          "🦸 Supergirl",
          "📩 La invitación",
          "⚠️ Alerta Extinción",
          "🐛 WormTown",
          "💀 Exterminio: El templo de los huesos",
          "🐯 La vida de Pi",
          "🍌 Minions & Monster",
          "❤️ Obsession",
          "🧟 La posesión de la Momia",
          "💼 Legalmente Rubia",
          "🦈 Chum",
          "🌹 50 Sombras de Grey",
          "🔪 Te van a matar",
          "🔍 Enola Holmes",
          "🔍 Enola Holmes 2",
          "🔍 Enola Holmes 3",
          "🚪 Backrooms",
          "🐻 Five Nights at Freddy's (2023)",
          "🐻 Five Nights at Freddy's 2",
          "🧠 Intensamente 2",
          "🌊 Avatar: El sentido del agua",
          "🚗 Cars",
          "🐼 Kung Fu Panda (2008)",
          "👻 El Conjuro",
          "🧪 La Sustancia (2024)",
          "⛏️ Minecraft (2025)",
          "🚀 Interstellar (2014)",
          "🧸 Toy Story 1 (1995)",
          "🧸 Toy Story 5",
          "🔄 Intercambio",
          "🌊 Flow",
          "🐰 Hoppers",
          "🌊 Moana",
          "🏎️ Fast And Furious 1",
          "🍄 Super Mario Galaxy",
          "🐰 Zootopia 2",
          "🎤 Kpop Demon Hunters",
          "🐱 Garfield 2",
          "👪 Us",
          "🎤 Michael Jackson",
          "🦆 Duck Duck Goose",
          "👽 Elio",
          "🔥 El ritual del nahual",
          "💥 Embestida",
          "🐭 Stuart Little",
          "🦕 Un gran dinosaurio",
          "👩 Mamá",
          "🎈 IT",
          "📱 Fall",
          "🧚 El laberinto del fauno",
          "💊 Matrix",
          "🎲 Ready or Not 2",
          "🔒 Sueño de fuga"
        ],
        "📺 Series": [
          "📺 El Mentalista (T1)",
          "📺 The Originals (T3)",
          "📺 Merlina (T1)",
          "📺 The Purge (T1)",
          "📺 From (T1)",
          "📺 From (T2)",
          "📺 From (T3)",
          "📺 From (T4)",
          "📺 Miraculous 6",
          "📺 Cassandra"
        ]
      };

      // ========== CONSTRUIR MENSAJE ==========
      const totalPelis = movies["🍿 Películas"].length;
      const totalSeries = movies["📺 Series"].length;
      const total = totalPelis + totalSeries;

      let message = `🎬 *CATÁLOGO COMPLETO* 🎬
╔══════════════════════════════════════╗
║  📊 Total: ${total} títulos          ║
║  🍿 Películas: ${totalPelis}         ║
║  📺 Series: ${totalSeries}           ║
╚══════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Para buscar una película:* ${usedPrefix}movie *nombre*

*Ejemplos:*
▸ ${usedPrefix}movie shrek
▸ ${usedPrefix}movie harry potter
▸ ${usedPrefix}movie spider-man

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      // ========== AGREGAR PELÍCULAS ==========
      message += `🍿 *PELÍCULAS* (${totalPelis})\n`;
      message += movies["🍿 Películas"].map((m, i) => {
        const num = String(i + 1).padStart(2, '0');
        return `  ${num}. ${m}`;
      }).join('\n');

      message += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      // ========== AGREGAR SERIES ==========
      message += `📺 *SERIES* (${totalSeries})\n`;
      message += movies["📺 Series"].map((m, i) => {
        const num = String(i + 1).padStart(2, '0');
        return `  ${num}. ${m}`;
      }).join('\n');

      message += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Hecho por Plevark Ecosystem* ✨`;

      // ========== ENVIAR ==========
      await sock.sendMessage(msg.chat, {
        text: message
      }, { quoted: msg });

    } catch (e) {
      console.error('❌ Error en movies:', e);
      await msg.reply(`❌ *Error:* ${e.message || 'Error desconocido'}`);
    }
  }
};