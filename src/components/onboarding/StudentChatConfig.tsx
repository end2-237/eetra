'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { ArrowRight, ArrowLeft, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useProfile } from '@/contexts/ProfileContext'
import { buildStudentCoverPreviewDataUri } from '@/lib/studentCoverPreview'

type FlowPhase = 'welcome' | 'step' | 'done'
type StudentData = Record<string, string>

type Choice = {
  label: string
  value: string
  color?: string
}

type Step = {
  key: string
  question: (data: StudentData) => string
  inputMode: 'text' | 'choices'
  placeholder?: string
  choices?: (data: StudentData) => Choice[]
  progress: number
  label: string
  motivation?: { icon: string; title: string; sub: string }
  skipIf?: (data: StudentData) => boolean
}

/** Styles alignés sur globals.css (variables --bg/--accent, Bricolage + Libre Caslon). */
const css = `
  .student-chat-config,
  .student-chat-config * {
    box-sizing: border-box;
  }

  .student-chat-config {
    display: flex;
    height: 100dvh;
    font-family: var(--font-bricolage), 'Bricolage Grotesque', sans-serif;
    color: var(--text);
    background: var(--bg);
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .student-chat-config .sidebar {
    width: 68px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    border-right: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
    z-index: 10;
  }

  .student-chat-config .sidebar-logo {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }

  .student-chat-config .step-dots {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }

  .student-chat-config .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border2);
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
  }
  .student-chat-config .step-dot.done {
    background: var(--accent);
    cursor: pointer;
  }
  .student-chat-config .step-dot.active {
    background: var(--accent);
    transform: scale(1.4);
    box-shadow: 0 0 0 3px var(--accentS2);
  }
  .student-chat-config .step-dot.done:hover::after {
    content: 'Revenir';
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--text);
    color: var(--bg);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
  }

  .student-chat-config .sidebar-back {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: none;
    color: var(--text3);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;
  }
  .student-chat-config .sidebar-back:hover {
    border-color: var(--border2);
    color: var(--text);
    background: var(--bg2);
  }
  .student-chat-config .sidebar-back:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  /* ── Main ── */
  .student-chat-config .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Tab bar ── */
  .student-chat-config .tabbar {
    height: 46px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 6px;
    flex-shrink: 0;
  }

  .student-chat-config .tab {
    height: 28px;
    padding: 0 14px;
    border-radius: 7px;
    font-size: 12.5px;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 500;
    border: 1px solid transparent;
    background: none;
    color: var(--text3);
    cursor: default;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }
  .student-chat-config .tab.active {
    background: var(--bg2);
    border-color: var(--border);
    color: var(--text);
  }
  .student-chat-config .tab-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
  }

  /* ── Content area ── */
  .student-chat-config .content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 28px 24px;
  }

  .student-chat-config .step-card {
    width: 100%;
    max-width: 560px;
    min-height: 560px;
    animation: studentChatStepIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes studentChatStepIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .student-chat-config .step-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 14px;
  }

  .student-chat-config .step-question {
    font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-size: clamp(24px, 4vw, 34px);
    line-height: 1.3;
    color: var(--text);
    margin-bottom: 32px;
  }

  .student-chat-config .step-question em {
    font-style: italic;
    color: var(--accent);
  }

  /* Choices */
  .student-chat-config .choices {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 320px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .student-chat-config .choice-btn {
    width: 100%;
    padding: 14px 18px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    transition: all 0.18s;
    position: relative;
  }
  .student-chat-config .choice-btn:hover {
    border-color: var(--accent);
    background: var(--accentS);
    transform: translateX(4px);
  }
  .student-chat-config .choice-btn.selected {
    border-color: var(--accent);
    background: var(--accentS);
    color: var(--accent);
  }

  .student-chat-config .choice-color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .student-chat-config .choice-arrow {
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.15s;
    color: var(--accent);
    font-size: 16px;
  }
  .student-chat-config .choice-btn:hover .choice-arrow { opacity: 1; }

  /* Text input */
  .student-chat-config .text-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .student-chat-config .text-field {
    width: 100%;
    padding: 14px 18px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--surface);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
    resize: none;
    line-height: 1.5;
  }
  .student-chat-config .text-field::placeholder { color: var(--text3); }
  .student-chat-config .text-field:focus { border-color: var(--accent); }

  .student-chat-config .submit-btn {
    align-self: flex-end;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
  }
  .student-chat-config .submit-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .student-chat-config .submit-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  /* Motivation */
  .student-chat-config .motivation {
    margin-top: 28px;
    padding: 12px 16px;
    border-radius: 10px;
    background: var(--accentS2);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .student-chat-config .motivation-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--accentS);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .student-chat-config .motivation-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 2px;
  }
  .student-chat-config .motivation-sub {
    font-size: 11.5px;
    color: var(--text2);
  }

  /* Done state */
  .student-chat-config .done-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 560px;
    min-height: 560px;
    gap: 16px;
    text-align: center;
    animation: studentChatStepIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  .student-chat-config .done-check {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid var(--accent);
    background: var(--accentS);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: var(--accent);
  }

  .student-chat-config .done-title {
    font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-size: 28px;
    color: var(--text);
    line-height: 1.2;
  }

  .student-chat-config .done-sub {
    font-size: 14px;
    color: var(--text3);
    line-height: 1.7;
    max-width: 340px;
  }

  .student-chat-config .done-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 30px;
    border-radius: 12px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 4px;
  }
  .student-chat-config .done-btn:hover { opacity: 0.88; transform: translateY(-2px); }
  .student-chat-config .done-btn:disabled {
    opacity: 0.88;
    cursor: wait;
    transform: none;
  }

  .student-chat-config .doc-cover-preview {
    width: 100%;
    max-width: 440px;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(155deg, #e4eaf3 0%, #f4f7fb 55%, #eef2f7 100%);
    border: 1px solid var(--border);
    box-shadow:
      0 4px 6px -1px rgba(15, 23, 42, 0.07),
      0 22px 44px -14px rgba(15, 23, 42, 0.2);
    padding: 14px 12px 16px;
  }
  .student-chat-config .doc-cover-preview img {
    width: 100%;
    display: block;
    aspect-ratio: 210 / 297;
    object-fit: contain;
    object-position: center top;
    background: #fff;
    border-radius: 6px;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.06);
  }

  @keyframes studentChatSpin {
    to { transform: rotate(360deg); }
  }

  /* Progress bar at bottom of content */
  .student-chat-config .progress-bar-wrap {
    height: 3px;
    background: var(--border);
    position: relative;
    flex-shrink: 0;
  }
  .student-chat-config .progress-bar-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.5s ease;
    border-radius: 0 2px 2px 0;
  }

  /* Welcome / initial */
  .student-chat-config .welcome-card {
    width: 100%;
    max-width: 560px;
    min-height: 560px;
    animation: studentChatStepIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .student-chat-config .welcome-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: var(--accentS);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }
  .student-chat-config .welcome-title {
    font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-size: clamp(22px, 4vw, 32px);
    color: var(--text);
    line-height: 1.25;
  }
  .student-chat-config .welcome-sub {
    font-size: 14px;
    color: var(--text3);
    line-height: 1.7;
    max-width: 400px;
  }
  .student-chat-config .welcome-prompts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 16px;
  }
  .student-chat-config .welcome-prompt {
    padding: 10px 18px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--text2);
    cursor: pointer;
    transition: all 0.18s;
  }
  .student-chat-config .welcome-prompt:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accentS);
  }

  /* Bottom bar (fake input when not in text mode) */
  .student-chat-config .bottom-bar {
    border-top: 1px solid var(--border);
    background: var(--surface);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .student-chat-config .bottom-fake {
    flex: 1;
    padding: 10px 14px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--bg2);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 13.5px;
    color: var(--text3);
    cursor: default;
  }
  .student-chat-config .bottom-send {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    border: none;
    background: var(--accent);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: not-allowed;
    opacity: 0.4;
  }

  /* Mobile nav (replaces sidebar) — hidden on desktop */
  .student-chat-config .mobile-nav-bar {
    display: none;
  }

  @media (max-width: 768px) {
    .student-chat-config .sidebar {
      display: none !important;
    }

    .student-chat-config .mobile-nav-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 52px;
      padding: 8px 12px;
      padding-left: max(12px, env(safe-area-inset-left, 0px));
      padding-right: max(12px, env(safe-area-inset-right, 0px));
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      flex-shrink: 0;
    }

    .student-chat-config .mobile-back {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text2);
      flex-shrink: 0;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .student-chat-config .mobile-back:active:not(:disabled) {
      background: var(--bg2);
    }
    .student-chat-config .mobile-back:disabled {
      opacity: 0.28;
      cursor: not-allowed;
    }

    .student-chat-config .mobile-step-meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .student-chat-config .mobile-step-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .student-chat-config .mobile-progress-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      line-height: 1.25;
    }

    .student-chat-config .mobile-dots {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      justify-content: flex-end;
      align-items: center;
      align-content: center;
      flex-shrink: 0;
      max-width: 112px;
      min-height: 0;
    }
    /* Bouton fixe: évite la zone tactile 44px imposée aux div[role=button] */
    .student-chat-config .mobile-dot-btn {
      flex: 0 0 auto;
      width: 14px;
      height: 14px;
      min-width: 14px;
      min-height: 14px;
      max-width: 14px;
      max-height: 14px;
      padding: 0;
      margin: 0;
      border: none;
      background: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: default;
      -webkit-tap-highlight-color: transparent;
      box-sizing: border-box;
    }
    .student-chat-config .mobile-dot-btn:not(:disabled) {
      cursor: pointer;
    }
    .student-chat-config .mobile-dot-btn:disabled {
      cursor: default;
      opacity: 1;
    }
    .student-chat-config .mobile-dot-inner {
      width: 7px;
      height: 7px;
      min-width: 7px;
      min-height: 7px;
      border-radius: 50%;
      background: var(--border2);
      transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
      pointer-events: none;
      display: block;
    }
    .student-chat-config .mobile-dot-btn.done .mobile-dot-inner {
      background: var(--accent);
    }
    .student-chat-config .mobile-dot-btn.active .mobile-dot-inner {
      background: var(--accent);
      transform: scale(1.25);
      box-shadow: 0 0 0 2px var(--accentS2);
    }

    .student-chat-config .tabbar {
      height: auto;
      min-height: 40px;
      padding: 6px 12px;
      gap: 8px;
    }
    .student-chat-config .tab:not(.active) {
      display: none;
    }
    .student-chat-config .tab.active {
      width: 100%;
      justify-content: center;
      border: none;
      background: transparent;
      font-size: 12px;
    }

    .student-chat-config .content {
      padding: 16px 14px 20px;
      padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
      align-items: stretch;
      justify-content: flex-start;
    }

    .student-chat-config .step-card,
    .student-chat-config .welcome-card,
    .student-chat-config .done-card {
      min-height: unset;
      max-width: 100%;
    }

    .student-chat-config .step-question {
      font-size: clamp(20px, 5.2vw, 28px);
      margin-bottom: 20px;
    }

    .student-chat-config .choices {
      max-height: min(50vh, 380px);
    }

    .student-chat-config .choice-btn:hover {
      transform: none;
    }

    .student-chat-config .submit-btn {
      align-self: stretch;
      width: 100%;
      justify-content: center;
    }

    .student-chat-config .bottom-bar {
      padding: 10px 12px;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    }

    .student-chat-config .done-title {
      font-size: clamp(22px, 6vw, 28px);
    }
  }
`

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    key: 'titre',
    question: () => 'Quel est le titre de ton rapport ?',
    inputMode: 'text',
    placeholder: 'Ex : Rapport de stage chez Ecobank Sénégal…',
    progress: 14,
    label: 'Étape 1 sur 9',
    motivation: { icon: '📄', title: 'Tu es au bon endroit', sub: 'Déjà 2 340 étudiants ont créé leur rapport ici' },
  },
  {
    key: 'type',
    question: (d) => `Super — "${d.titre}" \nC'est quel type de document ?`,
    inputMode: 'choices',
    choices: () => [
      { label: 'Rapport de stage', value: 'stage' },
      { label: 'Mémoire / TFE', value: 'memoire' },
      { label: 'Rapport de projet', value: 'projet' },
      { label: 'Exposé académique', value: 'expose' },
    ],
    progress: 28,
    label: 'Étape 2 sur 9',
  },
  {
    key: 'entreprise',
    question: () => "Nom de l'entreprise et la ville ?",
    inputMode: 'text',
    placeholder: 'Ex : Orange CI — Abidjan',
    progress: 42,
    label: 'Étape 3 sur 9',
    motivation: { icon: '⚡', title: 'Bon rythme !', sub: 'Tu avances vraiment bien — continue' },
    skipIf: (d) => d.type !== 'stage',
  },
  {
    key: 'duree',
    question: (d) =>
      d.type === 'stage'
        ? `${d.entreprise} — beau choix !\nC'était une immersion de combien de temps ?`
        : 'Quelle est la durée de travail sur ce document ?',
    inputMode: 'choices',
    choices: (d) =>
      d.type === 'stage'
        ? [
            { label: '1 à 4 semaines', value: '1-4 semaines' },
            { label: '1 à 3 mois', value: '1-3 mois' },
            { label: '3 à 6 mois', value: '3-6 mois' },
            { label: 'Plus de 6 mois', value: '+6 mois' },
          ]
        : [
            { label: 'Quelques jours', value: 'quelques jours' },
            { label: 'Quelques semaines', value: 'quelques semaines' },
            { label: 'Plusieurs mois', value: 'plusieurs mois' },
          ],
    progress: 56,
    label: 'Étape 4 sur 9',
  },
  {
    key: 'niveau',
    question: () => "Ton niveau d'études actuel ?",
    inputMode: 'choices',
    choices: () => [
      { label: 'Licence / BTS / DUT', value: 'L' },
      { label: 'Master 1', value: 'M1' },
      { label: 'Master 2 / MBA', value: 'M2' },
      { label: 'Ingénieur', value: 'Ingénieur' },
      { label: 'Doctorat', value: 'Doctorat' },
    ],
    progress: 70,
    label: 'Étape 5 sur 9',
    motivation: { icon: '🎓', title: 'Niveau pro garanti', sub: 'Structure adaptée à ton niveau académique' },
  },
  {
    key: 'pages',
    question: () => 'Quelle longueur vises-tu pour ton rapport ?',
    inputMode: 'choices',
    choices: () => [
      { label: 'Court (8 à 12 pages)', value: '10' },
      { label: 'Standard (15 à 25 pages)', value: '20' },
      { label: 'Complet (30 à 40 pages)', value: '35' },
      { label: 'Très complet (40 à 60 pages)', value: '45' },
    ],
    progress: 84,
    label: 'Étape 6 sur 9',
  },
  {
    key: 'chapitres',
    question: (d) => `Parfait pour ${d.pages || '20'} pages.\nCombien de chapitres principaux veux-tu ?`,
    inputMode: 'choices',
    choices: () => [
      { label: '3 chapitres (léger)', value: '3' },
      { label: '4 chapitres (équilibré)', value: '4' },
      { label: '5 chapitres (détaillé)', value: '5' },
    ],
    progress: 92,
    label: 'Étape 7 sur 9',
    motivation: { icon: '📚', title: 'Structure intelligente', sub: 'On répartira la charge pour éviter les blocs trop lourds' },
  },
  {
    key: 'couleur',
    question: () => 'Quelle couleur principale pour ton rapport ?',
    inputMode: 'choices',
    choices: () => [
      { label: 'Bleu professionnel', value: '#1B4FD8', color: '#1B4FD8' },
      { label: 'Vert forêt', value: '#059669', color: '#059669' },
      { label: 'Violet moderne', value: '#7C3AED', color: '#7C3AED' },
      { label: 'Rouge vif', value: '#DC2626', color: '#DC2626' },
      { label: 'Gris ardoise', value: '#374151', color: '#374151' },
    ],
    progress: 96,
    label: 'Étape 8 sur 9',
  },
  {
    key: 'template',
    question: () => 'Quel design de couverture te correspond ?',
    inputMode: 'choices',
    choices: () => [
      { label: 'Classique & sobre', value: 'classic' },
      { label: 'Moderne & épuré', value: 'minimal' },
      { label: 'Audacieux & coloré', value: 'bold' },
      { label: 'Bipartite pro', value: 'split' },
    ],
    progress: 99,
    label: 'Étape 9 sur 9',
    motivation: { icon: '✅', title: 'Presque là !', sub: 'Ton espace d\'édition se prépare…' },
  },
]

function getVisibleSteps(data: StudentData) {
  return STEPS.filter((s) => !s.skipIf || !s.skipIf(data))
}

export default function StudentChatConfig() {
  const router = useRouter()
  const { status, data: session } = useSession()
  const { profile } = useProfile()
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<FlowPhase>('welcome')
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<StudentData>({})
  const [inputValue, setInputValue] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)
  const [stepKey, setStepKey] = useState(0) // force re-mount for animation
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    }
  }, [])

  const visibleSteps = getVisibleSteps(data)
  const currentStep = phase === 'step' ? visibleSteps[stepIdx] : null

  const startFlow = () => {
    setPhase('step')
    setStepIdx(0)
    setStepKey((k) => k + 1)
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    focusTimerRef.current = setTimeout(() => inputRef.current?.focus(), 150)
  }

  const goNext = useCallback((value: string, currentStepLocal?: Step) => {
    const step = currentStepLocal || currentStep
    if (!step) return
    const newData = { ...data, [step.key]: value }
    setData(newData)
    setInputValue('')

    const nextVisible = getVisibleSteps(newData)
    const nextIdx = stepIdx + 1

    if (nextIdx >= nextVisible.length) {
      setPhase('done')
    } else {
      setStepIdx(nextIdx)
      setStepKey((k) => k + 1)
      if (nextVisible[nextIdx].inputMode === 'text') {
        if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
        focusTimerRef.current = setTimeout(() => inputRef.current?.focus(), 200)
      }
    }
  }, [data, stepIdx, currentStep])

  const goBack = useCallback((targetIdx?: number) => {
    const idx = targetIdx !== undefined ? targetIdx : Math.max(0, stepIdx - 1)
    if (phase === 'done') {
      setPhase('step')
      setStepIdx(visibleSteps.length - 1)
      setStepKey((k) => k + 1)
      return
    }
    if (stepIdx === 0) {
      setPhase('welcome')
      return
    }
    setStepIdx(idx)
    setStepKey((k) => k + 1)
    setInputValue('')
  }, [phase, stepIdx, visibleSteps.length])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault()
      goNext(inputValue.trim())
    }
  }

  const progress =
    phase === 'welcome' ? 0
    : phase === 'done' ? 100
    : currentStep?.progress ?? 0

  const canGoBack = phase === 'step' || phase === 'done'

  const studentDisplayName = session?.user?.name?.trim() ?? ''

  const docPreviewSrc = useMemo(
    () =>
      buildStudentCoverPreviewDataUri({
        data,
        profile,
        studentName: studentDisplayName,
      }),
    [data, profile, studentDisplayName],
  )

  const handleFinish = () => {
    if (isFinishing) return
    setIsFinishing(true)
    const payload = {
      ...data,
      pages: data.pages || '20',
      chapitres: data.chapitres || '4',
    }
    try {
      const serialized = JSON.stringify(payload)
      sessionStorage.setItem('eetra-student-config', serialized)
      localStorage.setItem('eetra-student-config', serialized)
    } catch {}
    const target = '/editor?from=student-onboarding'
    if (status === 'authenticated') {
      router.push(target)
      return
    }
    router.push(`/login?redirect=${encodeURIComponent(target)}`)
  }

  if (!mounted) {
    return (
      <>
        <style>{css}</style>
        <div className="student-chat-config" suppressHydrationWarning />
      </>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div className="student-chat-config" suppressHydrationWarning>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          {/* Logo mark */}
          <div className="sidebar-logo">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
              <rect width="32" height="32" rx="7" fill="#1B4FD8"/>
              <path d="M10 8h8l5 5v11a1 1 0 01-1 1H10a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="white" strokeWidth="1.5" fill="none"/>
              <polyline points="18 8 18 13 23 13" stroke="white" strokeWidth="1.5" fill="none"/>
              <line x1="12" y1="17" x2="20" y2="17" stroke="white" strokeWidth="1.5"/>
              <line x1="12" y1="20" x2="20" y2="20" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Step dots */}
          <div className="step-dots">
            {phase !== 'welcome' && visibleSteps.map((s, i) => {
              const isDone = phase === 'done' || i < stepIdx
              const isActive = phase === 'step' && i === stepIdx
              return (
                <div
                  key={s.key}
                  className={`step-dot${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}
                  title={isDone ? `Revenir : ${s.label}` : ''}
                  onClick={() => isDone && goBack(i)}
                />
              )
            })}
          </div>

          {/* Back button */}
          <button
            className="sidebar-back"
            onClick={() => goBack()}
            disabled={!canGoBack}
            title="Étape précédente"
          >
            <ArrowLeft size={15} />
          </button>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          {/* Mobile: barre retour + étape (pas de sidebar) */}
          <div className="mobile-nav-bar">
            <button
              type="button"
              className="mobile-back"
              onClick={() => goBack()}
              disabled={!canGoBack}
              title="Retour"
              aria-label="Étape précédente"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="mobile-step-meta">
              {phase === 'welcome' && (
                <>
                  <span className="mobile-step-title">Configuration</span>
                  <span className="mobile-progress-text">Crée ton rapport étape par étape</span>
                </>
              )}
              {phase === 'step' && currentStep && (
                <>
                  <span className="mobile-step-title">{currentStep.label}</span>
                  <span className="mobile-progress-text">
                    Étape {stepIdx + 1} / {visibleSteps.length}
                  </span>
                </>
              )}
              {phase === 'done' && (
                <>
                  <span className="mobile-step-title">Récapitulatif</span>
                  <span className="mobile-progress-text">Tout est prêt</span>
                </>
              )}
            </div>
            {phase !== 'welcome' && (
              <div className="mobile-dots" role="group" aria-label="Progression des étapes">
                {visibleSteps.map((s, i) => {
                  const isDone = phase === 'done' || i < stepIdx
                  const isActive = phase === 'step' && i === stepIdx
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className={`mobile-dot-btn${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}
                      disabled={!isDone}
                      title={isDone ? `Revenir : ${s.label}` : `Étape ${i + 1}`}
                      aria-label={isDone ? `Revenir à ${s.label}` : `Étape ${i + 1} (non atteinte)`}
                      aria-current={isActive ? 'step' : undefined}
                      onClick={() => isDone && goBack(i)}
                    >
                      <span className="mobile-dot-inner" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div className="tabbar">
            <div className="tab active">
              <span className="tab-dot" />
              Configuration du rapport
            </div>
            {['Mes rapports', 'Paramètres'].map((t) => (
              <div key={t} className="tab">{t}</div>
            ))}
          </div>

          {/* Content */}
          <div className="content">

            {/* Welcome */}
            {phase === 'welcome' && (
              <div className="welcome-card">
                <div className="welcome-icon">
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
                    <path d="M13 4C8.03 4 4 8.03 4 13s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" fill="var(--accent)" opacity="0.15"/>
                    <path d="M13 8v5l3 3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h1 className="welcome-title">
                  Créons ton rapport<br />ensemble.
                </h1>
                <p className="welcome-sub">
                  Réponds à quelques questions et obtiens un document<br />
                  professionnel, prêt à éditer — en moins de 3 minutes.
                </p>
                <div className="welcome-prompts">
                  {['Rapport de stage', 'Mémoire / TFE', 'Rapport de projet', 'Exposé académique'].map((p) => (
                    <button key={p} className="welcome-prompt" onClick={startFlow}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step */}
            {phase === 'step' && currentStep && (
              <div key={stepKey} className="step-card">
                <div className="step-label">{currentStep.label}</div>
                <h2 className="step-question">
                  {currentStep.question(data).split('\n').map((line, i) => (
                    <span key={i}>{i > 0 && <br />}{line}</span>
                  ))}
                </h2>

                {currentStep.inputMode === 'choices' && (
                  <div className="choices">
                    {(currentStep.choices?.(data) ?? []).map((c) => (
                      <button
                        key={c.value}
                        className="choice-btn"
                        onClick={() => goNext(c.value)}
                      >
                        {c.color && (
                          <span className="choice-color-dot" style={{ background: c.color }} />
                        )}
                        {c.label}
                        <span className="choice-arrow">→</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentStep.inputMode === 'text' && (
                  <div className="text-input-wrap">
                    <textarea
                      ref={inputRef}
                      className="text-field"
                      rows={2}
                      placeholder={currentStep.placeholder}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      className="submit-btn"
                      disabled={!inputValue.trim()}
                      onClick={() => goNext(inputValue.trim())}
                    >
                      Continuer
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {currentStep.motivation && (
                  <div className="motivation">
                    <div className="motivation-icon">{currentStep.motivation.icon}</div>
                    <div>
                      <div className="motivation-title">{currentStep.motivation.title}</div>
                      <div className="motivation-sub">{currentStep.motivation.sub}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Done */}
            {phase === 'done' && (
              <div className="done-card">
                <div className="done-check">✓</div>
                <h2 className="done-title">Rapport configuré !</h2>
                <p className="done-sub">
                  "{data.titre ?? 'Ton rapport'}" est prêt à être rédigé.<br />
                  L'export PDF / Word se débloque à la fin de ta rédaction.
                </p>
                <div className="doc-cover-preview">
                  <img
                    src={docPreviewSrc}
                    alt="Aperçu de la couverture — mise en page institutionnelle avec marque EETRA"
                  />
                </div>
                <button className="done-btn" onClick={handleFinish} disabled={isFinishing}>
                  {isFinishing ? 'Chargement...' : 'Terminer mon rapport'}
                  {isFinishing ? (
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.5)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'studentChatSpin .7s linear infinite' }} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Bottom bar */}
          {phase === 'step' && currentStep?.inputMode !== 'text' && (
            <div className="bottom-bar">
              <div className="bottom-fake">Choisis une option ci-dessus…</div>
              <div className="bottom-send"><Send size={14} /></div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}