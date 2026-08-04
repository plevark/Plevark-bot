import { getBuffer } from "#serialize";
import { HfInference } from '@huggingface/inference';
import fs from 'fs';

// ========== CONFIGURACIÓN ==========
// Tu token de Hugging Face
const HF_TOKEN = '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';

if (!HF_TOKEN) {
  console.log('❌ No se encontró HF_TOKEN');
}

const hf = new HfInference(HF_TOKEN);

// ========== MODELOS DISPONIBLES ==========
const MODELOS = {
  REALISTA: 'SG161222/Realistic_Vision_V5.1_noVAE',      // Mejor para fotorrealismo
  ANIME: 'stabilityai/stable-diffusion-xl-base-1.0',     // Bueno para anime/arte
  SDXL: 'stabilityai/stable-diffusion-xl-base-1.0',      // Versátil
};

export default {
  command: ['imagen', 'gen', 'generate', 'image', 'imag', 'draw', 'crear'],
  category: 'ai',
  run: async ({ msg, sock, args }) => {
    const text = args.join(' ').trim();
    if (!text) {
      return msg.reply(`✿ Escribe una *descripción* para generar una imagen.

📌 *Ejemplos:* 
▸ #imagen un samurai con armadura roja bajo la lluvia, 8k, hiperrealista
▸ #imagen una chica anime con cabello rosa y ojos verdes, estilo Studio Ghibli
▸ #imagen un paisaje cyberpunk con neones azules, 4k, cinematográfico

🎨 *Consejos para mejor calidad:*
▸ Añade: "8k, hiperrealista, fotografía profesional"
▸ Especifica colores y luz: "luz dorada del atardecer"
▸ Sé detallado: "armadura con detalles dorados, fondo borroso"`);
    }

    const statusMsg = await sock.sendMessage(msg.chat, { 
      text: `🎨 *Generando imagen con IA...*\n📝 *${text}*\n⏳ Esto puede tomar 20-40 segundos...\n🤖 Modelo: Realistic Vision V5.1`
    }, { quoted: msg });

    try {
      // ========== DETECTAR TIPO DE IMAGEN ==========
      const esAnime = /anime|manga|dibujo|ilustración|personaje|waifu|husbando|kawaii|chibi|dibujo|cartoon|animé/i.test(text);
      const esPaisaje = /paisaje|montaña|playa|cielo|bosque|atardecer|amanecer|noche|ciudad|naturaleza|horizonte|mar|océano|río|lago|selva|desierto|campo|pradera|nieve|volcán|cascada/i.test(text);
      const esPersona = /persona|hombre|mujer|chico|chica|señor|señora|niño|niña|bebé|humano|retrato|foto|fotografía|modelo|actor|actriz|cara|rostro|body|cuerpo|modelo/i.test(text);
      const esAnimal = /perro|gato|pájaro|pez|león|tigre|elefante|jirafa|animal|mascota|caballo|conejo|zorro|lobo|águila|ballena|delfín|vaca|cerdo|mono|serpiente/i.test(text);
      const esFantasia = /fantasía|elfo|dragón|mago|hechicero|orco|hada|medieval|castillo|princesa|caballero|bestia|mítico|leyenda|bruja|hechizo|pociones|reino/i.test(text);
      const esCyberpunk = /cyberpunk|futurista|neón|robótico|androide|cyborg|distopía|robot|ia|inteligencia artificial|tecnología|ciber|futuro|sci-fi/i.test(text);
      const esComida = /comida|platillo|gastronomía|fruta|verdura|carne|postre|pastel|pizza|hamburguesa|sushi|taco|chocolate|helado|pan|queso|vino/i.test(text);

      // ========== ELEGIR MODELO ==========
      let modelo = MODELOS.REALISTA;
      let estilo = '';
      let negativo = '';

      if (esAnime) {
        modelo = MODELOS.ANIME;
        estilo = 'anime style, studio ghibli style, vibrant colors, detailed illustration, high quality, 4k, anime art, manga style, character design, beautiful, stunning, masterpiece, incredible detail, perfect anatomy';
        negativo = 'realistic, photorealistic, 3d, cgi, live action, photograph, ugly, deformed, bad anatomy, extra limbs';
      } else if (esPaisaje) {
        modelo = MODELOS.REALISTA;
        estilo = 'landscape photography, realistic, nature, detailed, 8k, cinematic lighting, high resolution, national geographic style, award-winning photography, professional, vibrant colors, dramatic sky, incredible detail, sharp focus';
        negativo = 'blurry, low quality, cartoon, anime, drawing, sketch, painting, distorted, ugly';
      } else if (esPersona) {
        modelo = MODELOS.REALISTA;
        estilo = 'photorealistic, human, detailed face, perfect anatomy, natural lighting, 8k, professional portrait photography, sharp focus, cinematic, studio lighting, high fashion, editorial, glamour, ultra realistic, skin texture, detailed eyes';
        negativo = 'cartoon, anime, drawing, sketch, blurry, distorted, ugly, bad anatomy, extra limbs, bad hands, deformed, weird, low quality, low resolution';
      } else if (esAnimal) {
        modelo = MODELOS.REALISTA;
        estilo = 'photorealistic animal, detailed fur/feathers/scales, perfect anatomy, natural lighting, 8k, professional wildlife photography, sharp focus, national geographic, incredible detail, ultra realistic, lifelike, authentic, wild';
        negativo = 'cartoon, anime, drawing, sketch, blurry, distorted, deformed, low quality, ugly, bad anatomy';
      } else if (esFantasia) {
        modelo = MODELOS.SDXL;
        estilo = 'fantasy art, epic, magical, detailed, 8k, cinematic, dramatic lighting, medieval, mythical, concept art, high fantasy, breathtaking, mystical, ethereal, incredible detail, masterpiece, award-winning';
        negativo = 'modern, realistic, photograph, blurry, low quality, simple, ugly, deformed';
      } else if (esCyberpunk) {
        modelo = MODELOS.SDXL;
        estilo = 'cyberpunk style, neon lights, futuristic city, rain, dark atmosphere, high tech, detailed, 8k, cinematic lighting, night vibe, Blade Runner aesthetic, dystopian, holographic, ultra detailed, incredible';
        negativo = 'bright, sunny, nature, rural, vintage, low quality, blurry, ugly';
      } else if (esComida) {
        modelo = MODELOS.REALISTA;
        estilo = 'food photography, gourmet, professional, 8k, detailed, appetizing, delicious, vibrant colors, studio lighting, culinary art, gastronomy, ultra realistic, sharp focus, incredible detail';
        negativo = 'cartoon, anime, drawing, sketch, blurry, low quality, ugly, deformed';
      } else {
        modelo = MODELOS.REALISTA;
        estilo = 'photorealistic, detailed, 8k, cinematic lighting, high quality, professional photography, ultra realistic, masterpiece, stunning, breathtaking, incredible detail, sharp focus, award-winning';
        negativo = 'blurry, distorted, ugly, cartoon, anime, drawing, sketch, low quality, low resolution, pixelated, deformed, bad anatomy, extra limbs, bad hands';
      }

      // ========== PROMPT FINAL ==========
      const promptRealista = `${text}, ${estilo}`;

      console.log(`🎨 Generando con modelo: ${modelo}`);
      console.log(`📝 Prompt: ${promptRealista.substring(0, 100)}...`);

      // ========== GENERAR IMAGEN ==========
      let imagenBuffer = null;
      let intentos = 0;
      const maxIntentos = 3;

      while (intentos < maxIntentos) {
        try {
          intentos++;
          console.log(`🔄 Intento ${intentos}/${maxIntentos}`);

          const imageBlob = await hf.textToImage({
            model: modelo,
            inputs: promptRealista,
            parameters: {
              negative_prompt: negativo,
              width: 1024,
              height: 1024,
              num_inference_steps: 60,
              guidance_scale: 7.5,
            }
          });

          const arrayBuffer = await imageBlob.arrayBuffer();
          imagenBuffer = Buffer.from(arrayBuffer);
          
          if (imagenBuffer && imagenBuffer.length > 10000) {
            console.log(`✅ Imagen generada: ${imagenBuffer.length} bytes`);
            break;
          }
        } catch (error) {
          console.log(`❌ Intento ${intentos} falló: ${error.message}`);
          if (intentos === maxIntentos) throw error;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // ========== ENVIAR RESULTADO ==========
      let tipoTexto = 'Fotorrealista';
      if (esAnime) tipoTexto = 'Anime/Manga';
      else if (esPaisaje) tipoTexto = 'Paisaje';
      else if (esPersona) tipoTexto = 'Retrato Humano';
      else if (esAnimal) tipoTexto = 'Animal';
      else if (esFantasia) tipoTexto = 'Fantasía/Épico';
      else if (esCyberpunk) tipoTexto = 'Cyberpunk/Futurista';
      else if (esComida) tipoTexto = 'Gastronomía';

      const nombreModelo = modelo.split('/')[1];

      await sock.sendMessage(msg.chat, {
        image: imagenBuffer,
        caption: `🖼️ *Imagen generada con IA*

📝 *Prompt:* ${text}
🎨 *Estilo:* ${tipoTexto}
🤖 *Modelo:* ${nombreModelo}
⚡ *Pasos:* 60

💡 *Para resultados más realistas:*
▸ Añade: "8k, hiperrealista, fotografía profesional"
▸ Especifica iluminación: "luz dorada del atardecer"
▸ Sé detallado: "armadura con detalles dorados, fondo borroso"
▸ Usa palabras como: "cinematográfico, detallado, nítido"`
      }, { quoted: msg });

    } catch (e) {
      console.error('Error en generación de imagen:', e);
      
      // ========== FALLBACK: Pollinations ==========
      try {
        console.log('🔄 Fallback a Pollinations...');
        await sock.sendMessage(msg.chat, { 
          text: `🔄 Usando modo alternativo (Pollinations)...`
        }, { quoted: msg });

        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
        const fallbackImage = await getBuffer(fallbackUrl);
        
        await sock.sendMessage(msg.chat, {
          image: fallbackImage,
          caption: `🖼️ *Imagen generada (modo alternativo)*\n📝 ${text}\n⚠️ Calidad puede ser inferior`
        }, { quoted: msg });
      } catch (fallbackError) {
        await msg.reply(`❌ *Error al generar la imagen.*

📝 *Descripción:* ${text}

🔄 *Para mejor resultado:*
▸ Simplifica la descripción: "gato naranja, 4k"
▸ Espera unos segundos y vuelve a intentar
▸ Usa palabras clave: realista, 8k, detallado

🔧 *Posibles causas:*
▸ Servicio de IA saturado (espera 10s)
▸ Prompt demasiado complejo
▸ Problemas de conexión`);
      }
    }
  }
};