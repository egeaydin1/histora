'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CandleAudio } from '@/components/histora/CandleAudio'
import { sfx } from '@/lib/sounds'
import { useLang, LangToggle } from '@/lib/i18n'

// Deterministic pseudo-random for ember positions (avoids hydration mismatch)
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: ((i * 13) % 70) / 10,
  duration: 7 + ((i * 7) % 50) / 10,
  size: 2 + (i % 3),
}))

export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useLang()
  const [stage, setStage] = useState(0)
  const [leaving, setLeaving] = useState(false)

  // Staged reveal: flame → wordmark → headline → CTA
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 350),
      setTimeout(() => setStage(2), 950),
      setTimeout(() => setStage(3), 1750),
      setTimeout(() => setStage(4), 2450),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const enter = () => {
    sfx.click()
    sfx.intro()
    setLeaving(true)
    setTimeout(() => router.push('/characters'), 650)
  }

  return (
    <>
      <CandleAudio />
      <main
        className={`onb intro ${['s1', 's2', 's3', 's4'].slice(0, stage).join(' ')}${leaving ? ' leaving' : ''}`}
        onPointerDown={() => sfx.unlock()}
      >
        {/* Floating embers */}
        <div className="embers" aria-hidden>
          {EMBERS.map((e, i) => (
            <span
              key={i}
              style={{
                left: `${e.left}%`,
                width: e.size,
                height: e.size,
                animationDelay: `${e.delay}s`,
                animationDuration: `${e.duration}s`,
              }}
            />
          ))}
        </div>

        <div className="onb-mark intro-mark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span className="flame intro-flame" style={{ width: 8, height: 14, filter: 'blur(0.4px)', boxShadow: '0 0 14px var(--amber)' }} />
            <span className="wordmark">Histora</span>
          </span>
          <LangToggle onSwitch={() => sfx.click()} />
        </div>

        <div className="onb-center">
          <div className="eyebrow onb-eyebrow intro-eyebrow">{t('intro.eyebrow')}</div>
          <h1 className="onb-title intro-title">
            <span className="line">{t('intro.title.1')}</span>{' '}
            <span className="line" dangerouslySetInnerHTML={{ __html: t('intro.title.2') }} />
          </h1>
          <p className="onb-sub intro-sub">{t('intro.sub')}</p>
          <button
            className="onb-cta quill intro-cta"
            onMouseEnter={() => sfx.hover()}
            onClick={enter}
          >
            <span>{t('intro.cta')}</span>
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="onb-foot intro-foot">
          {t('intro.foot.leaders')}<span className="dot">·</span>{t('intro.foot.philosophers')}
          <span className="dot">·</span>{t('intro.foot.scientists')}<span className="dot">·</span>{t('intro.foot.artists')}
        </div>
      </main>
    </>
  )
}
