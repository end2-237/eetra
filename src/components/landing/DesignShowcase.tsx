'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const CSS = `
  .showcase-section {
    width: 100%;
    padding: 100px 0;
    background: linear-gradient(135deg, rgba(255,255,255,.6) 0%, rgba(27,79,216,.04) 100%);
    border-top: 1px solid rgba(27,79,216,.08);
    border-bottom: 1px solid rgba(27,79,216,.08);
    position: relative;
    overflow: hidden;
  }

  .showcase-glow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(60px);
  }

  .showcase-header {
    text-align: center;
    margin-bottom: 56px;
    position: relative;
    z-index: 2;
  }

  .showcase-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 99px;
    background: linear-gradient(135deg, rgba(27,79,216,.12), rgba(91,155,255,.08));
    border: 1px solid rgba(27,79,216,.2);
    color: var(--accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .18em;
    text-transform: uppercase;
    margin-bottom: 20px;
    backdrop-filter: blur(8px);
  }

  .showcase-title {
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 900;
    letter-spacing: -.04em;
    color: var(--text);
    line-height: 1.1;
    margin: 0 auto;
    max-width: 600px;
    margin-bottom: 12px;
  }

  .showcase-desc {
    font-size: 16px;
    color: var(--text3);
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  .showcase-card {
    aspect-ratio: 3/4;
    border-radius: 18px;
    overflow: hidden;
    border: 1.5px solid rgba(27,79,216,.12);
    background: rgba(255,255,255,.7);
    backdrop-filter: blur(12px);
    cursor: pointer;
    transition: all .3s cubic-bezier(.23,1,.32,1);
    position: relative;
    box-shadow: 0 8px 32px rgba(0,0,0,.08);
  }

  .showcase-card:hover {
    transform: translateY(-12px);
    border-color: rgba(27,79,216,.25);
    box-shadow: 0 24px 64px rgba(27,79,216,.12);
  }

  .showcase-card-inner {
    width: 100%;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  @media (max-width: 1023px) {
    .showcase-section { padding: 60px 0; }
    .showcase-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .showcase-title { font-size: clamp(24px, 3.5vw, 36px); }
  }

  @media (max-width: 767px) {
    .showcase-section { padding: 48px 0; }
    .showcase-grid { grid-template-columns: 1fr; gap: 14px; }
    .showcase-card { aspect-ratio: auto; height: 280px; }
    .showcase-title { font-size: clamp(20px, 5vw, 28px); }
  }
`

export function DesignShowcase() {
  const [dataIn, setDataIn] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDataIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const designs = [
    { color: '#1B4FD8', name: 'Classic', desc: 'Intemporel et professionnel' },
    { color: '#059669', name: 'Bold', desc: 'Moderne et dynamique' },
    { color: '#374151', name: 'Minimal', desc: 'Épuré et élégant' },
    { color: '#7C3AED', name: 'Split', desc: 'Bicolore et contrasté' },
    { color: '#B45309', name: 'Editorial', desc: 'Journalistique' },
    { color: '#0E7490', name: 'Corporate', desc: 'Institutionnel' },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="showcase-section">
        <div className="showcase-glow" style={{ top: '-100px', right: '-100px', width: '450px', height: '450px', background: 'radial-gradient(ellipse, rgba(27,79,216,.08), transparent 70%)' }} />
        <div className="showcase-glow" style={{ bottom: '-60px', left: '-60px', width: '320px', height: '320px', background: 'radial-gradient(ellipse, rgba(124,58,237,.06), transparent 70%)' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}>
          <div className="showcase-header">
            <div className="showcase-badge" style={{ opacity: dataIn ? 1 : 0, transform: dataIn ? 'translateY(0)' : 'translateY(12px)', transition: 'all .7s cubic-bezier(.23,1,.32,1)' }}>
              <Sparkles size={12} /> 9 Designs Premium
            </div>
            <h2 className="showcase-title" style={{ opacity: dataIn ? 1 : 0, transform: dataIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all .8s .1s cubic-bezier(.23,1,.32,1)' }}>
              Choisissez votre <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5B9BFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>identité</span>
            </h2>
            <p className="showcase-desc" style={{ opacity: dataIn ? 1 : 0, transform: dataIn ? 'translateY(0)' : 'translateY(16px)', transition: 'all .8s .2s cubic-bezier(.23,1,.32,1)' }}>
              Sélectionnez un design qui reflète votre marque. Personnalisez couleurs et polices sans limite.
            </p>
          </div>

          <div className="showcase-grid" style={{ opacity: dataIn ? 1 : 0, transform: dataIn ? 'translateY(0)' : 'translateY(24px)', transition: 'all .9s .3s cubic-bezier(.23,1,.32,1)' }}>
            {designs.map((design, i) => (
              <div key={design.name} className="showcase-card" style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="showcase-card-inner">
                  <div style={{ flex: 1, borderRadius: '12px', background: `linear-gradient(135deg, ${design.color}33 0%, ${design.color}11 100%)`, border: `1px solid ${design.color}22` }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em' }}>
                      {design.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text4)' }}>
                      {design.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
