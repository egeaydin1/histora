'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, ApiCharacter } from '@/lib/api'
import { getEnrichment } from '@/lib/characters'
import { padCatalogNumber, generateId } from '@/lib/utils'
import { CandleAudio } from '@/components/histora/CandleAudio'
import { useAuth } from '@/contexts/AuthContext'
import { sfx } from '@/lib/sounds'
import { useLang, LangToggle } from '@/lib/i18n'

interface Msg {
  id: string
  role: 'figure' | 'user'
  text: string | string[]
}

// Anonymous demo: this many free messages before sign-in is required.
const DEMO_LIMIT = 30
const DEMO_KEY = 'histora_demo_used'

function getDemoUsed(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(DEMO_KEY) || '0', 10) || 0
}

export default function ChatPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { t, lang } = useLang()

  const [character, setCharacter] = useState<ApiCharacter | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const [demoUsed, setDemoUsed] = useState(0)

  useEffect(() => { setDemoUsed(getDemoUsed()) }, [])

  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Load character
  useEffect(() => {
    if (!characterId) return
    api.getCharacter(decodeURIComponent(characterId)).then(({ data, error }) => {
      if (error || !data) {
        setLoadError(error || 'Character not found')
        return
      }
      setCharacter(data)
      const enrichment = getEnrichment(data.id, data, lang)
      setMessages([{ id: generateId(), role: 'figure', text: enrichment.opener }])
    })
  }, [characterId, lang])

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  // Autosize textarea
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [draft])

  const send = useCallback(async (text: string) => {
    const clean = text.trim()
    if (!clean || !character) return

    // Anonymous visitors get a free demo allowance before sign-in is required
    if (!user && getDemoUsed() >= DEMO_LIMIT) {
      sfx.click()
      setMessages(m => [...m, {
        id: generateId(),
        role: 'figure',
        text: t('chat.demo.limit.msg', { n: DEMO_LIMIT }),
      }])
      return
    }

    sfx.send()
    setMessages(m => [...m, { id: generateId(), role: 'user', text: clean }])
    setDraft('')
    setTyping(true)
    sfx.thinkStart()

    if (!user) {
      // Demo mode — stateless chat, history sent from the client
      const history = messages
        .filter(m => typeof m.text === 'string')
        .map(m => ({
          role: (m.role === 'figure' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.text as string,
        }))

      const { data, error } = await api.sendDemoMessage({
        character_id: character.id,
        message: clean,
        history,
        language: lang,
      })

      if (error || !data) {
        setMessages(m => [...m, {
          id: generateId(),
          role: 'figure',
          text: error?.includes('429') || error?.toLowerCase().includes('limit')
            ? t('chat.demo.day.msg')
            : t('chat.error'),
        }])
      } else {
        const used = getDemoUsed() + 1
        localStorage.setItem(DEMO_KEY, String(used))
        setDemoUsed(used)
        setMessages(m => [...m, { id: generateId(), role: 'figure', text: data.response }])
      }
      setTyping(false)
      sfx.thinkStop()
      sfx.receive()
      return
    }

    const { data, error } = await api.sendMessage({
      character_id: character.id,
      message: clean,
      session_id: sessionId || undefined,
      language: lang,
      mode: 'chat',
    })

    if (error || !data) {
      setMessages(m => [...m, {
        id: generateId(),
        role: 'figure',
        text: t('chat.error'),
      }])
    } else {
      if (!sessionId) setSessionId(data.session_id)
      setMessages(m => [...m, { id: generateId(), role: 'figure', text: data.response }])
    }
    setTyping(false)
    sfx.thinkStop()
    sfx.receive()
  }, [character, sessionId, user, messages, lang, t])

  const enrichment = character ? getEnrichment(character.id, character, lang) : null
  const catNo = character ? padCatalogNumber(1) : '001'

  if (loadError) {
    return (
      <div className="state-center">
        <div className="eyebrow">{t('chat.notfound')}</div>
        <p>{loadError}</p>
        <Link href="/characters">{t('chat.return')}</Link>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="state-center">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    )
  }

  return (
    <>
      <CandleAudio />

      <main className="chat">
        {/* Left aside — typographic museum poster */}
        <aside className="chat-aside">
          <div className="chat-aside-inner">
            <div className="top">
              <Link href="/characters" className="chat-back">
                <span className="arrow">←</span>
                <span>{t('chat.back')}</span>
              </Link>
              <span className="catno">№&nbsp;{catNo}</span>
            </div>

            {character.avatar_url && (
              <div className="aside-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={character.avatar_url}
                  alt={character.name}
                  onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
                />
              </div>
            )}

            <div className="aside-era">{enrichment?.era}</div>
            <h2 className="aside-name">{character.name}</h2>

            <hr className="aside-rule" />

            <div className="aside-meta">
              <div className="col">
                <div className="lbl">{t('chat.lifespan')}</div>
                <div className="val">{enrichment?.lifespan}</div>
              </div>
              <div className="col">
                <div className="lbl">{t('chat.domain')}</div>
                <div className="val">{enrichment?.domain}</div>
              </div>
            </div>

            <div className="aside-quote">
              "{enrichment?.quote}"
              <span className="attr">— {t('chat.attributed')} {character.name.split(' ').slice(-1)[0]}</span>
            </div>
          </div>
        </aside>

        {/* Right side — conversation */}
        <section className="chat-main">
          <header className="chat-header">
            <div className="crumb">
              <b>{t('chat.conversation')}</b>
              <span style={{ margin: '0 14px', opacity: 0.5 }}>·</span>
              <span>{t('chat.begun')}</span>
            </div>
            <div className="actions">
              <LangToggle onSwitch={() => sfx.click()} />
              <button onMouseEnter={() => sfx.hover()} onClick={() => { sfx.click(); router.push('/characters') }}>{t('chat.close')}</button>
            </div>
          </header>

          <div className="chat-scroll" ref={scrollRef}>
            <div className="thread">
              {messages.map(m => (
                <MessageBubble key={m.id} m={m} name={character.name} />
              ))}
              {typing && (
                <div className="msg figure">
                  <div className="who">{character.name.toUpperCase()}</div>
                  <div className="typing"><span /><span /><span /></div>
                </div>
              )}
            </div>
          </div>

          {/* Suggested prompts — only when thread is fresh */}
          {messages.length <= 1 && !typing && enrichment && (
            <div className="prompts">
              <div className="label">{t('chat.ask', { name: character.name.split(' ')[0] })}</div>
              <div className="chips">
                {enrichment.prompts.map((p, i) => (
                  <button key={i} className="chip quill" onMouseEnter={() => sfx.hover()} onClick={() => send(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Demo banner for unauthenticated users */}
          {!user && (
            <div className="auth-banner">
              <span>
                {demoUsed < DEMO_LIMIT
                  ? <>{t('chat.demo.left.1')} <b style={{ color: 'var(--gold)' }}>{DEMO_LIMIT - demoUsed}</b> {t('chat.demo.left.2')} {DEMO_LIMIT} {t('chat.demo.left.3')}</>
                  : <>{t('chat.demo.over', { name: character.name.split(' ')[0] })}</>}
              </span>
              <span>
                <Link href="/login">{t('chat.signin')}</Link>
                {' '}&nbsp;·&nbsp;{' '}
                <Link href="/register">{t('chat.register')}</Link>
              </span>
            </div>
          )}

          {/* Composer */}
          <div className="composer-wrap">
            <div className="composer">
              <textarea
                ref={taRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send(draft)
                  }
                }}
                placeholder={t('chat.write', { name: character.name.split(' ').slice(-1)[0] })}
                rows={1}
                disabled={typing}
              />
              <button
                className={'send' + (draft.trim() ? ' ready' : '')}
                onClick={() => send(draft)}
                disabled={typing}
              >
                <span>{t('chat.send')}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: 0 }}>→</span>
              </button>
              <div className="hint">{t('chat.hint')}</div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function MessageBubble({ m, name }: { m: Msg; name: string }) {
  const lines = Array.isArray(m.text) ? m.text : [m.text]
  return (
    <div className={`msg ${m.role}`}>
      <div className="who">{m.role === 'figure' ? name.toUpperCase() : 'YOU'}</div>
      <div className="body">
        {lines.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  )
}
