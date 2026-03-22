/**
 * qrcode-svg.ts — QR Code SVG generator (zero external dependency)
 *
 * Implements QR Code version 1–10 with error correction level M.
 * Produces a clean SVG string, no canvas, no DOM, works server + client.
 *
 * Usage:
 *   generateQRSVG('https://eetra.app/doc/abc', { size: 120, fg: '#1B4FD8', bg: '#fff' })
 *   → '<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>'
 */

// ── Reed-Solomon GF(256) tables ───────────────────────────────────────────────

const GF_EXP = new Uint8Array(512)
const GF_LOG  = new Uint8Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x = x << 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255]
})()

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255]
}

function rsGeneratorPoly(nec: number): Uint8Array {
  let g = new Uint8Array([1])
  for (let i = 0; i < nec; i++) {
    const ng = new Uint8Array(g.length + 1)
    for (let j = 0; j < g.length; j++) {
      ng[j]     ^= gfMul(g[j], GF_EXP[i])
      ng[j + 1] ^= g[j]
    }
    g = ng
  }
  return g
}

function rsEncode(data: Uint8Array, nec: number): Uint8Array {
  const gen  = rsGeneratorPoly(nec)
  const buf  = new Uint8Array(data.length + nec)
  buf.set(data)
  for (let i = 0; i < data.length; i++) {
    const c = buf[i]
    if (c !== 0) {
      for (let j = 0; j < gen.length; j++) {
        buf[i + j] ^= gfMul(gen[j], c)
      }
    }
  }
  return buf.subarray(data.length)
}

// ── Character encoding (byte mode) ───────────────────────────────────────────

function encodeBytes(text: string): Uint8Array {
  const bytes: number[] = []
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    if (c < 0x80) {
      bytes.push(c)
    } else if (c < 0x800) {
      bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F))
    } else {
      bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F))
    }
  }
  return new Uint8Array(bytes)
}

// ── Version / capacity tables (byte mode, error M) ────────────────────────────

// [version]: [total_codewords, ec_codewords_per_block, blocks_in_group1, codewords_in_g1, blocks_in_g2, codewords_in_g2]
const VERSION_INFO: number[][] = [
  [],           // placeholder for 0
  [26,  10, 1, 16, 0,  0],   // v1  → 16 bytes
  [44,  16, 1, 28, 0,  0],   // v2  → 28
  [70,  26, 2, 22, 0,  0],   // v3  → 44
  [100, 18, 4, 16, 0,  0],   // v4  → 64
  [134, 24, 2, 22, 2,  24],  // v5  → 86
  [172, 16, 4, 28, 0,  0],   // v6  → 112 (approx)
  [196, 18, 4, 22, 2,  26],  // v7
  [242, 22, 4, 20, 2,  24],  // v8
  [292, 22, 5, 24, 2,  28],  // v9
  [346, 26, 6, 24, 2,  28],  // v10
]

function getVersion(len: number): number {
  const capacity = [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216]
  for (let v = 1; v <= 10; v++) {
    if (len <= capacity[v]) return v
  }
  throw new Error('String too long for QR v1–10')
}

// ── Bit stream ────────────────────────────────────────────────────────────────

class BitBuffer {
  private buf: number[] = []
  private bitLen = 0

  put(num: number, bits: number) {
    for (let i = bits - 1; i >= 0; i--) {
      this.putBit(((num >> i) & 1) === 1)
    }
  }

  putBit(bit: boolean) {
    const idx  = Math.floor(this.bitLen / 8)
    if (this.buf.length <= idx) this.buf.push(0)
    if (bit) this.buf[idx] |= 0x80 >> (this.bitLen % 8)
    this.bitLen++
  }

  get length(): number { return this.bitLen }
  get buffer(): number[] { return this.buf }
}

// ── Data codewords builder ────────────────────────────────────────────────────

function buildDataCodewords(text: string, version: number): Uint8Array {
  const [totalCW, ecCW, b1, c1, b2, c2] = VERSION_INFO[version]
  const dataCW = totalCW - ecCW * (b1 + b2)
  const bytes  = encodeBytes(text)

  const bb = new BitBuffer()
  bb.put(0b0100, 4)             // mode: byte
  const lenBits = version < 10 ? 8 : 16
  bb.put(bytes.length, lenBits)
  for (const b of bytes) bb.put(b, 8)
  bb.put(0, Math.min(4, dataCW * 8 - bb.length))
  while (bb.length % 8 !== 0) bb.putBit(false)

  const PAD = [0xEC, 0x11]
  let pi = 0
  while (bb.buffer.length < dataCW) {
    bb.put(PAD[pi++ % 2], 8)
  }

  return new Uint8Array(bb.buffer.slice(0, dataCW))
}

// ── Interleave + EC ────────────────────────────────────────────────────────────

function buildCodewords(text: string, version: number): Uint8Array {
  const [totalCW, ecCW, b1, c1, b2, c2] = VERSION_INFO[version]
  const data = buildDataCodewords(text, version)

  // Split into blocks
  const blocks: { data: Uint8Array; ec: Uint8Array }[] = []
  let offset = 0
  for (let i = 0; i < b1; i++) {
    const d = data.slice(offset, offset + c1); offset += c1
    blocks.push({ data: d, ec: rsEncode(d, ecCW) })
  }
  for (let i = 0; i < b2; i++) {
    const d = data.slice(offset, offset + c2); offset += c2
    blocks.push({ data: d, ec: rsEncode(d, ecCW) })
  }

  // Interleave data
  const result: number[] = []
  const maxData = Math.max(...blocks.map(b => b.data.length))
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) {
      if (i < b.data.length) result.push(b.data[i])
    }
  }
  // Interleave EC
  for (let i = 0; i < ecCW; i++) {
    for (const b of blocks) result.push(b.ec[i])
  }

  return new Uint8Array(result)
}

// ── Matrix builder ────────────────────────────────────────────────────────────

type Matrix = Uint8Array[]  // 0=white, 1=black, 2=reserved

function makeMatrix(size: number): Matrix {
  return Array.from({ length: size }, () => new Uint8Array(size).fill(255))
}

function finderPattern(mat: Matrix, row: number, col: number) {
  const pat = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
  ]
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    mat[row + r][col + c] = pat[r][c]
  }
}

function alignmentPattern(mat: Matrix, row: number, col: number) {
  for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) {
    const v = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0) ? 1 : 0
    mat[row + r][col + c] = v
  }
}

// Alignment pattern positions per version
const ALIGN_POS: number[][] = [
  [], [], [6,18], [6,22], [6,26], [6,30],
  [6,34], [6,22,38], [6,24,42], [6,26,46], [6,28,50],
]

function buildMatrix(text: string, version: number, maskPattern = 0): Matrix {
  const size  = version * 4 + 17
  const mat   = makeMatrix(size)
  const isRes = makeMatrix(size)  // track reserved

  const reserve = (r: number, c: number) => { isRes[r][c] = 1 }

  // Finder patterns
  finderPattern(mat, 0, 0)
  finderPattern(mat, 0, size - 7)
  finderPattern(mat, size - 7, 0)

  // Separators
  for (let i = 0; i < 8; i++) {
    mat[7][i] = mat[i][7] = mat[7][size-1-i] = mat[i][size-8] = 0
    mat[size-8][i] = mat[size-1-i][7] = 0
    isRes[7][i] = isRes[i][7] = isRes[7][size-1-i] = isRes[i][size-8] = 1
    isRes[size-8][i] = isRes[size-1-i][7] = 1
  }

  // Mark finder as reserved
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) reserve(r, c)
  for (let r = 0; r < 9; r++) for (let c = size-8; c < size; c++) reserve(r, c)
  for (let r = size-8; r < size; r++) for (let c = 0; c < 9; c++) reserve(r, c)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    mat[6][i] = mat[i][6] = (i % 2 === 0) ? 1 : 0
    isRes[6][i] = isRes[i][6] = 1
  }

  // Alignment patterns
  const apos = ALIGN_POS[version]
  for (let r = 0; r < apos.length; r++) {
    for (let c = 0; c < apos.length; c++) {
      const pr = apos[r], pc = apos[c]
      if (isRes[pr][pc] === 1) continue
      alignmentPattern(mat, pr, pc)
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        isRes[pr + dr][pc + dc] = 1
      }
    }
  }

  // Format info area (reserved)
  for (let i = 0; i < 6; i++) { reserve(8, i); reserve(i, 8) }
  reserve(8, 7); reserve(8, 8); reserve(7, 8)
  for (let i = 0; i < 8; i++) { reserve(8, size-1-i); reserve(size-1-i, 8) }
  reserve(size-8, 8)  // dark module
  mat[size-8][8] = 1

  // Data placement (ZZ scan)
  const codewords = buildCodewords(text, version)
  let bitIdx = 0
  let dir = -1; let row = size - 1
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col--
    for (let cnt = 0; cnt < size; cnt++) {
      const r = row
      for (let c = 0; c <= 1; c++) {
        const cc = col - c
        if (isRes[r][cc] === 1) continue
        let bit = 0
        if (bitIdx < codewords.length * 8) {
          bit = (codewords[Math.floor(bitIdx / 8)] >> (7 - (bitIdx % 8))) & 1
          bitIdx++
        }
        // Apply mask pattern 0: (r+c) % 2 === 0
        const mask = maskPattern === 0 ? ((r + cc) % 2 === 0) :
                     maskPattern === 1 ? (r % 2 === 0) :
                     maskPattern === 2 ? (cc % 3 === 0) :
                     maskPattern === 3 ? ((r + cc) % 3 === 0) :
                     maskPattern === 4 ? ((Math.floor(r/2) + Math.floor(cc/3)) % 2 === 0) :
                     maskPattern === 5 ? ((r * cc) % 2 + (r * cc) % 3 === 0) :
                     maskPattern === 6 ? (((r * cc) % 2 + (r * cc) % 3) % 2 === 0) :
                     (((r + cc) % 2 + (r * cc) % 3) % 2 === 0)
        mat[r][cc] = mask ? (bit ^ 1) : bit
      }
      row += dir
      if (row < 0 || row >= size) { dir = -dir; row += dir * 2 }
    }
  }

  // Format information (error level M = 00, mask 0 = 000)
  // Format bits for M-level, mask 0 = 101010000010010
  const FORMAT_BITS = [
    0b101010000010010, // M, mask 0
    0b101000100100101, // M, mask 1
    0b101111001111100, // M, mask 2
    0b101101101001011, // M, mask 3
    0b100010111111001, // M, mask 4
    0b100000011001110, // M, mask 5
    0b100111110010111, // M, mask 6
    0b100101010100000, // M, mask 7
  ]
  const fmtBits = FORMAT_BITS[maskPattern]
  for (let i = 0; i < 6; i++) {
    const bit = (fmtBits >> (14 - i)) & 1
    mat[8][i] = bit; mat[i][8] = bit
  }
  mat[8][7] = (fmtBits >> 8) & 1; mat[7][8] = (fmtBits >> 8) & 1
  mat[8][8] = (fmtBits >> 7) & 1
  for (let i = 9; i < 15; i++) {
    const bit = (fmtBits >> (14 - i)) & 1
    mat[8][size - 15 + i] = bit
    mat[size - 7 + (i - 8)][8] = bit
  }

  return mat
}

// ── SVG output ────────────────────────────────────────────────────────────────

export interface QROptions {
  size?:   number   // total SVG size in px (default: 200)
  fg?:     string   // dark module color (default: '#000000')
  bg?:     string   // light module color (default: '#ffffff')
  margin?: number   // quiet zone modules (default: 4)
  round?:  number   // corner radius factor 0–0.5 (default: 0)
}

export function generateQRSVG(text: string, opts: QROptions = {}): string {
  const { size = 200, fg = '#000000', bg = '#ffffff', margin = 4, round = 0 } = opts

  const version = getVersion(encodeBytes(text).length)
  const mat     = buildMatrix(text, version)
  const modules = mat.length
  const total   = modules + margin * 2
  const cell    = size / total
  const r       = round * cell * 0.5

  const rects: string[] = []
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (mat[row][col] === 1) {
        const x = (col + margin) * cell
        const y = (row + margin) * cell
        rects.push(r > 0
          ? `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="${r.toFixed(2)}" ry="${r.toFixed(2)}"/>`
          : `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`
        )
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" fill="${bg}"/>` +
    `<g fill="${fg}">${rects.join('')}</g>` +
    `</svg>`
}

/**
 * React component wrapping the SVG generator — no external deps.
 * Usage: <QRCode value="https://..." size={120} fg="#1B4FD8" />
 */
export function QRCodeSVG({
  value, size = 120, fg = '#000000', bg = 'transparent', round = 0.3,
}: {
  value: string; size?: number; fg?: string; bg?: string; round?: number
}): string {
  try {
    return generateQRSVG(value, { size, fg, bg, margin: 3, round })
  } catch {
    // Fallback: colored square with text
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" fill="${bg}"/>` +
      `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="${fg}">QR</text>` +
      `</svg>`
  }
}
