'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    router.push('/characters')
  }

  return (
    <main className="onb">
      <div className="onb-mark">
        <span className="flame" style={{ width: 8, height: 14, filter: 'blur(0.4px)', boxShadow: '0 0 14px var(--amber)' }} />
        <Link href="/" style={{ textDecoration: 'none' }}><span className="wordmark">Histora</span></Link>
      </div>

      <div className="onb-center" style={{ maxWidth: 480 }}>
        <div className="eyebrow onb-eyebrow">Welcome back</div>
        <h1 className="onb-title" style={{ fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: 40 }}>
          Sign in to <em>continue</em>
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--ivory-faint)', marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid rgba(237,232,220,0.2)', color: 'var(--ivory)', fontSize: 16, padding: '10px 0', outline: 'none', fontFamily: 'var(--sans)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--ivory-faint)', marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid rgba(237,232,220,0.2)', color: 'var(--ivory)', fontSize: 16, padding: '10px 0', outline: 'none', fontFamily: 'var(--sans)' }}
            />
          </div>

          {error && <p style={{ color: 'var(--amber)', fontSize: 13 }}>{error}</p>}

          <button type="submit" className="onb-cta" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            <span className="arrow">→</span>
          </button>
        </form>

        <p style={{ marginTop: 32, color: 'var(--ivory-faint)', fontSize: 12 }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>

      <div className="onb-foot">
        <Link href="/characters" style={{ color: 'var(--ivory-faint)', textDecoration: 'none' }}>← Back to gallery</Link>
      </div>
    </main>
  )
}
