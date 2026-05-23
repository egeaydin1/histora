'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register(email, password, name)
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
        <div className="eyebrow onb-eyebrow">Join the conversation</div>
        <h1 className="onb-title" style={{ fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: 40 }}>
          Create your <em>account</em>
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left' }}>
          {[
            { label: 'Your name', value: name, set: setName, type: 'text' },
            { label: 'Email', value: email, set: setEmail, type: 'email' },
            { label: 'Password', value: password, set: setPassword, type: 'password' },
          ].map(({ label, value, set, type }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--ivory-faint)', marginBottom: 8 }}>
                {label}
              </label>
              <input
                type={type} value={value} onChange={e => set(e.target.value)} required
                style={{ width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid rgba(237,232,220,0.2)', color: 'var(--ivory)', fontSize: 16, padding: '10px 0', outline: 'none', fontFamily: 'var(--sans)' }}
              />
            </div>
          ))}

          {error && <p style={{ color: 'var(--amber)', fontSize: 13 }}>{error}</p>}

          <button type="submit" className="onb-cta" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            <span>{loading ? 'Creating account…' : 'Create account'}</span>
            <span className="arrow">→</span>
          </button>
        </form>

        <p style={{ marginTop: 32, color: 'var(--ivory-faint)', fontSize: 12 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>

      <div className="onb-foot">
        <Link href="/characters" style={{ color: 'var(--ivory-faint)', textDecoration: 'none' }}>← Back to gallery</Link>
      </div>
    </main>
  )
}
