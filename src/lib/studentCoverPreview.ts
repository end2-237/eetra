import type { CompanyProfile } from '@/types'

type StudentData = Record<string, string>

const NIVEAU_LABEL: Record<string, string> = {
  L: 'Licence / BTS / DUT',
  M1: 'Master 1',
  M2: 'Master 2 / MBA',
  Ingénieur: 'École d’ingénieur',
  Doctorat: 'Doctorat',
}

const TYPE_TITLE: Record<string, string> = {
  stage: 'RAPPORT DE STAGE',
  memoire: 'MÉMOIRE / TFE',
  projet: 'RAPPORT DE PROJET',
  expose: 'EXPOSÉ ACADÉMIQUE',
}

/** Marque EETRA (même pictogramme que public/favicon.svg), centré 0,0 — utiliser avec translate + scale */
const EETRA_LOGO_MARK = `
  <rect width="32" height="32" rx="7" fill="#1B4FD8"/>
  <path d="M10 8h8l5 5v11a1 1 0 01-1 1H10a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="white" stroke-width="1.5" fill="none"/>
  <polyline points="18 8 18 13 23 13" stroke="white" stroke-width="1.5" fill="none"/>
  <line x1="12" y1="17" x2="20" y2="17" stroke="white" stroke-width="1.5"/>
  <line x1="12" y1="20" x2="20" y2="20" stroke="white" stroke-width="1.5"/>
`

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapLines(text: string, maxLen: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length > maxLen && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = next
    }
    if (lines.length >= maxLines - 1) break
  }
  if (cur && lines.length < maxLines) lines.push(cur)
  if (lines.length === 0) lines.push('—')
  return lines.slice(0, maxLines)
}

function academicYearLabel(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const start = m >= 8 ? y : y - 1
  return `${start}-${start + 1}`
}

export interface StudentCoverPreviewInput {
  data: StudentData
  profile: CompanyProfile
  /** Si vide, ligne nominative laissée pour signature manuscrite (pas de texte « étudiant »). */
  studentName: string
}

function buildInstitutionLines(profile: CompanyProfile): string[] {
  const name = profile.name?.trim()
  const city = [profile.address, profile.city].filter(Boolean).join(', ').trim()
  const lines: string[] = [
    'REPUBLIQUE DU CAMEROUN',
    'Paix — Travail — Patrie',
    name || 'Établissement d’enseignement supérieur',
    city || 'Adresse — Ville',
  ]
  if (profile.tagline?.trim()) lines.push(profile.tagline.trim())
  if (profile.web?.trim()) lines.push(`Site web : ${profile.web.trim()}`)
  if (profile.email?.trim()) lines.push(`Email : ${profile.email.trim()}`)
  if (profile.legal?.trim()) lines.push(profile.legal.trim())
  if (profile.siret?.trim()) lines.push(`Réf. / N° : ${profile.siret.trim()}`)
  return lines
}

/**
 * Couverture type rapport institutionnel, alignée sur la référence fournie,
 * avec marques EETRA et données config + profil.
 */
export function buildStudentCoverPreviewDataUri(input: StudentCoverPreviewInput): string {
  const { data, profile, studentName } = input
  const accent = data.couleur?.trim() || '#EA580C'
  const titre = (data.titre || 'Titre du rapport').trim()
  const typeKey = data.type || 'stage'
  const docType = TYPE_TITLE[typeKey] || 'RAPPORT ACADÉMIQUE'
  const niveau = data.niveau ? NIVEAU_LABEL[data.niveau] || data.niveau : '—'
  const entreprise = (data.entreprise || '—').trim()
  const duree = (data.duree || '—').trim()
  const pages = data.pages || '—'
  const chapitres = data.chapitres || '—'
  const yearBox = academicYearLabel()

  const headerLines = buildInstitutionLines(profile).map(escapeXml)

  const themeLines = wrapLines(`THÈME : ${titre}`, 54, 4).map(escapeXml)
  const themeLineCount = themeLines.length
  const themeStartY = 300
  const themeBoxH = 40 + themeLineCount * 24 + 24
  const themeTextStartY = themeStartY + 38
  const afterTheme = themeStartY + themeBoxH + 28

  const nameLine = studentName.trim()
  const nameDisplay = nameLine ? escapeXml(nameLine.toUpperCase()) : ''
  const niveauEsc = escapeXml(niveau)
  const entrepriseEsc = escapeXml(entreprise)
  const dureeEsc = escapeXml(duree)

  const yAuth = afterTheme
  const yName = yAuth + 26
  const yParcours = yName + (nameLine ? 34 : 28)
  const yStruct = yParcours + 26
  const yDuree = yStruct + 24
  const yMeta = yDuree + 28
  const yEncTitle = yMeta + 36
  const yEncL1 = yEncTitle + 30
  const yEncL2 = yEncL1 + 22
  const yEncR1 = yEncTitle + 30
  const yEncR2 = yEncR1 + 22

  const logoScale = 1.35
  const logoSize = 32 * logoScale

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1280" viewBox="0 0 900 1280">
  <defs>
    <linearGradient id="themeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="900" height="1280" fill="#ffffff"/>
  <rect x="16" y="16" width="868" height="1248" fill="none" stroke="${accent}" stroke-width="5"/>
  <rect x="24" y="24" width="852" height="1232" fill="none" stroke="${accent}" stroke-width="1.5"/>

  <!-- Logos EETRA (coins supérieurs, symétriques) -->
  <g transform="translate(42,42) scale(${logoScale})">
    ${EETRA_LOGO_MARK}
  </g>
  <g transform="translate(${900 - 42 - logoSize},42) scale(${logoScale})">
    ${EETRA_LOGO_MARK}
  </g>
  <text x="42" y="36" font-size="9" fill="#64748b" font-family="Georgia,serif" font-weight="600">EETRA</text>
  <text x="858" y="36" font-size="9" fill="#64748b" font-family="Georgia,serif" font-weight="600" text-anchor="end">EETRA</text>

  <!-- Colonne gauche -->
  ${headerLines
    .map(
      (line, i) =>
        `<text x="225" y="${58 + i * 17}" text-anchor="middle" font-size="10.5" fill="#0f172a" font-family="Georgia,Times New Roman,serif">${line}</text>`,
    )
    .join('\n  ')}

  <!-- Colonne droite (miroir) -->
  ${headerLines
    .map(
      (line, i) =>
        `<text x="675" y="${58 + i * 17}" text-anchor="middle" font-size="10.5" fill="#0f172a" font-family="Georgia,Times New Roman,serif">${line}</text>`,
    )
    .join('\n  ')}

  <text x="450" y="258" text-anchor="middle" font-size="21" fill="#b91c1c" font-family="Georgia,Times New Roman,serif" font-weight="700" letter-spacing="0.02em">${escapeXml(docType)}</text>

  <rect x="64" y="${themeStartY}" rx="16" ry="16" width="772" height="${themeBoxH}" fill="url(#themeGrad)" filter="url(#sh)"/>
  ${themeLines
    .map(
      (line, i) =>
        `<text x="450" y="${themeTextStartY + i * 24}" text-anchor="middle" font-size="14.5" fill="#ffffff" font-family="Georgia,Times New Roman,serif" font-weight="700">${line}</text>`,
    )
    .join('\n  ')}

  <text x="450" y="${yAuth}" text-anchor="middle" font-size="11.5" fill="#334155" font-family="Georgia,Times New Roman,serif">Rédigé et présenté par :</text>
  ${
    nameDisplay
      ? `<text x="450" y="${yName}" text-anchor="middle" font-size="16" fill="#0f172a" font-family="Georgia,Times New Roman,serif" font-weight="700">${nameDisplay}</text>`
      : `<line x1="220" y1="${yName - 4}" x2="680" y2="${yName - 4}" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="450" y="${yName}" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="Georgia,Times New Roman,serif" font-style="italic">(nom et prénom)</text>`
  }
  <text x="450" y="${yParcours}" text-anchor="middle" font-size="11" fill="#475569" font-family="Georgia,Times New Roman,serif">Parcours de formation : ${niveauEsc}</text>
  <text x="450" y="${yStruct}" text-anchor="middle" font-size="10.5" fill="#475569" font-family="Georgia,Times New Roman,serif">Structure / lieu de stage : ${entrepriseEsc}</text>
  <text x="450" y="${yDuree}" text-anchor="middle" font-size="10.5" fill="#475569" font-family="Georgia,Times New Roman,serif">Période / durée : ${dureeEsc}</text>
  <text x="450" y="${yMeta}" text-anchor="middle" font-size="10" fill="#64748b" font-family="Georgia,Times New Roman,serif">Volume prévu : ${escapeXml(String(pages))} pages — ${escapeXml(String(chapitres))} chapitres principaux</text>

  <text x="450" y="${yEncTitle}" text-anchor="middle" font-size="11.5" fill="#334155" font-family="Georgia,Times New Roman,serif">Sous l’encadrement de :</text>
  <text x="200" y="${yEncL1}" text-anchor="start" font-size="10.5" fill="#0f172a" font-family="Georgia,Times New Roman,serif" font-weight="700">Encadrement professionnel</text>
  <text x="200" y="${yEncL2}" text-anchor="start" font-size="10" fill="#64748b" font-family="Georgia,Times New Roman,serif">Nom, fonction — à compléter dans l’éditeur</text>
  <text x="500" y="${yEncR1}" text-anchor="start" font-size="10.5" fill="#0f172a" font-family="Georgia,Times New Roman,serif" font-weight="700">Encadrement académique</text>
  <text x="500" y="${yEncR2}" text-anchor="start" font-size="10" fill="#64748b" font-family="Georgia,Times New Roman,serif">Nom, grade — à compléter dans l’éditeur</text>

  <text x="450" y="1148" text-anchor="middle" font-size="9" fill="#94a3b8" font-family="Georgia,Times New Roman,serif">Document préparé avec EETRA</text>

  <rect x="348" y="1168" rx="10" ry="10" width="204" height="48" fill="url(#themeGrad)"/>
  <text x="450" y="1198" text-anchor="middle" font-size="16" fill="#ffffff" font-family="Georgia,Times New Roman,serif" font-weight="700">${escapeXml(yearBox)}</text>

  <rect x="772" y="1168" width="64" height="64" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="4"/>
  <g transform="translate(780,1176) scale(1.5)">
    ${EETRA_LOGO_MARK}
  </g>
</svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
