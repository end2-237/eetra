'use client'

import { useState } from 'react'
import { X, Download, FileText, Check, AlertCircle } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePlan } from '@/contexts/PlanContext'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { generateId } from '@/lib/utils'

interface Props {
  onClose: () => void
}

type ExportStep = 'options' | 'loading' | 'done' | 'error'
type ExportFormat = 'pdf' | 'word'

const PAGE_W = 794
const PAGE_H = 1123
const A4_W_MM = 210
const A4_H_MM = 297

// Detect mobile viewport
function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024
}

export function ExportModal({ onClose }: Props) {
  const { title, subtitle, pages, docId, markSaved, zoom: currentZoom, setZoom } = useDocument()
  const { profile } = useProfile()
  const { addEntry } = useHistory()
  const { addNotification } = useNotifications()
  const { planId } = usePlan()

  const [step, setStep] = useState<ExportStep>('options')
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [quality, setQuality] = useState<'standard' | 'high'>('high')
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  const pageCount = pages.length + 1
  const blockCount = pages.reduce((acc, p) => acc + p.blocks.length, 0)
  const docName = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase()

  // ── MOBILE PDF EXPORT ─────────────────────────────────────────────────────
  // On mobile, MobileEditor renders pages in scaled containers.
  // We capture the inner A4 divs (inside the scale wrappers) directly.
  const handleMobilePdfExport = async () => {
    setStep('loading')
    setProgress(5)
    setProgressLabel('Chargement des modules…')

    try {
      const [jsPDFModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const jsPDF = jsPDFModule.default
      const html2canvas = html2canvasModule.default

      setProgress(15)

      document.body.classList.add('pdf-exporting')
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise(r => setTimeout(r, 200))

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const scale = quality === 'high' ? 2 : 1.5

      // On mobile, the structure is:
      // outer div (scaledW x scaledH, overflow:hidden)
      //   inner div (PAGE_W x PAGE_H, transform:scale(mobileScale), position:absolute)
      //     [EditableCoverPage or ContentPage]
      //
      // We need to capture the inner div at full A4 resolution.
      // Strategy: temporarily remove the transform, capture, then restore.

      // Find the mobile content scroll container
      // Cover: first scaled inner div in the view container
      const viewContainer = document.querySelector('[data-mobile-view]') as HTMLElement | null

      // Fallback: find all absolute inner divs with PAGE_W width
      // We'll look for divs styled with width: 794px inside overflow:hidden containers
      const allScaledInners = Array.from(
        document.querySelectorAll('[style*="transform: scale"]')
      ) as HTMLElement[]

      // Filter to only the ones that are PAGE_W wide (the A4 containers)
      const a4Inners = allScaledInners.filter(el => {
        const w = parseInt(el.style.width || '0')
        return w === PAGE_W || el.offsetWidth === PAGE_W
      })

      if (a4Inners.length === 0) {
        // Cannot find mobile elements, fall back to desktop method
        throw new Error('MOBILE_ELEMENTS_NOT_FOUND')
      }

      for (let i = 0; i < a4Inners.length; i++) {
        const pct = 20 + Math.round((i / a4Inners.length) * 65)
        setProgress(pct)
        setProgressLabel(`Page ${i + 1} / ${a4Inners.length}…`)

        const el = a4Inners[i]

        // Save current transform
        const savedTransform = el.style.transform
        const savedPosition = el.style.position
        const savedTop = el.style.top
        const savedLeft = el.style.left

        // Temporarily make it full size and visible for capture
        el.style.transform = 'none'
        el.style.position = 'relative'
        el.style.top = '0'
        el.style.left = '0'

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

        const canvas = await html2canvas(el, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: PAGE_W,
          height: PAGE_H,
          windowWidth: PAGE_W,
          windowHeight: PAGE_H,
          logging: false,
          ignoreElements: (el) => el.classList?.contains('pdf-hidden'),
        })

        // Restore styles
        el.style.transform = savedTransform
        el.style.position = savedPosition
        el.style.top = savedTop
        el.style.left = savedLeft

        if (i > 0) pdf.addPage()

        pdf.addImage(
          canvas.toDataURL('image/jpeg', quality === 'high' ? 0.97 : 0.85),
          'JPEG',
          0, 0,
          A4_W_MM,
          A4_H_MM,
        )
      }

      document.body.classList.remove('pdf-exporting')
      setProgress(95)
      setProgressLabel('Finalisation…')

      const filename = `EETRA_${docName}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(filename)
      setProgress(100)

      addEntry({
        id: generateId(),
        docId,
        title: title || 'Sans titre',
        entityName: profile.name || '',
        type: 'pdf',
        pageCount,
        blockCount,
        signature: `SIG-${generateId().toUpperCase()}`,
        qrData: `https://eetra.app/verify/${docId}`,
      })
      addNotification({
        type: 'export',
        title: 'PDF téléchargé',
        message: `"${title || 'Document'}" — ${pageCount} page${pageCount > 1 ? 's' : ''}.`,
      })
      markSaved()
      setStep('done')
    } catch (err: any) {
      document.body.classList.remove('pdf-exporting')
      if (err?.message === 'MOBILE_ELEMENTS_NOT_FOUND') {
        setErrorMsg('Impossible de capturer les pages sur mobile. Essayez depuis un ordinateur pour un meilleur résultat.')
      } else {
        setErrorMsg(err?.message || 'Erreur lors de la génération PDF. Réessayez.')
      }
      setStep('error')
    }
  }

  // ── DESKTOP PDF EXPORT ─────────────────────────────────────────────────────
  const handleDesktopPdfExport = async () => {
    setStep('loading')
    setProgress(5)
    setProgressLabel('Chargement des modules…')

    try {
      const [jsPDFModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const jsPDF = jsPDFModule.default
      const html2canvas = html2canvasModule.default

      setProgress(15)

      // Force zoom to 100% before capture
      const savedZoom = currentZoom
      setZoom(1)

      await new Promise(r => setTimeout(r, 300))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

      document.body.classList.add('pdf-exporting')
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise(r => setTimeout(r, 150))

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const scale = quality === 'high' ? 2 : 1.5

      const pageIds = [
        'eetra-page-cover',
        ...Array.from({ length: pages.length }, (_, i) => `eetra-page-${i}`),
      ]

      for (let i = 0; i < pageIds.length; i++) {
        const pct = 20 + Math.round((i / pageIds.length) * 65)
        setProgress(pct)
        setProgressLabel(`Page ${i + 1} / ${pageIds.length}…`)

        const outerEl = document.getElementById(pageIds[i])
        if (!outerEl) continue

        let captureEl: HTMLElement

        const staticCover = outerEl.querySelector('#eetra-cover-static') as HTMLElement | null

        if (staticCover) {
          captureEl = staticCover
        } else {
          const innerEl = outerEl.firstElementChild as HTMLElement
          captureEl = innerEl || outerEl
        }

        const savedTransform = captureEl.style.transform
        const savedMarginBottom = captureEl.style.marginBottom
        const savedWidth = captureEl.style.width
        const savedHeight = captureEl.style.height

        captureEl.style.transform = 'none'
        captureEl.style.marginBottom = '0'
        captureEl.style.width = `${PAGE_W}px`
        captureEl.style.height = `${PAGE_H}px`

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

        const canvas = await html2canvas(captureEl, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: PAGE_W,
          height: PAGE_H,
          windowWidth: PAGE_W,
          windowHeight: PAGE_H,
          logging: false,
          ignoreElements: (el) => el.classList?.contains('pdf-hidden'),
        })

        captureEl.style.transform = savedTransform
        captureEl.style.marginBottom = savedMarginBottom
        captureEl.style.width = savedWidth
        captureEl.style.height = savedHeight

        if (i > 0) pdf.addPage()

        pdf.addImage(
          canvas.toDataURL('image/jpeg', quality === 'high' ? 0.97 : 0.85),
          'JPEG',
          0, 0,
          A4_W_MM,
          A4_H_MM,
        )
      }

      document.body.classList.remove('pdf-exporting')
      setZoom(savedZoom)

      setProgress(95)
      setProgressLabel('Finalisation…')

      const filename = `EETRA_${docName}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(filename)
      setProgress(100)

      addEntry({
        id: generateId(),
        docId,
        title: title || 'Sans titre',
        entityName: profile.name || '',
        type: 'pdf',
        pageCount,
        blockCount,
        signature: `SIG-${generateId().toUpperCase()}`,
        qrData: `https://eetra.app/verify/${docId}`,
      })
      addNotification({
        type: 'export',
        title: 'PDF téléchargé',
        message: `"${title || 'Document'}" — ${pageCount} page${pageCount > 1 ? 's' : ''}.`,
      })
      markSaved()
      setStep('done')
    } catch (err: any) {
      document.body.classList.remove('pdf-exporting')
      try { setZoom(currentZoom) } catch {}
      setErrorMsg(err?.message || 'Erreur lors de la génération PDF. Réessayez.')
      setStep('error')
    }
  }

  // ── WORD EXPORT ─────────────────────────────────────────────────────────────
  const handleWordExport = async () => {
    setStep('loading')
    setProgress(5)
    setProgressLabel('Préparation du document Word…')

    try {
      const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        PageOrientation, Header, Footer, PageNumber, TableLayoutType,
        LevelFormat,
      } = await import('docx')

      setProgress(20)
      setProgressLabel('Génération des sections…')

      const FONT = 'Times New Roman'
      const accentHex = (profile.color || '#1B4FD8').replace('#', '')

      const docChildren: any[] = []

      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: profile.name || 'EETRA', bold: true, size: 18, color: accentHex, font: FONT })],
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: (title || 'Document sans titre').toUpperCase(), bold: true, size: 64, font: FONT })],
          spacing: { before: 600, after: 200 },
        }),
      )
      if (subtitle) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: subtitle, italics: true, size: 26, color: '888888', font: FONT })],
          }),
        )
      }
      docChildren.push(new Paragraph({ text: '' }))
      for (const [lbl, val] of [
        ['Date', new Date().toLocaleDateString('fr-FR')],
        ...(profile.name ? [['Émetteur', profile.name]] : []),
        ['Réf.', docId],
      ] as string[][]) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${lbl} : `, bold: true, size: 18, font: FONT }),
              new TextRun({ text: val, size: 18, font: FONT }),
            ],
          }),
        )
      }
      docChildren.push(new Paragraph({ pageBreakBefore: true }))

      setProgress(40)

      for (const [pi, page] of pages.entries()) {
        for (const block of page.blocks) {
          switch (block.type) {
            case 'h1':
              docChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: block.content || '', bold: true, size: 44, font: FONT })], spacing: { before: 360, after: 120 } }))
              break
            case 'h2':
              docChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: block.content || '', bold: true, size: 36, font: FONT })], spacing: { before: 300, after: 100 } }))
              break
            case 'h3':
              docChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: block.content || '', bold: true, size: 28, font: FONT })], spacing: { before: 240, after: 80 } }))
              break
            case 'h4':
              docChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_4, children: [new TextRun({ text: block.content || '', bold: true, italics: true, size: 24, font: FONT })], spacing: { before: 200, after: 60 } }))
              break
            case 'bullet-list':
              for (const item of (block.content || '').split('\n').filter(Boolean)) {
                docChildren.push(new Paragraph({ numbering: { reference: 'eetra-bullets', level: 0 }, children: [new TextRun({ text: item, size: 22, font: FONT })] }))
              }
              break
            case 'numbered-list':
              for (const item of (block.content || '').split('\n').filter(Boolean)) {
                docChildren.push(new Paragraph({ numbering: { reference: 'eetra-numbers', level: 0 }, children: [new TextRun({ text: item, size: 22, font: FONT })] }))
              }
              break
            case 'section':
              docChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: block.content || '', bold: true, allCaps: true, color: accentHex, size: 24, font: FONT })], spacing: { before: 400, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accentHex, space: 4 } } }))
              break
            case 'text':
              docChildren.push(new Paragraph({ children: [new TextRun({ text: block.content || '', size: 22, font: FONT })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 80, after: 80 } }))
              break
            case 'quote':
              docChildren.push(new Paragraph({ children: [new TextRun({ text: block.content || '', italics: true, size: 26, color: '444444', font: FONT })], indent: { left: 600 }, spacing: { before: 200, after: 200 }, border: { left: { style: BorderStyle.THICK, size: 12, color: accentHex, space: 12 } } }))
              break
            case 'table':
              if (block.tableData) {
                const { headers, rows } = block.tableData
                docChildren.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
                  new TableRow({ tableHeader: true, children: headers.map(h => new TableCell({ shading: { type: ShadingType.SOLID, fill: accentHex }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18, allCaps: true, font: FONT })] })] })) }),
                  ...rows.map((row, ri) => new TableRow({ children: row.map(cell => new TableCell({ shading: ri % 2 === 1 ? { type: ShadingType.SOLID, fill: 'F5F7FA' } : undefined, children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, font: FONT })] })] })) })),
                ] }))
              }
              break
            case 'clause': {
              const lines = (block.content || '').split('\n')
              if (lines[0]) docChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: lines[0], bold: true, size: 20, color: accentHex, font: FONT })], spacing: { before: 240, after: 80 } }))
              const body = lines.slice(1).join('\n').trim()
              if (body) docChildren.push(new Paragraph({ children: [new TextRun({ text: body, size: 18, italics: true, font: FONT })], alignment: AlignmentType.JUSTIFIED, spacing: { before: 60, after: 120 }, shading: { type: ShadingType.SOLID, fill: 'FAFAFA' } }))
              break
            }
            case 'checklist':
              for (const item of (block.content || '').split('\n').filter(Boolean)) {
                docChildren.push(new Paragraph({ children: [new TextRun({ text: `☐  ${item}`, size: 20, font: FONT })], indent: { left: 360 }, spacing: { before: 40, after: 40 } }))
              }
              break
            case 'sign':
              docChildren.push(
                new Paragraph({ text: '', spacing: { before: 480 } }),
                new Paragraph({ children: [new TextRun({ text: 'Signature Émetteur', bold: true, size: 18, font: FONT }), new TextRun({ text: '\t\t\t\t\t', size: 18 }), new TextRun({ text: 'Signature Destinataire', bold: true, size: 18, font: FONT })] }),
                new Paragraph({ children: [new TextRun({ text: '_______________________', size: 18, color: 'BBBBBB' }), new TextRun({ text: '\t\t\t\t\t', size: 18 }), new TextRun({ text: '_______________________', size: 18, color: 'BBBBBB' })], spacing: { before: 600 } }),
              )
              break
            case 'divider':
              docChildren.push(new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'E8E8E8', space: 4 } }, spacing: { before: 120, after: 120 } }))
              break
            default:
              break
          }
        }
        if (pi < pages.length - 1) docChildren.push(new Paragraph({ pageBreakBefore: true }))
      }

      setProgress(75)
      setProgressLabel('Mise en forme…')

      const doc = new Document({
        creator: 'EETRA Platform',
        title: title || 'Document',
        description: subtitle || '',
        styles: {
          default: { document: { run: { font: FONT, size: 22 } } },
          paragraphStyles: [
            { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 44, bold: true, font: FONT, color: '000000' }, paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
            { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, font: FONT, color: '000000' }, paragraph: { spacing: { before: 300, after: 100 }, outlineLevel: 1 } },
            { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, font: FONT, color: '000000' }, paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 2 } },
            { id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, italics: true, font: FONT, color: '000000' }, paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 3 } },
          ],
        },
        numbering: {
          config: [
            { reference: 'eetra-bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { run: { font: FONT, size: 22 }, paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 60 } } } }] },
            { reference: 'eetra-numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { run: { font: FONT, size: 22 }, paragraph: { indent: { left: 720, hanging: 360 }, spacing: { after: 60 } } } }] },
          ],
        },
        sections: [{
          properties: { page: { size: { orientation: PageOrientation.PORTRAIT, width: 12240, height: 15840 }, margin: { top: 1080, bottom: 900, left: 1080, right: 1080 } } },
          headers: { default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: profile.name || 'EETRA', bold: true, size: 16, color: accentHex, font: FONT }), new TextRun({ text: '  ·  ' + (title || ''), size: 16, color: '888888', font: FONT })], border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'EEEEEE', space: 6 } } })] }) },
          footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: 'Généré par EETRA  ·  ' + docId + '  ·  Page ', size: 14, color: 'CCCCCC', font: FONT }), new TextRun({ children: [PageNumber.CURRENT], size: 14, color: '888888', font: FONT })], border: { top: { style: BorderStyle.SINGLE, size: 3, color: 'EEEEEE', space: 6 } } })] }) },
          children: docChildren,
        }],
      })

      setProgress(90)
      setProgressLabel('Téléchargement…')

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `EETRA_${docName}_${new Date().toISOString().slice(0, 10)}.docx`
      a.click()
      URL.revokeObjectURL(url)

      setProgress(100)
      addNotification({ type: 'export', title: 'Word téléchargé', message: `"${title || 'Document'}" exporté en .docx.` })
      markSaved()
      setStep('done')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de la génération Word. Réessayez.')
      setStep('error')
    }
  }

  const handleExport = () => {
    if (format === 'word') {
      handleWordExport()
      return
    }
    // PDF: choose strategy based on viewport
    if (isMobileViewport()) {
      handleMobilePdfExport()
    } else {
      handleDesktopPdfExport()
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: 480, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.25)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={15} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Exporter le Document</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>{pageCount} page{pageCount > 1 ? 's' : ''} · {blockCount} bloc{blockCount > 1 ? 's' : ''}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
            <X size={13} />
          </button>
        </div>

        <div style={{ padding: 24 }}>

          {/* OPTIONS */}
          {step === 'options' && (
            <>
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={16} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title || 'Document sans titre'}</div>
                  {subtitle && <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>{subtitle}</div>}
                </div>
              </div>

              {/* Mobile warning */}
              {isMobileViewport() && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(217,119,6,.08)', border: '1px solid rgba(217,119,6,.25)', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>📱</span>
                  <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.4 }}>
                    Sur mobile, la qualité PDF peut varier. Pour un résultat optimal, exportez depuis un ordinateur.
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>Format d'export</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([
                    { id: 'pdf' as const, label: 'PDF', desc: 'Impression · Mise en page exacte', badge: 'Recommandé', icon: '📄' },
                    { id: 'word' as const, label: 'Word .docx', desc: 'Éditable · Times New Roman', badge: null, icon: '📝' },
                  ]).map(opt => (
                    <div key={opt.id} onClick={() => setFormat(opt.id)} style={{ padding: '14px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${format === opt.id ? 'var(--accent)' : 'var(--border)'}`, background: format === opt.id ? 'var(--accentS)' : 'var(--bg2)', transition: 'all .12s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{opt.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{opt.label}</span>
                        {opt.badge && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 20, background: 'var(--accent)', color: '#fff' }}>{opt.badge}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text4)' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {format === 'pdf' && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>Qualité d'image</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { id: 'standard', label: 'Standard', desc: '~2–3 MB · Partage rapide' },
                      { id: 'high', label: 'Haute qualité', desc: '~5–8 MB · Impression' },
                    ].map(opt => (
                      <div key={opt.id} onClick={() => setQuality(opt.id as typeof quality)} style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${quality === opt.id ? 'var(--accent)' : 'var(--border)'}`, background: quality === opt.id ? 'var(--accentS)' : 'transparent', transition: 'all .12s' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text4)' }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="primary" fullWidth size="lg" onClick={handleExport}>
                <Download size={14} />
                {format === 'pdf' ? 'Télécharger le PDF' : 'Télécharger le .docx'}
              </Button>
            </>
          )}

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ padding: '40px 0' }}>
              <Loading
                size="md"
                context="export"
                text={format === 'pdf' ? 'Génération du PDF…' : 'Génération Word…'}
                progress={progress}
                showTips={false}
              />
              {progressLabel && (
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>
                  {progressLabel}
                </div>
              )}
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(5,150,105,.1)', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={24} color="#059669" strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                {format === 'pdf' ? 'PDF téléchargé !' : 'Word téléchargé !'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 24 }}>Fichier enregistré dans vos téléchargements.</div>
              <Button variant="ghost" fullWidth onClick={onClose}>Fermer</Button>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(220,38,38,.08)', border: '2px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={24} color="#DC2626" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Erreur d'export</div>
              <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 20 }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" fullWidth onClick={onClose}>Annuler</Button>
                <Button variant="primary" fullWidth onClick={() => { setStep('options'); setProgress(0) }}>Réessayer</Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}