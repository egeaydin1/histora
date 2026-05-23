'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, ApiCharacter } from '@/lib/api'
import { getEnrichment, GRID_SPANS } from '@/lib/characters'
import { padCatalogNumber } from '@/lib/utils'
import { CandleAudio } from '@/components/histora/CandleAudio'

const FILTERS = [
  ['all', 'All'],
  ['philosophy', 'Philosophers'],
  ['science', 'Scientists'],
  ['art', 'Artists'],
  ['state', 'Leaders'],
] as const

export default function GalleryPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<ApiCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [layout, setLayout] = useState<'asymmetric' | 'editorial'>('asymmetric')
  const [hover, setHover] = useState<'candle' | 'warm' | 'quote'>('candle')

  useEffect(() => {
    api.getCharacters().then(({ data }) => {
      if (data) setCharacters(data)
      setLoading(false)
    })
  }, [])

  const filtered = characters.filter(c => {
    if (filter === 'all') return true
    return c.category?.toLowerCase().includes(filter)
  })

  return (
    <>
      <CandleAudio />

      <main className={`gal hover-${hover}`}>
        {/* Header */}
        <header className="gal-top">
          <Link href="/" className="gal-mark">
            <span className="flame" style={{ width: 7, height: 12, boxShadow: '0 0 10px var(--amber)' }} />
            <span>Histora</span>
          </Link>
          <nav className="gal-nav">
            <a href="#" className="active">Gallery</a>
            <a href="#" onClick={e => { e.preventDefault(); setLayout(l => l === 'asymmetric' ? 'editorial' : 'asymmetric') }}>
              {layout === 'asymmetric' ? 'Editorial view' : 'Sparse view'}
            </a>
          </nav>
        </header>

        <hr className="rule" />

        {/* Hero */}
        <section className="gal-hero">
          <div className="eyebrow">The Gallery · Vol. I</div>
          <h1>
            Speak with the minds that <em>shaped history.</em>
          </h1>
          <p className="sub">
            Figures from the agora of Athens to a Mexico City studio.
            Choose one and sit a while.
          </p>
        </section>

        {/* Filters */}
        <div className="gal-meta">
          <div className="filters">
            {FILTERS.map(([k, l]) => (
              <button
                key={k}
                className={filter === k ? 'on' : ''}
                onClick={() => setFilter(k)}
              >
                {l}
              </button>
            ))}
          </div>
          <div>
            {loading ? '—' : String(filtered.length).padStart(2, '0')} figures ·{' '}
            {layout === 'asymmetric' ? 'Sparse' : 'Editorial'} view
          </div>
        </div>

        <hr className="rule" style={{ marginBottom: 40 }} />

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className={`gal-grid ${layout}`}>
            {filtered.map((c, i) => {
              const enrichment = getEnrichment(c.id, c)
              const spans = layout === 'asymmetric' ? (GRID_SPANS[i] || {}) : {}
              const catNo = padCatalogNumber(characters.findIndex(x => x.id === c.id) + 1)

              return (
                <button
                  key={c.id}
                  className="card quill"
                  style={{
                    gridColumn: spans.col,
                    gridRow: spans.row,
                  }}
                  onClick={() => router.push(`/chat/${c.id}`)}
                >
                  <article className="plate">
                    <div className="plate-top">
                      <span className="era">{enrichment.era || c.era}</span>
                      <span className="catno">№&nbsp;{catNo}</span>
                    </div>

                    <div className="plate-name">
                      <h3>{c.name}</h3>
                    </div>

                    <hr className="plate-rule" />

                    <div className="plate-bottom">
                      <div className="plate-meta">
                        <span className="lifespan">{enrichment.lifespan}</span>
                        <span>{enrichment.domain}</span>
                      </div>
                      <p className="desc">{enrichment.desc}</p>
                    </div>

                    {hover === 'quote' && (
                      <div className="plate-quote">
                        <span>"{enrichment.quote}"</span>
                        <span className="attr">— {c.name}</span>
                      </div>
                    )}
                  </article>
                  <span className="edge" />
                </button>
              )
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ivory-faint)' }}>
            <div className="eyebrow">No figures found</div>
          </div>
        )}
      </main>
    </>
  )
}
