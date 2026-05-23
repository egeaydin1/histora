'use client'

import Link from 'next/link'
import { CandleAudio } from '@/components/histora/CandleAudio'

export default function OnboardingPage() {
  return (
    <>
      <CandleAudio />
      <main className="onb">
        <div className="onb-mark">
          <span className="flame" style={{ width: 8, height: 14, filter: 'blur(0.4px)', boxShadow: '0 0 14px var(--amber)' }} />
          <span className="wordmark">Histora</span>
        </div>

        <div className="onb-center">
          <div className="eyebrow onb-eyebrow">An evening with the past</div>
          <h1 className="onb-title">
            Speak with the minds that <em>shaped history.</em>
          </h1>
          <p className="onb-sub">
            Histora is a quiet room. Inside, ten figures who changed the world
            are willing to sit, for as long as you wish, and answer a few
            honest questions. Choose your first conversation.
          </p>
          <Link href="/characters" className="onb-cta quill">
            <span>Enter the gallery</span>
            <span className="arrow">→</span>
          </Link>
        </div>

        <div className="onb-foot">
          Ten figures<span className="dot">·</span>Twenty-four centuries
          <span className="dot">·</span>One conversation at a time
        </div>
      </main>
    </>
  )
}
