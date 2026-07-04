'use client'

// Lightweight TR/EN i18n — no framework, one context + flat dictionaries.
// Language persists in localStorage and defaults to the browser language.

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'tr' | 'en'

const STORAGE_KEY = 'histora_lang'

const DICT = {
  en: {
    // Intro
    'intro.eyebrow': 'An evening with the past',
    'intro.title.1': 'Speak with the minds',
    'intro.title.2': 'that <em>shaped history.</em>',
    'intro.sub': 'Forty figures. Twenty-four centuries. One candle between you.',
    'intro.cta': 'Enter the gallery',
    'intro.foot.leaders': 'Leaders',
    'intro.foot.philosophers': 'Philosophers',
    'intro.foot.scientists': 'Scientists',
    'intro.foot.artists': 'Artists',
    // Gallery
    'gal.nav.gallery': 'Gallery',
    'gal.nav.editorial': 'Editorial view',
    'gal.nav.sparse': 'Sparse view',
    'gal.eyebrow': 'The Gallery · Vol. I',
    'gal.title.1': 'Speak with the minds that',
    'gal.title.2': 'shaped history.',
    'gal.sub': 'Figures from the agora of Athens to a Mexico City studio. Choose one and sit a while.',
    'gal.filter.all': 'All',
    'gal.filter.philosophy': 'Philosophers',
    'gal.filter.science': 'Scientists',
    'gal.filter.art': 'Artists',
    'gal.filter.state': 'Leaders',
    'gal.figures': 'figures',
    'gal.view.sparse': 'Sparse',
    'gal.view.editorial': 'Editorial',
    'gal.view': 'view',
    'gal.empty': 'No figures found',
    // Chat
    'chat.back': 'The Gallery',
    'chat.lifespan': 'Lifespan',
    'chat.domain': 'Domain',
    'chat.attributed': 'Attributed to',
    'chat.conversation': 'Conversation',
    'chat.begun': 'Begun this evening',
    'chat.close': 'Close',
    'chat.ask': 'Ask {name} about',
    'chat.write': 'Write to {name}…',
    'chat.send': 'Send',
    'chat.hint': 'Return to send · Shift + Return for a new line',
    'chat.demo.left.1': 'Demo conversation ·',
    'chat.demo.left.2': 'of',
    'chat.demo.left.3': 'messages left',
    'chat.demo.over': 'Demo limit reached — sign in to keep talking with {name}.',
    'chat.signin': 'Sign in',
    'chat.register': 'Create account',
    'chat.error': 'A worthy question. Let me sit with it a moment. (I appear to have lost my train of thought — please try again.)',
    'chat.demo.limit.msg': 'Our demo conversation has reached its end — {n} messages, and you have used them well. Sign in, and we may speak without limits.',
    'chat.demo.day.msg': 'The demo hours of the gallery are over for today. Sign in, and we may continue.',
    'chat.notfound': 'Character not found',
    'chat.return': '← Return to gallery',
    // Auth
    'auth.login.title': 'Sign in',
    'auth.login.sub': 'The gallery remembers its guests.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login.cta': 'Enter',
    'auth.login.alt': 'No account yet?',
    'auth.login.alt.link': 'Create one',
    'auth.register.title': 'Create account',
    'auth.register.sub': 'Give the gallery your name, and it will hold the door.',
    'auth.name': 'Full name',
    'auth.register.cta': 'Join',
    'auth.register.alt': 'Already a guest?',
    'auth.register.alt.link': 'Sign in',
  },
  tr: {
    // Intro
    'intro.eyebrow': 'Geçmişle bir akşam',
    'intro.title.1': 'Tarihi şekillendiren',
    'intro.title.2': 'zihinlerle <em>konuşun.</em>',
    'intro.sub': 'Kırk figür. Yirmi dört yüzyıl. Aranızda bir mum.',
    'intro.cta': 'Galeriye girin',
    'intro.foot.leaders': 'Liderler',
    'intro.foot.philosophers': 'Filozoflar',
    'intro.foot.scientists': 'Bilim İnsanları',
    'intro.foot.artists': 'Sanatçılar',
    // Gallery
    'gal.nav.gallery': 'Galeri',
    'gal.nav.editorial': 'Dergi görünümü',
    'gal.nav.sparse': 'Seyrek görünüm',
    'gal.eyebrow': 'Galeri · Cilt I',
    'gal.title.1': 'Tarihi şekillendiren zihinlerle',
    'gal.title.2': 'konuşun.',
    'gal.sub': 'Atina agorasından Mexico City’deki bir atölyeye. Birini seçin ve biraz oturun.',
    'gal.filter.all': 'Tümü',
    'gal.filter.philosophy': 'Filozoflar',
    'gal.filter.science': 'Bilim İnsanları',
    'gal.filter.art': 'Sanatçılar',
    'gal.filter.state': 'Liderler',
    'gal.figures': 'figür',
    'gal.view.sparse': 'Seyrek',
    'gal.view.editorial': 'Dergi',
    'gal.view': 'görünüm',
    'gal.empty': 'Figür bulunamadı',
    // Chat
    'chat.back': 'Galeri',
    'chat.lifespan': 'Yaşamı',
    'chat.domain': 'Alanı',
    'chat.attributed': 'Atfedilir:',
    'chat.conversation': 'Sohbet',
    'chat.begun': 'Bu akşam başladı',
    'chat.close': 'Kapat',
    'chat.ask': '{name}’e sorun',
    'chat.write': '{name}’e yazın…',
    'chat.send': 'Gönder',
    'chat.hint': 'Enter ile gönder · Yeni satır için Shift + Enter',
    'chat.demo.left.1': 'Demo sohbet ·',
    'chat.demo.left.2': '/',
    'chat.demo.left.3': 'mesaj kaldı',
    'chat.demo.over': 'Demo hakkınız doldu — {name} ile konuşmaya devam etmek için giriş yapın.',
    'chat.signin': 'Giriş yap',
    'chat.register': 'Hesap oluştur',
    'chat.error': 'Değerli bir soru. Bir an düşünmeme izin ver. (Zihnim bir anlığına dağıldı — lütfen tekrar dene.)',
    'chat.demo.limit.msg': 'Demo sohbetimiz sona erdi — {n} mesajı güzel kullandın. Giriş yap, sınırsızca konuşalım.',
    'chat.demo.day.msg': 'Galerinin demo saatleri bugünlük sona erdi. Giriş yap, devam edelim.',
    'chat.notfound': 'Karakter bulunamadı',
    'chat.return': '← Galeriye dön',
    // Auth
    'auth.login.title': 'Giriş yap',
    'auth.login.sub': 'Galeri, konuklarını hatırlar.',
    'auth.email': 'E-posta',
    'auth.password': 'Şifre',
    'auth.login.cta': 'Gir',
    'auth.login.alt': 'Hesabın yok mu?',
    'auth.login.alt.link': 'Oluştur',
    'auth.register.title': 'Hesap oluştur',
    'auth.register.sub': 'Galeriye adını bırak, kapı sana açık kalsın.',
    'auth.name': 'Ad Soyad',
    'auth.register.cta': 'Katıl',
    'auth.register.alt': 'Zaten konuk musun?',
    'auth.register.alt.link': 'Giriş yap',
  },
} as const

type DictKey = keyof typeof DICT.en

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: DictKey, vars?: Record<string, string | number>) => string
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === 'tr' || stored === 'en') {
      setLangState(stored)
    } else if (typeof navigator !== 'undefined' && !navigator.language.toLowerCase().startsWith('tr')) {
      setLangState('en')
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
    document.documentElement.lang = l
  }

  const t = (key: DictKey, vars?: Record<string, string | number>) => {
    let s: string = DICT[lang][key] ?? DICT.en[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    }
    return s
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang(): LangContextType {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

/** Small TR · EN toggle, styled to sit in page headers. */
export function LangToggle({ onSwitch }: { onSwitch?: () => void }) {
  const { lang, setLang } = useLang()
  return (
    <span className="lang-toggle">
      {(['tr', 'en'] as Lang[]).map((l, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="sep">·</span>}
          <button
            className={lang === l ? 'on' : ''}
            onClick={() => { setLang(l); onSwitch?.() }}
          >
            {l.toUpperCase()}
          </button>
        </React.Fragment>
      ))}
    </span>
  )
}
