'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, ApiCharacter } from '@/lib/api'
import { getEnrichment, GRID_SPANS } from '@/lib/characters'
import { padCatalogNumber } from '@/lib/utils'
import { CandleAudio } from '@/components/histora/CandleAudio'
import { sfx } from '@/lib/sounds'
import { useLang, LangToggle } from '@/lib/i18n'

const FILTERS = ['all', 'philosophy', 'science', 'art', 'state'] as const

export default function GalleryPage() {
  const router = useRouter()
  const { t, lang } = useLang()
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
          <nav className="gal-nav" style={{ alignItems: 'center' }}>
            <a href="#" className="active">{t('gal.nav.gallery')}</a>
            <a href="#" onClick={e => { e.preventDefault(); sfx.click(); setLayout(l => l === 'asymmetric' ? 'editorial' : 'asymmetric') }}>
              {layout === 'asymmetric' ? t('gal.nav.editorial') : t('gal.nav.sparse')}
            </a>
            <LangToggle onSwitch={() => sfx.click()} />
          </nav>
        </header>

        <hr className="rule" />

        {/* Hero */}
        <section className="gal-hero">
          <div className="eyebrow">{t('gal.eyebrow')}</div>
          <h1>
            {t('gal.title.1')} <em>{t('gal.title.2')}</em>
          </h1>
          <p className="sub">{t('gal.sub')}</p>
        </section>

        {/* Filters */}
        <div className="gal-meta">
          <div className="filters">
            {FILTERS.map(k => (
              <button
                key={k}
                className={filter === k ? 'on' : ''}
                onMouseEnter={() => sfx.hover()}
                onClick={() => { sfx.click(); setFilter(k) }}
              >
                {t(('gal.filter.' + k) as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
          <div>
            {loading ? '—' : String(filtered.length).padStart(2, '0')} {t('gal.figures')} ·{' '}
            {layout === 'asymmetric' ? t('gal.view.sparse') : t('gal.view.editorial')} {t('gal.view')}
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
              const enrichment = getEnrichment(c.id, c, lang)
              const spans = layout === 'asymmetric' ? (GRID_SPANS[i % 9] || {}) : {}
              const catNo = padCatalogNumber(characters.findIndex(x => x.id === c.id) + 1)

              return (
                <button
                  key={c.id}
                  className="card quill"
                  style={{
                    gridColumn: spans.col,
                    gridRow: spans.row,
                  }}
                  onMouseEnter={() => sfx.hover()}
                  onClick={() => { sfx.click(); router.push(`/chat/${c.id}`) }}
                >
                  <article className="plate">
                    <div className="plate-top">
                      <span className="era">{enrichment.era || c.era}</span>
                      <span className="catno">№&nbsp;{catNo}</span>
                    </div>

                    {c.avatar_url && (
                      <div className="plate-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.avatar_url}
                          alt={c.name}
                          loading="lazy"
                          onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
                        />
                      </div>
                    )}

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
            <div className="eyebrow">{t('gal.empty')}</div>
          </div>
        )}
      </main>
    </>
  )
}
