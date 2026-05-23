'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export function CandleAudio() {
  const [on, setOn] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const start = useCallback(() => {
    if (ctxRef.current) return
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const bufferSize = 2 * ctx.sampleRate
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        lastOut = (lastOut + 0.02 * white) / 1.02
        data[i] = lastOut * 3.5
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true
      const lpf = ctx.createBiquadFilter()
      lpf.type = 'lowpass'
      lpf.frequency.value = 600
      lpf.Q.value = 0.7
      const gain = ctx.createGain()
      gain.gain.value = 0
      noise.connect(lpf).connect(gain).connect(ctx.destination)
      noise.start()
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.8)

      const crackle = () => {
        if (!ctxRef.current) return
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        const env = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(900 + Math.random() * 1800, t)
        env.gain.setValueAtTime(0.0001, t)
        env.gain.exponentialRampToValueAtTime(0.06 + Math.random() * 0.04, t + 0.01)
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
        osc.connect(env).connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 0.08)
        setTimeout(crackle, 600 + Math.random() * 3500)
      }
      setTimeout(crackle, 800)

      ctxRef.current = ctx
      gainRef.current = gain
    } catch (err) {
      console.warn('Audio init failed', err)
    }
  }, [])

  const stop = useCallback(() => {
    if (!ctxRef.current || !gainRef.current) return
    const ctx = ctxRef.current
    gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
    setTimeout(() => {
      try { ctx.close() } catch (_) {}
      ctxRef.current = null
      gainRef.current = null
    }, 500)
  }, [])

  const toggle = () => {
    if (on) { stop(); setOn(false) }
    else { start(); setOn(true) }
  }

  useEffect(() => () => stop(), [stop])

  return (
    <button
      className={'candle-toggle' + (on ? ' on' : '')}
      onClick={toggle}
      title="Candle ambience"
    >
      <span className="glyph" />
      <span>{on ? 'Candle · On' : 'Candle · Off'}</span>
    </button>
  )
}
