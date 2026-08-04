import db from "#db"

// ============================================================
// 1. UTILIDADES
// ============================================================

// Redondear a 1 decimal y devolver número
const a1Decimal = (num) => {
  const redondeado = Math.round(num * 10) / 10
  return redondeado
}

// Redondear a 1 decimal y devolver string con 1 decimal (para mostrar)
const a1DecimalStr = (num) => {
  return a1Decimal(num).toFixed(1)
}

// Número aleatorio entre min y max (inclusive)
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Número aleatorio con 1 decimal (para imposible2)
const randDecimal = (min, max) => {
  const entero = rand(min, max)
  const decimal = rand(0, 9)
  return parseFloat(`${entero}.${decimal}`)
}

// Elegir operador según dificultad
const ops = {
  facil: ['+', '-'],
  medio: ['+', '-', '×'],
  dificil: ['+', '-', '×', '÷'],
  imposible: ['+', '-', '×', '÷', '√'],
  imposible2: ['+', '-', '×', '÷', '√', '²']
}

// ============================================================
// 2. GENERADORES DE PROBLEMAS COMBINADOS
// ============================================================

const generadores = {

  // ==================== FACIL ====================
  // Combina suma y resta (3-4 números)
  facil: () => {
    const count = rand(3, 4) // 3 o 4 números
    let nums = []
    let opsList = []
    let expr = ''
    let resultado = 0

    // Generar números y operadores
    for (let i = 0; i < count; i++) {
      nums.push(rand(1, 20))
    }
    for (let i = 0; i < count - 1; i++) {
      opsList.push(ops.facil[rand(0, 1)])
    }

    // Construir expresión y calcular
    expr = nums[0].toString()
    resultado = nums[0]
    for (let i = 0; i < opsList.length; i++) {
      expr += ` ${opsList[i]} ${nums[i + 1]}`
      if (opsList[i] === '+') resultado += nums[i + 1]
      else resultado -= nums[i + 1]
    }

    return { problema: expr, respuesta: a1Decimal(resultado) }
  },

  // ==================== MEDIO ====================
  // Combina suma, resta y multiplicación (3-4 números)
  medio: () => {
    const count = rand(3, 4)
    let nums = []
    let opsList = []
    let expr = ''
    let resultado = 0

    for (let i = 0; i < count; i++) {
      nums.push(rand(1, 20))
    }
    for (let i = 0; i < count - 1; i++) {
      opsList.push(ops.medio[rand(0, 2)])
    }

    // Calcular con prioridad (× primero)
    let values = [...nums]
    let operators = [...opsList]
    let i = 0
    while (i < operators.length) {
      if (operators[i] === '×') {
        values[i] = values[i] * values[i + 1]
        values.splice(i + 1, 1)
        operators.splice(i, 1)
      } else {
        i++
      }
    }
    resultado = values[0]
    for (let i = 0; i < operators.length; i++) {
      if (operators[i] === '+') resultado += values[i + 1]
      else resultado -= values[i + 1]
    }

    // Construir expresión visual
    expr = nums[0].toString()
    for (let i = 0; i < opsList.length; i++) {
      expr += ` ${opsList[i]} ${nums[i + 1]}`
    }

    return { problema: expr, respuesta: a1Decimal(resultado) }
  },

  // ==================== DIFICIL ====================
  // Combina suma, resta, multiplicación y división (3-4 números)
  dificil: () => {
    const count = rand(3, 4)
    let nums = []
    let opsList = []
    let expr = ''
    let resultado = 0

    for (let i = 0; i < count; i++) {
      nums.push(rand(1, 30))
    }
    for (let i = 0; i < count - 1; i++) {
      opsList.push(ops.dificil[rand(0, 3)])
    }

    // Calcular con prioridad (× y ÷ primero)
    let values = [...nums]
    let operators = [...opsList]
    let i = 0
    while (i < operators.length) {
      if (operators[i] === '×' || operators[i] === '÷') {
        if (operators[i] === '×') {
          values[i] = values[i] * values[i + 1]
        } else {
          values[i] = values[i] / values[i + 1]
        }
        values.splice(i + 1, 1)
        operators.splice(i, 1)
      } else {
        i++
      }
    }
    resultado = values[0]
    for (let i = 0; i < operators.length; i++) {
      if (operators[i] === '+') resultado += values[i + 1]
      else resultado -= values[i + 1]
    }

    expr = nums[0].toString()
    for (let i = 0; i < opsList.length; i++) {
      expr += ` ${opsList[i]} ${nums[i + 1]}`
    }

    return { problema: expr, respuesta: a1Decimal(resultado) }
  },

  // ==================== IMPOSIBLE ====================
  // Combina suma, resta, multiplicación, división y raíz cuadrada
  imposible: () => {
    // Decidir si incluir raíz o no (50% probabilidad)
    const incluirRaiz = rand(0, 1) === 0
    let nums = []
    let opsList = []
    let expr = ''
    let resultado = 0

    // Generar números (1-40)
    const count = rand(3, 4)
    for (let i = 0; i < count; i++) {
      nums.push(rand(1, 40))
    }

    // Generar operadores (incluyendo raíz)
    for (let i = 0; i < count - 1; i++) {
      opsList.push(ops.imposible[rand(0, incluirRaiz ? 4 : 3)])
    }

    // Si incluye raíz, reemplazar un número por √(cuadrado perfecto)
    let numsFinal = [...nums]
    if (incluirRaiz) {
      const idx = rand(0, nums.length - 1)
      const base = rand(2, 10)
      const cuadrado = base * base
      numsFinal[idx] = Math.sqrt(cuadrado)
      // Guardar el cuadrado para mostrarlo
      expr = nums.map((n, i) => {
        if (i === idx) return `√${cuadrado}`
        return n.toString()
      }).join(' ')
      // Reemplazar el operador anterior para que tenga sentido visual
      // Pero mejor reconstruimos la expresión
    }

    // Si no incluye raíz, construir normal
    if (!incluirRaiz) {
      expr = nums[0].toString()
      for (let i = 0; i < opsList.length; i++) {
        expr += ` ${opsList[i]} ${nums[i + 1]}`
      }
    } else {
      // Reconstruir con la raíz en el lugar correcto
      let exprParts = []
      let raizIdx = -1
      for (let i = 0; i < nums.length; i++) {
        if (i === raizIdx) {
          exprParts.push(`√${cuadrado}`)
        } else {
          exprParts.push(nums[i].toString())
        }
      }
      expr = exprParts[0]
      for (let i = 0; i < opsList.length; i++) {
        expr += ` ${opsList[i]} ${exprParts[i + 1]}`
      }
    }

    // Calcular resultado (con prioridad)
    let values = [...numsFinal]
    let operators = [...opsList]
    let i = 0
    while (i < operators.length) {
      const op = operators[i]
      if (op === '×' || op === '÷') {
        if (op === '×') {
          values[i] = values[i] * values[i + 1]
        } else {
          values[i] = values[i] / values[i + 1]
        }
        values.splice(i + 1, 1)
        operators.splice(i, 1)
      } else {
        i++
      }
    }
    resultado = values[0]
    for (let i = 0; i < operators.length; i++) {
      if (operators[i] === '+') resultado += values[i + 1]
      else resultado -= values[i + 1]
    }

    return { problema: expr, respuesta: a1Decimal(resultado) }
  },

  // ==================== IMPOSIBLE2 ====================
  // Combina TODO: suma, resta, multiplicación, división, raíz, potencias, decimales
  imposible2: () => {
    // Decidir si incluir cada elemento
    const incluirRaiz = rand(0, 1) === 0
    const incluirPotencia = rand(0, 1) === 0
    const incluirDecimal = rand(0, 1) === 0

    // Generar números (enteros o decimales)
    const count = rand(3, 4)
    let nums = []
    let numsFinal = []
    let exprParts = []

    for (let i = 0; i < count; i++) {
      if (incluirDecimal && rand(0, 1) === 0) {
        nums.push(randDecimal(1, 20))
      } else {
        nums.push(rand(1, 30))
      }
    }

    // Generar operadores
    let opsList = []
    for (let i = 0; i < count - 1; i++) {
      opsList.push(ops.imposible2[rand(0, incluirRaiz ? 4 : 3)])
    }

    // Construir expresión con elementos especiales
    numsFinal = [...nums]
    let cuadrado = 0
    let raizIdx = -1
    let potenciaIdx = -1

    if (incluirRaiz) {
      raizIdx = rand(0, nums.length - 1)
      const base = rand(2, 10)
      cuadrado = base * base
      numsFinal[raizIdx] = Math.sqrt(cuadrado)
    }

    if (incluirPotencia) {
      potenciaIdx = rand(0, nums.length - 1)
      // Si coincide con raíz, no la pisamos
      if (potenciaIdx === raizIdx) {
        potenciaIdx = (potenciaIdx + 1) % nums.length
      }
      const base = nums[potenciaIdx]
      const exp = rand(2, 3)
      numsFinal[potenciaIdx] = Math.pow(base, exp)
    }

    // Construir expresión visual
    for (let i = 0; i < nums.length; i++) {
      let display = nums[i].toString()
      if (i === raizIdx) {
        display = `√${cuadrado}`
      } else if (i === potenciaIdx) {
        display = `${nums[i]}²`
      }
      exprParts.push(display)
    }

    let expr = exprParts[0]
    for (let i = 0; i < opsList.length; i++) {
      expr += ` ${opsList[i]} ${exprParts[i + 1]}`
    }

    // Calcular resultado (con prioridad)
    let values = [...numsFinal]
    let operators = [...opsList]
    let i = 0
    while (i < operators.length) {
      const op = operators[i]
      if (op === '×' || op === '÷') {
        if (op === '×') {
          values[i] = values[i] * values[i + 1]
        } else {
          values[i] = values[i] / values[i + 1]
        }
        values.splice(i + 1, 1)
        operators.splice(i, 1)
      } else {
        i++
      }
    }
    let resultado = values[0]
    for (let i = 0; i < operators.length; i++) {
      if (operators[i] === '+') resultado += values[i + 1]
      else resultado -= values[i + 1]
    }

    return { problema: expr, respuesta: a1Decimal(resultado) }
  }
}

// ============================================================
// 3. GENERAR 50 PROBLEMAS POR DIFICULTAD
// ============================================================

const generarBanco = (dificultad) => {
  const generador = generadores[dificultad]
  if (!generador) return []
  const banco = []
  for (let i = 0; i < 50; i++) {
    let intentos = 0
    let problemaObj
    do {
      problemaObj = generador()
      intentos++
    } while (intentos < 20 && (isNaN(problemaObj.respuesta) || !isFinite(problemaObj.respuesta)))
    banco.push(problemaObj)
  }
  return banco
}

// ============================================================
// 4. BANCOS DE PROBLEMAS (50 cada uno)
// ============================================================

const bancos = {
  facil: generarBanco('facil'),
  medio: generarBanco('medio'),
  dificil: generarBanco('dificil'),
  imposible: generarBanco('imposible'),
  imposible2: generarBanco('imposible2')
}

// ============================================================
// 5. COMANDOS
// ============================================================

global.math = global.math || {}

const dificultadesValidas = ['facil', 'medio', 'dificil', 'imposible', 'imposible2']

async function run({ msg, sock, args, command, usedPrefix: prefix }) {
  const chatId = msg.chat
  const db2 = await db.getChat(msg.chat)
  const user = await db.getUser(msg.sender)
  const juego = global.math[chatId]

  if (db2.adminonly || !db2.rpg) {
    return msg.reply(mess.comandooff)
  }

  // ============================================================
  // COMANDO: responder
  // ============================================================
  if (command === 'responder') {
    if (!juego?.juegoActivo) return

    const quotedId = msg.quoted?.key?.id || msg.quoted?.id || msg.quoted?.stanzaId
    if (quotedId !== juego.problemMessageId) return

    const respuestaUsuarioRaw = args[0]
    if (!respuestaUsuarioRaw) {
      return sock.reply(chatId, `《✤》 Escribe tu respuesta con *1 decimal* (ej: 53.5).`, msg)
    }

    const limpio = respuestaUsuarioRaw.trim().replace(',', '.').replace(/\s/g, '')
    const respuestaUsuarioNum = parseFloat(limpio)

    if (isNaN(respuestaUsuarioNum)) {
      return sock.reply(chatId, `《✤》 Responde con un número válido (ej: 53.5 o 53,5).`, msg)
    }

    const userResp = a1Decimal(respuestaUsuarioNum)
    const correcta = juego.respuesta

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const primaryBotId = db2.primaryBot

    if (!primaryBotId || primaryBotId === botId) {
      if (userResp === correcta) {
        const expaleatorio = Math.floor(Math.random() * 50) + 10
        user.exp += expaleatorio
        await db.updateUser(msg.sender, 'exp', user.exp)
        clearTimeout(juego.tiempoLimite)
        delete global.math[chatId]
        return sock.reply(chatId, `✅ Respuesta correcta.\n> *Ganaste ›* ${expaleatorio} Exp`, msg)
      } else {
        juego.intentos += 1
        if (juego.intentos >= 3) {
          clearTimeout(juego.tiempoLimite)
          delete global.math[chatId]
          return sock.reply(chatId, `《✤》 Te quedaste sin intentos. La respuesta era: *${a1DecimalStr(correcta)}*`, msg)
        } else {
          const restantes = 3 - juego.intentos
          return sock.reply(chatId, `《✤》 Incorrecto. Te quedan ${restantes} intentos.`, msg)
        }
      }
    }
    return
  }

  // ============================================================
  // COMANDO: math
  // ============================================================
  if (command === 'math') {
    if (juego?.juegoActivo) {
      return sock.reply(chatId, '✿ Ya hay un juego activo. Termínalo primero.', msg)
    }

    const dificultad = args[0]?.toLowerCase()
    if (!dificultadesValidas.includes(dificultad)) {
      return sock.reply(
        chatId,
        `❀ Dificultades válidas: *facil, medio, dificil, imposible, imposible2*\n\n` +
        `Ejemplo: *${prefix}math facil*`,
        msg
      )
    }

    const banco = bancos[dificultad]
    if (!banco || banco.length === 0) {
      return sock.reply(chatId, '❀ No hay problemas para esta dificultad. Intenta otra.', msg)
    }

    const problemaObj = banco[rand(0, banco.length - 1)]
    const { problema, respuesta } = problemaObj

    const problemMessage = await sock.reply(
      chatId,
      `「✎」 *Resuelve este problema* (usa 1 decimal):\n\n` +
      `> ❖ *${problema}*\n\n` +
      `_✿ Responde con: *${prefix}responder [tu respuesta]*_\n` +
      `_Ejemplo: ${prefix}responder 53.5_\n` +
      `_Tienes 3 intentos y 1 minuto._`,
      msg
    )

    global.math[chatId] = {
      juegoActivo: true,
      problema,
      respuesta: respuesta,
      intentos: 0,
      timeout: Date.now() + 60000,
      problemMessageId: problemMessage.key?.id,
      tiempoLimite: setTimeout(() => {
        if (global.math[chatId]?.juegoActivo) {
          const respCorrecta = global.math[chatId].respuesta
          delete global.math[chatId]
          sock.reply(chatId, `⏰ Tiempo agotado. La respuesta era: *${a1DecimalStr(respCorrecta)}*`, msg)
        }
      }, 60000)
    }
  }
}

export default {
  command: ['math', 'matematicas', 'responder'],
  category: 'rpg',
  run
}