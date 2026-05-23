'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, ApiCharacter } from '@/lib/api'
import { getEnrichment } from '@/lib/characters'
import { padCatalogNumber, generateId } from '@/lib/utils'
import { CandleAudio } from '@/components/histora/CandleAudio'
import { useAuth } from '@/contexts/AuthContext'

interface Msg {
  id: string
  role: 'figure' | 'user'
  text: string | string[]
}

export default function ChatPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [character, setCharacter] = useState<ApiCharacter | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')

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
      const enrichment = getEnrichment(data.id, data)
      setMessages([{ id: generateId(), role: 'figure', text: enrichment.opener }])
    })
  }, [characterId])

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

    setMessages(m => [...m, { id: generateId(), role: 'user', text: clean }])
    setDraft('')
    setTyping(true)

    if (!user) {
      // Not logged in — show friendly auth prompt after a brief delay
      setTimeout(() => {
        setMessages(m => [...m, {
          id: generateId(),
          role: 'figure',
          text: 'I would gladly continue our conversation — but first, you must introduce yourself. Please sign in to speak with me.',
        }])
        setTyping(false)
      }, 1200)
      return
    }

    const { data, error } = await api.sendMessage({
      character_id: character.id,
      message: clean,
      session_id: sessionId || undefined,
      language: 'en',
      mode: 'chat',
    })

    if (error || !data) {
      setMessages(m => [...m, {
        id: generateId(),
        role: 'figure',
        text: 'A worthy question. Let me sit with it a moment. (I appear to have lost my train of thought — please try again.)',
      }])
    } else {
      if (!sessionId) setSessionId(data.session_id)
      setMessages(m => [...m, { id: generateId(), role: 'figure', text: data.response }])
    }
    setTyping(false)
  }, [character, sessionId, user])

  const enrichment = character ? getEnrichment(character.id, character) : null
  const catNo = character ? padCatalogNumber(1) : '001'

  if (loadError) {
    return (
      <div className="state-center">
        <div className="eyebrow">Character not found</div>
        <p>{loadError}</p>
        <Link href="/characters">← Return to gallery</Link>
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
                <span>The Gallery</span>
              </Link>
              <span className="catno">№&nbsp;{catNo}</span>
            </div>

            <div className="aside-era">{enrichment?.era}</div>
            <h2 className="aside-name">{character.name}</h2>

            <hr className="aside-rule" />

            <div className="aside-meta">
              <div className="col">
                <div className="lbl">Lifespan</div>
                <div className="val">{enrichment?.lifespan}</div>
              </div>
              <div className="col">
                <div className="lbl">Domain</div>
                <div className="val">{enrichment?.domain}</div>
              </div>
            </div>

            <div className="aside-quote">
              "{enrichment?.quote}"
              <span className="attr">— Attributed to {character.name.split(' ').slice(-1)[0]}</span>
            </div>
          </div>
        </aside>

        {/* Right side — conversation */}
        <section className="chat-main">
          <header className="chat-header">
            <div className="crumb">
              <b>Conversation</b>
              <span style={{ margin: '0 14px', opacity: 0.5 }}>·</span>
              <span>Begun this evening</span>
            </div>
            <div className="actions">
              <button onClick={() => router.push('/characters')}>Close</button>
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
              <div className="label">Ask {character.name.split(' ')[0]} about</div>
              <div className="chips">
                {enrichment.prompts.map((p, i) => (
                  <button key={i} className="chip quill" onClick={() => send(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auth banner for unauthenticated users */}
          {!user && (
            <div className="auth-banner">
              <span>Sign in to have a real conversation with {character.name.split(' ')[0]}.</span>
              <span>
                <Link href="/login">Sign in</Link>
                {' '}&nbsp;·&nbsp;{' '}
                <Link href="/register">Create account</Link>
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
                placeholder={`Write to ${character.name.split(' ').slice(-1)[0]}…`}
                rows={1}
                disabled={typing}
              />
              <button
                className={'send' + (draft.trim() ? ' ready' : '')}
                onClick={() => send(draft)}
                disabled={typing}
              >
                <span>Send</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: 0 }}>→</span>
              </button>
              <div className="hint">Return to send · Shift + Return for a new line</div>
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
