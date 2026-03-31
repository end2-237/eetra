'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'

const CSS = `
  .cta-premium {
    width: 100%;
    padding: 80px 0;
    background: linear-gradient(135deg, rgba(27,79,216,.08) 0%, rgba(124,58,237,.06) 100%);
    position: relative;
    overflow: hidden;
  }

  .cta-glow-1 {
    position: absolute;
    top: -200px;
    right: -200px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(27,79,216,.15), transparent 70%);
    pointer-events: none;
  }

  .cta-glow-2 {
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(91,155,255,.1), transparent 70%);
    pointer-events: none;
  }

  .cta-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 48px;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .cta-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 99px;
    background: rgba(27,79,216,.12);
    border: 1px solid rgba(27,79,216,.2);
    color: var(--accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .18em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  .cta-heading {
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 900;
    letter-spacing: -.04em;
    color: var(--text);
    line-height: 1.15;
    margin-bottom: 16px;
  }

  .cta-subheading {
    font-size: 18px;
    color: var(--text3);
    line-height: 1.6;
    margin-bottom: 40px;
  }

  .cta-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .cta-primary-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 15px 32px;
    border-radius: 14px;
    background: linear-gradient(135deg, #1B4FD8 0%, #5B9BFF 100%);
    color: #fff;
    border: none;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 12px 40px rgba(27,79,216,.4);
    transition: all .25s cubic-bezier(.23,1,.32,1);
    position: relative;
    overflow: hidden;
  }

  .cta-primary-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent);
    transform: translateX(-100%);
    transition: transform .6s;
  }

  .cta-primary-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 60px rgba(27,79,216,.5);
  }

  .cta-primary-btn:hover::before {
    transform: translateX(100%);
  }

  .cta-secondary-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 15px 28px;
    border-radius: 14px;
    background: rgba(27,79,216,.06);
    color: var(--text2);
    border: 1.5px solid rgba(27,79,216,.2);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all .25s cubic-bezier(.23,1,.32,1);
  }

  .cta-secondary-btn:hover {
    background: rgba(27,79,216,.12);
    border-color: rgba(27,79,216,.3);
    transform: translateY(-2px);
  }

  @media (max-width: 767px) {
    .cta-premium { padding: 60px 0; }
    .cta-container { padding: 0 24px; }
    .cta-heading { font-size: clamp(28px, 4.5vw, 42px); }
    .cta-subheading { font-size: 15px; }
    .cta-buttons { flex-direction: column; gap: 10px; }
    .cta-primary-btn, .cta-secondary-btn { width: 100%; justify-content: center; }
  }
`

export function PremiumCTA() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="cta-premium">
        <div className="cta-glow-1" />
        <div className="cta-glow-2" />

        <div className="cta-container">
          <div className="cta-badge" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all .7s cubic-bezier(.23,1,.32,1)',
          }}>
            <Zap size={12} /> Commencez Gratuitement
          </div>

          <h2 className="cta-heading" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all .8s .1s cubic-bezier(.23,1,.32,1)',
          }}>
            Créez votre premier<br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5B9BFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>document pro</span>
          </h2>

          <p className="cta-subheading" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all .8s .2s cubic-bezier(.23,1,.32,1)',
          }}>
            Rejoignez les 8 000+ professionnels qui créent des documents d&apos;exception avec EETRA.
          </p>

          <div className="cta-buttons" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all .9s .3s cubic-bezier(.23,1,.32,1)',
          }}>
            <button className="cta-primary-btn" onClick={() => router.push('/login')}>
              Essai gratuit <ArrowRight size={16} />
            </button>
            <button className="cta-secondary-btn" onClick={() => {
              const el = document.getElementById('faq')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}>
              Voir les questions
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
