/**
 * Utilidades de encoding para dumps SQL territoriales.
 *
 * Los archivos prisma/datos-territoriales.sql y datos-users.sql están en UTF-8
 * (sin BOM), pero el contenido ya trae corrupción histórica:
 *
 * 1) datos-territoriales.sql
 *    Bytes originales en CP850 (DOS latino / dumps MySQL viejos) se interpretaron
 *    como Latin-1/Windows-1252 y luego se guardaron como UTF-8.
 *    Evidencia (hex en el .sql):
 *      "Bø EL TRIANGULO" → bytes C3 B8 (UTF-8 de ø). En CP850, 0xF8 = °.
 *      "CA¥AVERAL"       → bytes C2 A5 (UTF-8 de ¥). En CP850, 0xA5 = Ñ.
 *    Otros: §→º, µ→Á, Ö→Í, ¦→ª, à→Ó, U+0090→É, ï→´.
 *
 * 2) datos-users.sql
 *    UTF-8 doblado (mojibake clásico): p.ej. "MontaÃ±ez" (C3 83 C2 B1) en lugar
 *    de "Montañez" (C3 B1). Se repara reinterpretando Latin-1 → UTF-8.
 *
 * NO aplicar un recode ciego de todo el archivo a CP850: convive texto ya
 * correcto (° Ñ Á Ó é) con mojibake. Solo se remapean codepoints inequívocos
 * o se detecta UTF-8 doblado por el telltale "Ã".
 */

/** Lee un SQL como UTF-8, tolera BOM UTF-8. */
export function leerArchivoSqlUtf8(ruta: string, fsLike: { readFileSync: typeof import('node:fs').readFileSync }): string {
  const buf = fsLike.readFileSync(ruta);
  let offset = 0;
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    offset = 3;
  }
  return buf.toString('utf8', offset);
}

/**
 * Codepoints que en este dump son Latin-1/CP1252 de un byte CP850,
 * nunca caracteres legítimos del dominio (nombres de barrios/agentes AR).
 * No incluye ° Ñ Á Ó É é ya correctos, ni NBSP U+00A0.
 */
const CP850_COMO_LATIN1: Record<string, string> = {
  '\u00F8': '\u00B0', // ø → °
  '\u00A5': '\u00D1', // ¥ → Ñ
  '\u00A7': '\u00BA', // § → º
  '\u00B5': '\u00C1', // µ → Á
  '\u00D6': '\u00CD', // Ö → Í
  '\u00A6': '\u00AA', // ¦ → ª
  '\u00E0': '\u00D3', // à → Ó
  '\u0090': '\u00C9', // C1 → É
  '\u00EF': '\u00B4', // ï → ´
};

const CP850_TELLTALE = /[\u00F8\u00A5\u00A7\u00B5\u00D6\u00A6\u00E0\u0090\u00EF]/;

/**
 * Repara mojibake CP850→Latin-1 en un texto territorial.
 * Además: en tokens en MAYÚSCULAS, é (U+00E9) suele ser Ú CP850 (p.ej. JESéS).
 * No toca "José" / minúsculas ya correctas.
 */
export function repararMojibakeCp850ComoLatin1(texto: string): string {
  if (!texto) return texto;

  let out = '';
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    const mapped = CP850_COMO_LATIN1[ch];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    // é mayúscula de contexto → Ú (byte CP850 0xE9)
    if (
      ch === '\u00E9' &&
      i > 0 &&
      i + 1 < texto.length &&
      esMayusculaAscii(texto[i - 1]) &&
      esMayusculaAscii(texto[i + 1])
    ) {
      out += '\u00DA'; // Ú
      continue;
    }
    out += ch;
  }
  return out;
}

function esMayusculaAscii(ch: string): boolean {
  return ch >= 'A' && ch <= 'Z';
}

/** True si el texto parece traer mojibake CP850 típico de este dump. */
export function tieneMojibakeCp850(texto: string): boolean {
  return CP850_TELLTALE.test(texto);
}

/**
 * Repara UTF-8 doblado (Ã± → ñ, Ã© → é, etc.).
 * Solo si aparece el telltale Ã (o C1 0x81–0x9F tras Ã), para no tocar
 * nombres ya correctos con ñ/é reales.
 */
export function repararUtf8Doblado(texto: string): string {
  if (!texto || !/Ã|[\u0080-\u009F]/.test(texto)) {
    return texto;
  }
  try {
    const bytes = Buffer.from(texto, 'latin1');
    const decoded = bytes.toString('utf8');
    if (decoded.includes('\uFFFD')) {
      return texto;
    }
    // Evitar "reparar" texto que no era UTF-8 doblado (pocos cambios raros)
    if (decoded === texto) {
      return texto;
    }
    return decoded;
  } catch {
    return texto;
  }
}

/** Aplica la reparación que corresponda según el origen del dump. */
export function repararTextoTerritorial(texto: string): string {
  return repararMojibakeCp850ComoLatin1(texto);
}

export function repararTextoUsuarios(texto: string): string {
  return repararUtf8Doblado(texto);
}
