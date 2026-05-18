// src/utils/contentFilter.js

const PALABRAS_PROHIBIDAS = [
  // ── Español España ────────────────────────────────────────────────────────
  "puta", "puto", "perra", "perro", "hijueputa", "hp", "malparido", "malparida",
  "gonorrea", "hijodeput", "marica", "maricon", "maricón", "maldita", "maldito",
  "mierda", "culo", "coño", "verga", "pene", "polla", "pija", "concha",
  "pendejo", "pendeja", "estupido", "estúpido", "idiota", "imbecil", "imbécil",
  "tarado", "tarada", "subnormal", "retrasado", "retrasada", "cabron", "cabrón",
  "hijo de puta", "hijo de p", "joder", "follar", "zorra", "zorras",
  "prostituta", "prostitucion", "violacion", "violación", "violar", "violador",
  "matar", "matate", "matense", "muérete", "muerate", "muerte a",
  "te voy a matar", "voy a matarte", "te mato", "asesino", "asesina", "asesinar",
  "sexo oral", "pornografia", "pornografía", "porno", "desnudo", "desnuda",
  "masturbacion", "masturbación", "masturbar", "orgasmo", "eyacular",
  "hdp", "hpta", "hijodeputa", "hp",

  // ── Español Latinoamérica general ─────────────────────────────────────────
  "chingar", "chingada", "chingado", "pinche", "culero", "culera",
  "mamada", "mamadas", "mamar", "culear", "culeado", "culeada",
  "huevon", "huevona", "huevón", "güevon", "güevona",
  "boludo", "boluda", "pelotudo", "pelotuda",
  "mogolico", "mogólico", "pajero", "pajera",
  "tetona", "culiada", "culiado",
  "gonorrea", "gonorreo",
  "hijuemadre", "hijuemadre",
  "conchatumadre", "conchatumare",
  "reconcha", "reconchuda",

  // ── Colombia ──────────────────────────────────────────────────────────────
  "hp", "hpta", "hijueputa", "hijueputas", "malparido", "malparida",
  "gonorrea", "gonorreo", "man gonorrea", "gonorreas",
  "guache", "sapo", "sapas", "sapos",
  "marica culero", "culicagado", "culicagada",
  "pirobo", "piroba", "pirobos", "pirobas",
  "cagada", "cagado", "recagado", "recagada",
  "mondá", "monda", "mondas",
  "güevón", "güevona",
  "mamagüevo", "mamahuevo", "mamaguevo",
  "chucha", "chuchas",
  "verraco", "berraco", "berracas",
  "hijuemadre", "jueputa", "jueputas", "juepucha",
  "maluco", "maluca",

  // ── México ────────────────────────────────────────────────────────────────
  "chinga tu madre", "chingada madre", "pinche cabron", "pinche cabrón",
  "putamadre", "puta madre", "hijo de su madre",
  "cabrón", "cabrones", "cabronas",
  "culero", "culeros", "culeras",
  "mamón", "mamona", "mamonada",
  "pendejo", "pendejos", "pendejas",
  "wey pendejo", "mamon", "mamones",
  "chingón", "chingona",
  "cogelona", "cogelon",
  "metiche", "chismoso",
  "ojete", "ojetes",

  // ── Argentina / Uruguay ───────────────────────────────────────────────────
  "boludo", "boluda", "boludos", "boludas",
  "pelotudo", "pelotuda", "pelotudos", "pelotudas",
  "forro", "forra", "forros", "forras",
  "cagon", "cagón", "cagona", "cagonas",
  "hdp", "hijo de puta", "hija de puta",
  "conchuda", "conchudo",
  "la concha de tu madre", "la concha",
  "sos un cagón",
  "gil", "giles", "gilas",
  "ortiva", "ortivas",
  "chabón", "chabon",

  // ── Venezuela ─────────────────────────────────────────────────────────────
  "coñoetumadre", "coño e tu madre", "coño de tu madre",
  "pajuo", "pajua", "pajuos",
  "mamaguevo", "mamabicho", "mamaguevos",
  "singao", "singada", "singar",
  "arrecho", "arrecha",
  "vaina", "vainas",
  "pendejo", "pendejas",
  "lambucio", "lambuciar",

  // ── Chile ─────────────────────────────────────────────────────────────────
  "hueon", "hueón", "huevón", "huevona",
  "culiao", "culiado", "culiada",
  "weon", "weón", "weona",
  "maraco", "maraca",
  "conchatumadre", "concha tu madre",
  "fome", "fomes",
  "aweonao", "aweonada",
  "ctm", "la ctm",
  "chucha tu madre",

  // ── Perú ──────────────────────────────────────────────────────────────────
  "conchatumadre", "concha tu madre",
  "carajo", "carajos",
  "cojudo", "cojuda", "cojudos", "cojudas",
  "imbécil", "imbecil",
  "reculas", "reclame",
  "awanta", "maldito",
  "picha", "pichoso",
  "huevada", "huevadas",

  // ── Ecuador ───────────────────────────────────────────────────────────────
  "hijueputa", "malcriado", "malcriada",
  "pariguayo", "pariguaya",
  "mamar", "mamando",
  "cuqui", "cuquismo",
  "mondá", "mondas",
  "cojudo", "cojuda",

  // ── República Dominicana / Caribe ─────────────────────────────────────────
  "coño", "coños",
  "cabrón", "cabrones",
  "jodedera", "jodienda",
  "mamaguevo", "mamaguevos",
  "volao", "volada",
  "bicho", "bichos",
  "maldito", "maldita",
  "prieto",

  // ── Inglés ────────────────────────────────────────────────────────────────
  "fuck", "fucker", "fucking", "fucked", "fck", "f*ck", "f**k",
  "shit", "sh1t", "bullshit", "sh!t",
  "bitch", "b1tch", "b**ch", "b!tch",
  "bastard", "asshole", "ass", "a$$", "a**",
  "dick", "d1ck", "d**k", "cock", "c0ck",
  "pussy", "cunt", "twat",
  "whore", "slut",
  "nigger", "nigga",
  "kill yourself", "kys", "kill you", "gonna kill", "i will kill", "ill kill",
  "rape", "rapist", "raping",
  "porn", "pornography", "nude", "naked",
  "masturbate", "jerk off", "cum", "cumshot",
  "blowjob", "handjob",
  "faggot", "fag", "retard", "moron", "dumbass", "dipshit",

  // ── Portugués ─────────────────────────────────────────────────────────────
  "porra", "caralho", "merda", "foda", "fodase", "foda-se",
  "viado", "viadinho", "buceta", "cu", "pau",
  "piroca", "putaria", "vai se foder", "filho da puta",
  "fdp", "morte a",

  // ── Francés ───────────────────────────────────────────────────────────────
  "merde", "putain", "connard", "connasse", "salope",
  "enculé", "encule", "fils de pute", "nique",
  "baiser", "va te faire foutre",

  // ── Alemán ────────────────────────────────────────────────────────────────
  "scheiße", "scheisse", "scheiß", "ficken", "wichser",
  "hurensohn", "arschloch", "arsch", "schlampe",
  "nutte", "fotze", "kacke",

  // ── Italiano ──────────────────────────────────────────────────────────────
  "cazzo", "vaffanculo", "stronzo", "stronza",
  "troia", "puttana", "figa", "minchia",
];

// Normaliza texto quitando acentos y pasando a minúsculas
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*!@#$]/g, ""); // ignora sustituciones comunes con símbolos
}

/**
 * Verifica si el texto contiene contenido prohibido.
 * @param {string} texto
 * @returns {{ prohibido: boolean, palabra: string|null }}
 */
export function verificarContenido(texto) {
  if (!texto || !texto.trim()) return { prohibido: false, palabra: null };

  const textoNorm = normalizar(texto);

  for (const palabra of PALABRAS_PROHIBIDAS) {
    const palabraNorm = normalizar(palabra);
    if (textoNorm.includes(palabraNorm)) {
      return { prohibido: true, palabra };
    }
  }

  return { prohibido: false, palabra: null };
}

export const MENSAJE_POLITICA =
  "⚠️ Tu mensaje viola nuestras políticas de comunidad. " +
  "No permitimos lenguaje ofensivo, contenido sexual o incitación a la violencia. " +
  "Por favor, mantén un tono respetuoso.";