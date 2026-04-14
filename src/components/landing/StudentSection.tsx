'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, GraduationCap, FileText, Clock, Star } from 'lucide-react'

/**
 * StudentSection — Section landing page pour cibler les étudiants.
 * À placer entre <Features /> et <MarqueeBanner /> dans src/app/page.tsx
 * ou importer directement dans la landing.
 *
 * Usage dans page.tsx :
 *   import { StudentSection } from '@/components/landing/StudentSection'
 *   ...
 *   <StatsBar />
 *   <StudentSection />   ← ici
 *   <Features />
 */
export function StudentSection() {
  const router = useRouter()

  const perks = [
    {
      icon: <Clock size={16} />,
      label: 'Prêt en 3 min',
      sub: 'Configuration guidée par chat',
    },
    {
      icon: <FileText size={16} />,
      label: 'Structure académique',
      sub: 'Adaptée à ton niveau',
    },
    {
      icon: <Star size={16} />,
      label: 'Gratuit à rédiger',
      sub: 'Export PDF au moment de finir',
    },
  ]

  return (
    <section
      id="etudiants"
      style={{
        width: '100%',
        padding: '88px 0',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: 'absolute',
          top: '-60%',
          right: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(107,71,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 56px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 72,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        className="student-grid"
      >
        {/* Left — copy */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 99,
              background: 'var(--accentS)',
              border: '1px solid var(--accent)',
              marginBottom: 22,
              opacity: 0.9,
            }}
          >
            <GraduationCap size={13} color="var(--accent)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '.16em',
                textTransform: 'uppercase' as const,
                color: 'var(--accent)',
              }}
            >
              Espace Étudiant
            </span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 48px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: 'var(--text)',
              marginBottom: 18,
            }}
          >
            Ton rapport de stage,
            <br />
            <span
              style={{
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--text3)',
              }}
            >
              en quelques minutes.
            </span>
          </h2>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.75,
              color: 'var(--text3)',
              marginBottom: 32,
              maxWidth: 460,
            }}
          >
            Un assistant te pose les bonnes questions, configure ta structure, choisit
            le design — et tu n&apos;as plus qu&apos;à rédiger. L&apos;export se débloque à la fin.
          </p>

          {/* Perks */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 12,
              marginBottom: 36,
            }}
          >
            {perks.map((p) => (
              <div
                key={p.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--accentS)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  {p.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text)',
                      lineHeight: 1.3,
                    }}
                  >
                    {p.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text4)' }}>{p.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/onboarding/student')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--electric) 100%)',
              color: '#fff',
              border: 'none',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 28px var(--electricGlow)',
              fontFamily: "'Bricolage Grotesque', sans-serif",
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 14px 36px var(--electricGlow)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 8px 28px var(--electricGlow)'
            }}
          >
            Créer mon rapport de stage
            <ArrowRight size={16} />
          </button>

          <p
            style={{
              fontSize: 11,
              color: 'var(--text4)',
              marginTop: 10,
            }}
          >
            Aucune carte bancaire — gratuit jusqu&apos;à l&apos;export
          </p>
        </div>

        {/* Right — chat preview mockup */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          }}
          className="student-mockup"
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg2)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                color: '#fff',
              }}
            >
              ✦
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                Configurateur de rapport
              </div>
              <div style={{ fontSize: 10, color: 'var(--text4)' }}>
                Répond à une question à la fois
              </div>
            </div>
          </div>

          {/* Mock messages */}
          <div style={{ padding: '18px 18px 6px', display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {/* Bot message */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                ✦
              </div>
              <div
                style={{
                  padding: '9px 13px',
                  borderRadius: '12px 12px 12px 2px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text)',
                  lineHeight: 1.55,
                  maxWidth: '80%',
                }}
              >
                Quel est le <strong>titre de ton rapport</strong> ?
              </div>
            </div>

            {/* User reply */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <div
                style={{
                  padding: '9px 13px',
                  borderRadius: '12px 12px 2px 12px',
                  background: 'var(--accent)',
                  fontSize: 12,
                  color: '#fff',
                  lineHeight: 1.55,
                  maxWidth: '80%',
                }}
              >
                Rapport de stage chez Ecobank CI
              </div>
            </div>

            {/* Bot message 2 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                ✦
              </div>
              <div
                style={{
                  padding: '9px 13px',
                  borderRadius: '12px 12px 12px 2px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text)',
                  lineHeight: 1.55,
                  maxWidth: '80%',
                }}
              >
                C&apos;est quel <strong>type de document</strong> ?
              </div>
            </div>

            {/* Choices preview */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap' as const,
                gap: 6,
                paddingLeft: 34,
                paddingBottom: 6,
              }}
            >
              {['📋 Rapport de stage', '📚 Mémoire', '🛠 Projet'].map((c) => (
                <span
                  key={c}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border2)',
                    fontSize: 11,
                    color: 'var(--text2)',
                    background: 'var(--surface)',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Fake input */}
          <div
            style={{
              padding: '10px 18px 14px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg2)',
                fontSize: 11,
                color: 'var(--text4)',
              }}
            >
              Choisis une option ci-dessus…
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--bg3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={13} color="var(--text4)" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .student-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            padding: 0 24px !important;
          }
          .student-mockup {
            display: none !important;
          }
        }
        @media (max-width: 479px) {
          .student-grid {
            padding: 0 18px !important;
          }
        }
      `}</style>
    </section>
  )
}

// Needed for icon in fake input
function Send({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}