import * as pako from 'pako';

export interface ExtractedPdf {
  lines: string[];
  text: string;
  pageCount: number;
  rawStreamsCount: number;
}

/**
 * Unescape PDF literal string bytes taking escaped parentheses, backslashes, and octal codes into account.
 */
export function unescapePdfString(raw: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '\\' && i + 1 < raw.length) {
      i++;
      const c = raw[i];
      if (c === 'n') out.push(10);
      else if (c === 'r') out.push(13);
      else if (c === 't') out.push(9);
      else if (c === 'b') out.push(8);
      else if (c === 'f') out.push(12);
      else if (c === '(') out.push(40);
      else if (c === ')') out.push(41);
      else if (c === '\\') out.push(92);
      else if (c >= '0' && c <= '7') {
        let oct = c;
        if (i + 1 < raw.length && raw[i + 1] >= '0' && raw[i + 1] <= '7') {
          oct += raw[++i];
          if (i + 1 < raw.length && raw[i + 1] >= '0' && raw[i + 1] <= '7') {
            oct += raw[++i];
          }
        }
        out.push(parseInt(oct, 8));
      } else {
        out.push(c.charCodeAt(0));
      }
    } else {
      out.push(raw.charCodeAt(i));
    }
  }
  return out;
}

/**
 * Parse an Adobe /ToUnicode CMap stream into a character code -> Unicode string lookup map.
 */
export function parseCMap(cmapStr: string): Map<number, string> {
  const map = new Map<number, string>();

  // Match beginbfchar ... endbfchar
  const charRegex = /beginbfchar([\s\S]*?)endbfchar/g;
  let cm: RegExpExecArray | null;
  while ((cm = charRegex.exec(cmapStr)) !== null) {
    const lines = cm[1].trim().split(/\r?\n/);
    for (const l of lines) {
      const parts = l.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (parts) {
        const src = parseInt(parts[1], 16);
        const dstHex = parts[2];
        let decoded = '';
        const step = dstHex.length % 4 === 0 ? 4 : 2;
        for (let j = 0; j < dstHex.length; j += step) {
          decoded += String.fromCharCode(parseInt(dstHex.slice(j, j + step), 16));
        }
        map.set(src, decoded);
      }
    }
  }

  // Match beginbfrange ... endbfrange
  const rangeRegex = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((cm = rangeRegex.exec(cmapStr)) !== null) {
    const lines = cm[1].trim().split(/\r?\n/);
    for (const l of lines) {
      const parts = l.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (parts) {
        const start = parseInt(parts[1], 16);
        const end = parseInt(parts[2], 16);
        let dst = parseInt(parts[3], 16);
        for (let i = start; i <= end; i++) {
          map.set(i, String.fromCharCode(dst++));
        }
      }
    }
  }

  return map;
}

/**
 * Convert Base64 string to Uint8Array in standard JS/React Native environment.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, '').replace(/[\r\n\s]+/g, '');

  if (typeof atob === 'function') {
    const binary = atob(cleanBase64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = cleanBase64.length * 0.75;
  if (cleanBase64.endsWith('==')) bufferLength -= 2;
  else if (cleanBase64.endsWith('=')) bufferLength -= 1;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const enc1 = lookup[cleanBase64.charCodeAt(i)];
    const enc2 = lookup[cleanBase64.charCodeAt(i + 1)];
    const enc3 = lookup[cleanBase64.charCodeAt(i + 2)];
    const enc4 = lookup[cleanBase64.charCodeAt(i + 3)];

    bytes[p++] = (enc1 << 2) | (enc2 >> 4);
    if (cleanBase64[i + 2] !== '=') bytes[p++] = ((enc2 & 15) << 4) | (enc3 >> 2);
    if (cleanBase64[i + 3] !== '=') bytes[p++] = ((enc3 & 3) << 6) | enc4;
  }

  return bytes;
}

/**
 * Extract text from a PDF given a Uint8Array, Buffer, or Latin-1 string.
 */
export function extractPdfText(input: Uint8Array | string): ExtractedPdf {
  let content: string;
  if (typeof input === 'string') {
    if (!input.startsWith('%PDF') && (input.length % 4 === 0 || input.includes('base64'))) {
      const bytes = base64ToUint8Array(input);
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      content = str;
    } else {
      content = input;
    }
  } else {
    let str = '';
    for (let i = 0; i < input.length; i++) {
      str += String.fromCharCode(input[i]);
    }
    content = str;
  }

  if (!content.includes('%PDF')) {
    throw new Error('Invalid PDF format: %PDF header not found.');
  }

  const objStreams = new Map<number, string>();
  const objContents = new Map<number, string>();

  // Extract all PDF objects
  const objRegex = /(\d+)\s+(\d+)\s+obj([\s\S]*?)endobj/g;
  let m: RegExpExecArray | null;
  while ((m = objRegex.exec(content)) !== null) {
    const id = parseInt(m[1], 10);
    objContents.set(id, m[3]);

    const sMatch = m[3].match(/stream\r?\n([\s\S]*?)\r?\nendstream/);
    if (sMatch) {
      const rawStr = sMatch[1];
      const rawBytes = new Uint8Array(rawStr.length);
      for (let i = 0; i < rawStr.length; i++) {
        rawBytes[i] = rawStr.charCodeAt(i);
      }

      try {
        const pakoObj = pako as Record<string, any>;
        const inflateFn = pakoObj.inflate || pakoObj['default']?.inflate;
        const inflated = inflateFn(rawBytes);
        let dec = '';
        for (let i = 0; i < inflated.length; i++) {
          dec += String.fromCharCode(inflated[i]);
        }
        objStreams.set(id, dec);
      } catch {
        try {
          const pakoObj = pako as Record<string, any>;
          const inflateRawFn = pakoObj.inflateRaw || pakoObj['default']?.inflateRaw;
          const rawInflated = inflateRawFn(rawBytes);
          let dec = '';
          for (let i = 0; i < rawInflated.length; i++) {
            dec += String.fromCharCode(rawInflated[i]);
          }
          objStreams.set(id, dec);
        } catch {
          objStreams.set(id, rawStr);
        }
      }
    }
  }

  // Parse all ToUnicode CMaps
  const cmaps = new Map<number, Map<number, string>>();
  for (const [id, stream] of objStreams.entries()) {
    if (
      stream.includes('begincmap') ||
      stream.includes('beginbfrange') ||
      stream.includes('beginbfchar')
    ) {
      cmaps.set(id, parseCMap(stream));
    }
  }

  // Map font resource names to CMaps
  const fontToCMap = new Map<string, Map<number, string>>();
  for (const [, body] of objContents.entries()) {
    const fontBlock = body.match(/\/Font\s*<<([\s\S]*?)>>/);
    if (fontBlock) {
      const fontMatches = fontBlock[1].matchAll(/\/(\w+)\s+(\d+)\s+0\s+R/g);
      for (const fm of fontMatches) {
        const fontName = '/' + fm[1];
        const fontObjId = parseInt(fm[2], 10);
        const fontObjBody = objContents.get(fontObjId) || '';
        const tuMatch = fontObjBody.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
        if (tuMatch) {
          const tuId = parseInt(tuMatch[1], 10);
          if (cmaps.has(tuId)) {
            fontToCMap.set(fontName, cmaps.get(tuId)!);
          }
        }
      }
    }
  }

  let pageCount = 0;
  for (const [, body] of objContents.entries()) {
    if (body.includes('/Type/Page') || body.includes('/Type /Page')) {
      pageCount++;
    }
  }

  // Decode text with persistent stream-level font tracking across BT blocks
  const textLines: string[] = [];

  for (const [, stream] of objStreams.entries()) {
    if (!stream.includes('BT')) continue;

    let streamFont = '';
    const sfm = stream.match(/\/(\w+)\s+[\d.]+\s+Tf/);
    if (sfm) streamFont = '/' + sfm[1];

    const btMatches = stream.match(/BT[\s\S]*?ET/g) || [];
    for (const bt of btMatches) {
      let curFont = streamFont;
      const fontM = bt.match(/\/(\w+)\s+[\d.]+\s+Tf/);
      if (fontM) curFont = '/' + fontM[1];
      const cmap = fontToCMap.get(curFont);

      let curBlock = '';

      // 1. Literal strings in Tj: (string) Tj
      const tjMatches = bt.matchAll(/\(([\s\S]*?)\)\s*Tj/g);
      for (const tj of tjMatches) {
        const codes = unescapePdfString(tj[1]);
        for (const c of codes) {
          curBlock += cmap && cmap.has(c) ? cmap.get(c) : (c >= 32 && c <= 126 ? String.fromCharCode(c) : '');
        }
      }

      // 2. Hex strings in Tj: <hex> Tj
      const hexTjMatches = bt.matchAll(/<([0-9a-fA-F]+)>\s*Tj/g);
      for (const ht of hexTjMatches) {
        const hex = ht[1];
        const step = hex.length % 4 === 0 ? 4 : 2;
        for (let j = 0; j < hex.length; j += step) {
          const code = parseInt(hex.slice(j, j + step), 16);
          curBlock += cmap && cmap.has(code) ? cmap.get(code) : (code >= 32 && code <= 126 ? String.fromCharCode(code) : '');
        }
      }

      // 3. Array strings in TJ: [...] TJ (can contain both (string) and <hex>)
      const arrayMatches = bt.matchAll(/\[([\s\S]*?)\]\s*TJ/g);
      for (const arr of arrayMatches) {
        const inner = arr[1];

        // Parse literal strings inside array
        let inStr = false;
        let strBuf = '';
        for (let i = 0; i < inner.length; i++) {
          const ch = inner[i];
          if (ch === '(' && (i === 0 || inner[i - 1] !== '\\')) {
            inStr = true;
            strBuf = '';
          } else if (inStr && ch === ')' && (i === 0 || inner[i - 1] !== '\\')) {
            inStr = false;
            const codes = unescapePdfString(strBuf);
            for (const c of codes) {
              curBlock += cmap && cmap.has(c) ? cmap.get(c) : (c >= 32 && c <= 126 ? String.fromCharCode(c) : '');
            }
          } else if (inStr) {
            strBuf += ch;
          }
        }

        // Parse hex strings inside array
        const hexArrMatches = inner.matchAll(/<([0-9a-fA-F]+)>/g);
        for (const hm of hexArrMatches) {
          const hex = hm[1];
          const step = hex.length % 4 === 0 ? 4 : 2;
          for (let j = 0; j < hex.length; j += step) {
            const code = parseInt(hex.slice(j, j + step), 16);
            curBlock += cmap && cmap.has(code) ? cmap.get(code) : (code >= 32 && code <= 126 ? String.fromCharCode(code) : '');
          }
        }
      }

      const trimmed = curBlock.trim();
      if (trimmed) {
        textLines.push(trimmed);
      }
    }
  }

  return {
    lines: textLines,
    text: textLines.join('\n'),
    pageCount: Math.max(1, pageCount),
    rawStreamsCount: objStreams.size,
  };
}
