'use client'

import { useState, useEffect } from 'react'
import { ChevronRightIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Character, Category } from '@/types'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// Mock data for development
const mockCharacters: Character[] = [
  {
    id: 'ataturk-001',
    name: 'Mustafa Kemal Atatürk',
    name_tr: 'Mustafa Kemal Atatürk',
    name_en: 'Mustafa Kemal Atatürk',
    category: 'leaders',
    era: 'Modern Turkey',
    birth_year: 1881,
    death_year: 1938,
    birth_place: 'Selanik',
    short_bio_tr: 'Türkiye Cumhuriyeti\'nin kurucusu ve ilk Cumhurbaşkanı',
    short_bio_en: 'Founder and first President of the Republic of Turkey',
    personality_traits: ['visionary', 'determined', 'modern', 'strategic'],
    avatar_url: '/avatars/ataturk.jpg',
    status: 'published',
    is_featured: true,
    view_count: 1250
  },
  {
    id: 'mevlana-001',
    name: 'Mevlana Celaleddin Rumi',
    name_tr: 'Mevlana Celaleddin Rumi',
    name_en: 'Jalal ad-Din Muhammad Rumi',
    category: 'philosophers',
    era: '13th Century',
    birth_year: 1207,
    death_year: 1273,
    birth_place: 'Belh',
    short_bio_tr: 'Büyük mutasavvıf, şair ve filozof',
    short_bio_en: 'Great Sufi mystic, poet and philosopher',
    personality_traits: ['wise', 'spiritual', 'poetic', 'tolerant'],
    avatar_url: '/avatars/mevlana.jpg',
    status: 'published',
    is_featured: true,
    view_count: 980
  },
  {
    id: 'konfucyus-001',
    name: 'Konfüçyüs',
    name_tr: 'Konfüçyüs',
    name_en: 'Confucius',
    category: 'philosophers',
    era: 'Spring and Autumn period',
    birth_year: -551,
    death_year: -479,
    birth_place: 'Lu State, China',
    short_bio_tr: 'Çin filozofu ve öğretmen',
    short_bio_en: 'Chinese philosopher and teacher',
    personality_traits: ['wise', 'ethical', 'educational', 'traditional'],
    avatar_url: '/avatars/confucius.jpg',
    status: 'published',
    is_featured: true,
    view_count: 750
  }
]

const mockCategories: Category[] = [
  {
    id: 'leaders',
    name: 'leaders',
    name_tr: 'Liderler',
    name_en: 'Leaders',
    description_tr: 'Tarihte iz bırakmış liderler',
    description_en: 'Historical leaders who left their mark',
    icon: '👑',
    character_count: 2
  },
  {
    id: 'philosophers',
    name: 'philosophers',
    name_tr: 'Filozoflar',
    name_en: 'Philosophers',
    description_tr: 'Düşünce dünyasını şekillendiren filozoflar',
    description_en: 'Philosophers who shaped the world of thought',
    icon: '🧠',
    character_count: 3
  },
  {
    id: 'scientists',
    name: 'scientists',
    name_tr: 'Bilim İnsanları',
    name_en: 'Scientists',
    description_tr: 'Bilim dünyasına katkı yapmış isimler',
    description_en: 'Names who contributed to the world of science',
    icon: '🔬',
    character_count: 2
  }
]

function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {character.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
          <p className="text-sm text-gray-600">{character.era}</p>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{character.short_bio_tr}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {character.personality_traits.slice(0, 2).map((trait) => (
            <span key={trait} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
              {trait}
            </span>
          ))}
        </div>
        <Link
          href={`/chat/${character.id}`}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Sohbet Et
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
      <div className="text-center">
        <div className="text-3xl mb-3">{category.icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name_tr}</h3>
        <p className="text-sm text-gray-600 mb-3">{category.description_tr}</p>
        <div className="text-xs text-gray-500">{category.character_count} karakter</div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use mock data for now
        setCharacters(mockCharacters)
        setCategories(mockCategories)
        
        // Uncomment when backend is ready:
        // const [charactersRes, categoriesRes] = await Promise.all([
        //   apiClient.getCharacters({ featured_only: true, limit: 6 }),
        //   apiClient.getCategories()
        // ])
        // 
        // if (charactersRes.data) setCharacters(charactersRes.data)
        // if (categoriesRes.data) setCategories(categoriesRes.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Histora</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/characters" className="text-gray-600 hover:text-gray-900">
                Karakterler
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                Hakkında
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Merhaba, {user.display_name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Giriş Yap
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Tarihte Iz Bırakmış
            <span className="text-blue-600 block">Zihinlerle Konuş</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Atatürk, Mevlana, Konfüçyüs ve daha fazlası ile gerçekçi sohbetler yapın. 
            Yapay zeka ile geçmişin büyük düşünürlerinden öğrenin.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/characters"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Sohbete Başla
            </Link>
            <Link
              href="/about"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Nasıl Çalışır?
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategoriler</h2>
            <p className="text-lg text-gray-600">Hangi alanda bilgi almak istiyorsunuz?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Characters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Öne Çıkan Karakterler</h2>
            <p className="text-lg text-gray-600">En popüler tarihi figürlerle tanışın</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/characters"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Tüm karakterleri gör
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <SparklesIcon className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold">Histora</h3>
            </div>
            <p className="text-gray-400 mb-6">
              "İnsanlığın en büyük zihinsel mirasını canlı hale getiriyoruz."
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white">Gizlilik</Link>
              <Link href="/terms" className="hover:text-white">Kullanım Şartları</Link>
              <Link href="/contact" className="hover:text-white">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}