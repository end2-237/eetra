/**
 * export-docx-v2.ts — Improved DOCX export
 *
 * New vs v1:
 * - Inline images (base64) via ImageRun
 * - Colored table headers using shading
 * - Proper heading hierarchy (H1 cover → H2 sections → H3 sub)
 * - KPI blocks rendered as a 4-column table
 * - Checklist rendered with ✓/☐ characters
 * - Clause / Sign blocks formatted distinctly
 * - Corporate color applied to headings, table headers, dividers
 * - Footer with page number + document ref
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  ImageRun, PageNumber, Footer, Header,
  convertInchesToTwip, convertMillimetersToTwip,
  TableOfContents, LevelFormat, UnderlineType,
} from 'docx'

export interface ExportDocxOptions {
  title:          string
  subtitle?:      string
  ref?:           string
  destination?:   string
  confidentiality?: string
  entityName?:    string
  logoDataUrl?:   string | null
  accentColor?:   string   // hex e.g. '#1B4FD8'
  pages:          any[]
  author?:        string
  tagline?:       string
}

// ── Color helpers ─────────────────────────────────────────────────────────────

function hexToDocx(hex: string): string {
  return hex.replace('#', '').toUpperCase()
}

function lightenHex(hex: string, pct = 0.85): string {
  const n  = parseInt(hex.replace('#', ''), 16)
  const r  = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * pct)
  const g  = Math.round(((n >> 8)  & 255) + (255 - ((n >> 8)  & 255)) * pct)
  const b  = Math.round((n & 255)         + (255 - (n & 255))          * pct)
  return [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}

// ── Image utils ───────────────────────────────────────────────────────────────

async function dataUrlToBuffer(dataUrl: string): Promise<Buffer | null> {
  try {
    const base64 = dataUrl.split(',')[1]
    return Buffer.from(base64, 'base64')
  } catch {
    return null
  }
}

function detectImageType(dataUrl: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  if (dataUrl.includes('image/png'))  return 'png'
  if (dataUrl.includes('image/gif'))  return 'gif'
  if (dataUrl.includes('image/bmp'))  return 'bmp'
  return 'jpg'
}

// ── Block → DOCX elements ─────────────────────────────────────────────────────

function makeHRule(color: string): Paragraph {
  return new Paragraph({
    border: {
      bottom: {
        color:     hexToDocx(color),
        space:     1,
        style:     BorderStyle.THICK,
        size:      6,
      },
    },
    spacing: { before: 120, after: 120 },
    children: [],
  })
}

function blockToElements(block: any, accent: string): any[] {
  const accentDocx = hexToDocx(accent)
  const accentLight = lightenHex(accent)

  switch (block.type) {

    case 'section':
      return [
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text:  block.title || 'Section',
              bold:  true,
              color: accentDocx,
              size:  26,
              font:  'Calibri',
            }),
          ],
          spacing: { before: 400, after: 120 },
          border: {
            bottom: { color: accentDocx, space: 1, style: BorderStyle.SINGLE, size: 4 },
          },
        }),
        block.content ? new Paragraph({
          children: [new TextRun({ text: block.content, size: 22 })],
          spacing: { after: 160 },
        }) : null,
      ].filter(Boolean)

    case 'text':
      return [
        new Paragraph({
          children: [
            new TextRun({ text: block.content || '', size: 22, font: 'Calibri' }),
          ],
          spacing: { after: 160 },
          alignment: AlignmentType.JUSTIFIED,
        }),
      ]

    case 'quote':
      return [
        new Paragraph({
          children: [
            new TextRun({
              text:      `"${block.content || ''}"`,
              italics:   true,
              color:     accentDocx,
              size:      24,
              font:      'Georgia',
            }),
          ],
          indent: { left: convertInchesToTwip(0.5) },
          border: {
            left: { color: accentDocx, space: 8, style: BorderStyle.THICK, size: 14 },
          },
          spacing: { before: 200, after: 200 },
        }),
      ]

    case 'divider':
      return [makeHRule(accent)]

    case 'table': {
      const headers: string[] = block.headers || []
      const rows:    string[][] = block.rows || []
      if (!headers.length && !rows.length) return []

      const colCount = Math.max(headers.length, ...rows.map((r: string[]) => r.length), 1)
      const colPct   = Math.floor(100 / colCount)

      const headerRow = new TableRow({
        tableHeader: true,
        children: headers.map((h: string) => new TableCell({
          shading: { type: ShadingType.SOLID, color: accentDocx, fill: accentDocx },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20, font: 'Calibri' })],
          })],
          width: { size: colPct, type: WidthType.PERCENTAGE },
        })),
      })

      const dataRows = rows.map((row: string[], ri: number) =>
        new TableRow({
          children: row.map((cell: string) => new TableCell({
            shading: ri % 2 === 0
              ? { type: ShadingType.SOLID, color: accentLight, fill: accentLight }
              : { type: ShadingType.SOLID, color: 'FFFFFF',    fill: 'FFFFFF'    },
            children: [new Paragraph({
              children: [new TextRun({ text: cell || '', size: 20, font: 'Calibri' })],
            })],
            width: { size: colPct, type: WidthType.PERCENTAGE },
          })),
        })
      )

      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows],
        }),
        new Paragraph({ children: [], spacing: { after: 160 } }),
      ]
    }

    case 'kpi': {
      const items = (block.items || []).slice(0, 4)
      if (!items.length) return []
      const cells = items.map((item: any) => new TableCell({
        shading: { type: ShadingType.SOLID, color: accentLight, fill: accentLight },
        borders: {
          top:    { style: BorderStyle.SINGLE, color: accentDocx, size: 4 },
          bottom: { style: BorderStyle.NONE },
          left:   { style: BorderStyle.NONE },
          right:  { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: item.value || '—', bold: true, color: accentDocx, size: 36, font: 'Calibri' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: item.label || '', size: 18, color: '444444' })],
          }),
        ],
        width: { size: 25, type: WidthType.PERCENTAGE },
      }))
      return [
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: cells })] }),
        new Paragraph({ children: [], spacing: { after: 200 } }),
      ]
    }

    case 'checklist': {
      const checks = block.items || []
      return checks.map((item: any) =>
        new Paragraph({
          children: [
            new TextRun({ text: item.checked ? '☑  ' : '☐  ', font: 'Segoe UI Symbol', size: 22, color: item.checked ? '059669' : '444444' }),
            new TextRun({ text: item.text || '', size: 22, font: 'Calibri', strike: item.checked }),
          ],
          spacing: { after: 60 },
          indent: { left: convertInchesToTwip(0.2) },
        })
      )
    }

    case 'clause':
      return [
        new Paragraph({
          children: [
            new TextRun({ text: (block.clauseNumber ? `Art. ${block.clauseNumber} — ` : '') + (block.title || 'Clause'), bold: true, size: 22, color: accentDocx, font: 'Calibri' }),
          ],
          spacing: { before: 200, after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: block.content || '', size: 20, font: 'Calibri' })],
          indent: { left: convertInchesToTwip(0.3) },
          border: {
            left: { color: accentDocx, space: 6, style: BorderStyle.SINGLE, size: 6 },
          },
          spacing: { after: 160 },
          alignment: AlignmentType.JUSTIFIED,
        }),
      ]

    case 'sign':
      return [
        new Paragraph({ children: [], spacing: { before: 400 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: { top: { style: BorderStyle.SINGLE, color: accentDocx, size: 4 }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: block.signerTitle || 'Signataire', size: 18, color: '888888' })], spacing: { before: 60 } }),
                    new Paragraph({ children: [new TextRun({ text: block.signerName || '________________________', bold: true, size: 20 })] }),
                  ],
                  width: { size: 48, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  children: [new Paragraph({ children: [] })],
                  width: { size: 4, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  borders: { top: { style: BorderStyle.SINGLE, color: accentDocx, size: 4 }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  children: [
                    new Paragraph({ children: [new TextRun({ text: 'Date', size: 18, color: '888888' })], spacing: { before: 60 } }),
                    new Paragraph({ children: [new TextRun({ text: '________________________', bold: true, size: 20 })] }),
                  ],
                  width: { size: 48, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ children: [], spacing: { after: 300 } }),
      ]

    default:
      return []
  }
}

// ── Cover page ────────────────────────────────────────────────────────────────

async function makeCoverPage(opts: ExportDocxOptions): Promise<any[]> {
  const accent     = opts.accentColor || '#1B4FD8'
  const accentDocx = hexToDocx(accent)
  const elements: any[] = []

  // Logo
  if (opts.logoDataUrl) {
    const buf = await dataUrlToBuffer(opts.logoDataUrl)
    if (buf) {
      const ext = detectImageType(opts.logoDataUrl)
      elements.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buf,
              type: ext,
              transformation: { width: 120, height: 60 },
            }),
          ],
          spacing: { before: 0, after: 600 },
        })
      )
    }
  } else {
    elements.push(new Paragraph({ children: [], spacing: { after: 800 } }))
  }

  // Title
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({
        text:  opts.title || 'Document',
        bold:  true,
        color: accentDocx,
        size:  52,
        font:  'Calibri',
      })],
      spacing: { after: 200 },
    })
  )

  if (opts.subtitle) {
    elements.push(new Paragraph({
      children: [new TextRun({ text: opts.subtitle, size: 26, color: '555555', italics: true, font: 'Calibri' })],
      spacing: { after: 600 },
    }))
  }

  elements.push(makeHRule(accent))

  // Metadata grid
  const meta = [
    opts.entityName    && ['Émetteur',         opts.entityName],
    opts.ref           && ['Référence',         opts.ref],
    opts.destination   && ['Destinataire',      opts.destination],
    opts.confidentiality && ['Confidentialité', opts.confidentiality],
    opts.author        && ['Auteur',            opts.author],
    ['Date',             new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })],
  ].filter(Boolean) as [string, string][]

  for (const [label, value] of meta) {
    elements.push(new Paragraph({
      children: [
        new TextRun({ text: `${label} : `, bold: true, size: 20, color: accentDocx, font: 'Calibri' }),
        new TextRun({ text: value,           size: 20,             color: '333333', font: 'Calibri' }),
      ],
      spacing: { after: 80 },
    }))
  }

  elements.push(makeHRule(accent))

  return elements
}

// ── Main export function ──────────────────────────────────────────────────────

export async function exportDocxV2(opts: ExportDocxOptions): Promise<Blob> {
  const accent     = opts.accentColor || '#1B4FD8'
  const accentDocx = hexToDocx(accent)

  const allSections: any[][] = []

  // Cover page
  const cover = await makeCoverPage(opts)
  allSections.push(cover)

  // Pages
  for (const page of opts.pages || []) {
    const pageElements: any[] = [
      new Paragraph({ children: [], pageBreakBefore: true }),
    ]

    for (const block of (page.blocks || [])) {
      // Handle image blocks specifically
      if (block.type === 'image' && block.dataUrl) {
        const buf = await dataUrlToBuffer(block.dataUrl)
        if (buf) {
          const ext = detectImageType(block.dataUrl)
          pageElements.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data:           buf,
                  type:           ext,
                  transformation: { width: 500, height: 280 },
                }),
              ],
              spacing: { before: 200, after: 200 },
            })
          )
          if (block.caption) {
            pageElements.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: block.caption, italics: true, size: 18, color: '888888' })],
              spacing: { after: 160 },
            }))
          }
          continue
        }
      }

      // Chart blocks → placeholder
      if (block.type === 'chart') {
        pageElements.push(new Paragraph({
          children: [new TextRun({ text: `[Graphique: ${block.title || 'Chart'}]`, italics: true, color: '888888', size: 20 })],
          border: {
            top:    { style: BorderStyle.DASHED, color: accentDocx, size: 2 },
            bottom: { style: BorderStyle.DASHED, color: accentDocx, size: 2 },
          },
          spacing: { before: 160, after: 160 },
          indent: { left: convertInchesToTwip(0.3) },
        }))
        continue
      }

      const elements = blockToElements(block, accent)
      pageElements.push(...elements)
    }

    allSections.push(pageElements)
  }

  const doc = new Document({
    creator:  opts.entityName || 'EETRA',
    title:    opts.title,
    subject:  opts.subtitle || '',
    keywords: 'EETRA, document professionnel',

    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
      paragraphStyles: [
        {
          id:   'Heading1',
          name: 'Heading 1',
          run:  { color: accentDocx, size: 52, bold: true, font: 'Calibri' },
          paragraph: { spacing: { before: 400, after: 200 } },
        },
        {
          id:   'Heading2',
          name: 'Heading 2',
          run:  { color: accentDocx, size: 28, bold: true, font: 'Calibri' },
          paragraph: { spacing: { before: 360, after: 120 } },
        },
      ],
    },

    sections: allSections.map((children, i) => ({
      properties: i === 0 ? {
        page: {
          margin: {
            top:    convertMillimetersToTwip(25),
            right:  convertMillimetersToTwip(20),
            bottom: convertMillimetersToTwip(25),
            left:   convertMillimetersToTwip(20),
          },
        },
      } : {
        page: {
          margin: {
            top:    convertMillimetersToTwip(20),
            right:  convertMillimetersToTwip(20),
            bottom: convertMillimetersToTwip(25),
            left:   convertMillimetersToTwip(20),
          },
        },
      },
      footers: i > 0 ? {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: (opts.ref || opts.title) + ' · ', size: 16, color: '999999' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: accentDocx }),
                new TextRun({ text: ' / ', size: 16, color: '999999' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '999999' }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, color: 'DDDDDD', size: 2 } },
            }),
          ],
        }),
      } : undefined,
      children,
    })),
  })

  const buf = await Packer.toBuffer(doc)
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

/**
 * Convenience wrapper that triggers download in browser.
 */
export async function downloadDocxV2(opts: ExportDocxOptions, filename?: string): Promise<void> {
  const blob = await exportDocxV2(opts)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${filename || opts.title || 'document'}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
