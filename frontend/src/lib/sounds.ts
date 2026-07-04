// Minimal synthesized SFX — Web Audio, no asset files.
// All sounds are quiet, short and warm to match the museum-at-midnight mood.

type ToneOpts = {
  type?: OscillatorType
  gain?: number
  attack?: number
  decay?: number
  when?: number
  slideTo?: number
}

class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private thinkTimer: ReturnType<typeof setInterval> | null = null
  private lastHover = 0

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.14
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
    return this.ctx
  }

  /** Call from any real user gesture (pointerdown/click) to unlock audio. */
  unlock() {
    this.ensure()
  }

  private tone(freq: number, dur: number, opts: ToneOpts = {}) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const { type = 'sine', gain = 1, attack = 0.005, decay = dur, when = 0, slideTo } = opts
    const t0 = ctx.currentTime + when
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay)
    osc.connect(g)
    g.connect(this.master)
    osc.start(t0)
    osc.stop(t0 + attack + decay + 0.05)
  }

  /** Soft high tick — card / button hover. Throttled so grids don't chatter. */
  hover() {
    const now = Date.now()
    if (now - this.lastHover < 90) return
    this.lastHover = now
    this.tone(1900, 0.045, { type: 'sine', gain: 0.12 })
  }

  /** Gentle click — navigation, filters. */
  click() {
    this.tone(1250, 0.05, { type: 'triangle', gain: 0.22 })
    this.tone(340, 0.09, { type: 'sine', gain: 0.18, when: 0.005 })
  }

  /** Message sent — a small upward pluck. */
  send() {
    this.tone(440, 0.14, { type: 'triangle', gain: 0.22, slideTo: 720 })
  }

  /** Reply arrived — warm two-note chime. */
  receive() {
    this.tone(523.25, 0.28, { type: 'sine', gain: 0.2 })
    this.tone(783.99, 0.34, { type: 'sine', gain: 0.13, when: 0.09 })
  }

  /** Figure is thinking — a faint pulse every ~1.6s until stopped. */
  thinkStart() {
    this.thinkStop()
    this.thinkTimer = setInterval(() => {
      this.tone(660, 0.09, { type: 'sine', gain: 0.06 })
    }, 1600)
  }

  thinkStop() {
    if (this.thinkTimer) {
      clearInterval(this.thinkTimer)
      this.thinkTimer = null
    }
  }

  /** Intro swell — candle-lighting moment. Call from a user gesture. */
  intro() {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t0 = ctx.currentTime
    ;[110, 220, 330].forEach((f, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      g.gain.setValueAtTime(0, t0)
      g.gain.linearRampToValueAtTime(0.09 / (i + 1), t0 + 1.1)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6)
      osc.connect(g)
      g.connect(this.master!)
      osc.start(t0)
      osc.stop(t0 + 2.8)
    })
    this.tone(1567.98, 0.5, { type: 'sine', gain: 0.05, when: 0.9 })
  }
}

export const sfx = new Sfx()
