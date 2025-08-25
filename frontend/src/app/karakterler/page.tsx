'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChevronRightIcon,
  UsersIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Character, Category } from '@/types'
import { apiClient } from '@/lib/api'
import { Avatar } from '@/components/ui/Avatar'

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
    personality_traits: ['vizyoner', 'kararlı', 'modernist', 'lider'],
    avatar_url: '/avatars/ataturk.svg',
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
    personality_traits: ['sevgi dolu', 'hoşgörülü', 'bilge', 'şair'],
    avatar_url: '/avatars/mevlana.svg',
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
    personality_traits: ['bilge', 'öğretici', 'erdemli', 'saygılı'],
    avatar_url: '/avatars/confucius.svg',
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
    character_count: 1
  },
  {
    id: 'philosophers',
    name: 'philosophers',
    name_tr: 'Filozoflar',
    name_en: 'Philosophers',
    description_tr: 'Düşünce dünyasını şekillendiren filozoflar',
    description_en: 'Philosophers who shaped the world of thought',
    icon: '🧠',
    character_count: 2
  },
  {
    id: 'scientists',
    name: 'scientists',
    name_tr: 'Bilim İnsanları',
    name_en: 'Scientists',
    description_tr: 'Bilim dünyasına katkı yapmış isimler',
    description_en: 'Names who contributed to the world of science',
    icon: '🔬',
    character_count: 0
  }
]

function CharacterCard({ character }: { character: Character }) {
  const formatYear = (year: number) => {
    if (year < 0) {
      return `M.Ö. ${Math.abs(year)}`
    }
    return year.toString()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 hover:border-blue-200">
      <div className="flex items-start space-x-4">
        <Avatar 
          src={character.avatar_url}
          alt={character.name}
          name={character.name}
          size="lg"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{character.name}</h3>
          <p className="text-sm text-blue-600 mb-2">{character.era}</p>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{character.short_bio_tr}</p>
          
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>
                {formatYear(character.birth_year)} - {character.death_year ? formatYear(character.death_year) : 'Günümüz'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-3 h-3" />
              <span>{character.view_count} görüntüleme</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {character.personality_traits.slice(0, 3).map((trait) => (
              <span key={trait} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <UsersIcon className="w-3 h-3 mr-1" />
          <span>{character.category}</span>
        </div>
        <Link
          href={`/chat/${encodeURIComponent(character.id)}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sohbet Et
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  )
}

function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: { 
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void 
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedCategory === '' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Tümü
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === category.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name_tr} ({category.character_count})
        </button>
      ))}
    </div>
  )
}

export default function KarakterlerPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'era'>('popularity')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use mock data for now
        setCharacters(mockCharacters)
        setCategories(mockCategories)
        
        // Uncomment when backend is ready:
        // const [charactersRes, categoriesRes] = await Promise.all([
        //   apiClient.getCharacters(),
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

  useEffect(() => {
    let filtered = [...characters]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (character.short_bio_tr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (character.era || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.personality_traits.some(trait => 
          trait.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(character => character.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr')
        case 'popularity':
          return (b.view_count || 0) - (a.view_count || 0)
        case 'era':
          return (b.birth_year || 0) - (a.birth_year || 0)
        default:
          return 0
      }
    })

    setFilteredCharacters(filtered)
  }, [characters, searchQuery, selectedCategory, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tarihi Karakterler
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Geçmişin büyük zihinleriyle tanışın ve onlarla sohbet edin. 
              Her karakter kendi döneminin bilgisi ve kişiliğiyle size rehberlik eder.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Karakter ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Kategoriler
              </h3>
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            
            <div className="lg:ml-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Sıralama
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'popularity' | 'era')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popularity">Popülerlik</option>
                <option value="name">İsim (A-Z)</option>
                <option value="era">Dönem (Yeni-Eski)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredCharacters.length} karakter bulundu
            {searchQuery && ` "${searchQuery}" için`}
            {selectedCategory && ` ${categories.find(c => c.id === selectedCategory)?.name_tr} kategorisinde`}
          </p>
        </div>

        {/* Characters Grid */}
        {filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Karakter bulunamadı</h3>
            <p className="text-gray-600 mb-4">
              Arama kriterlerinizi değiştirerek tekrar deneyin.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Filtreleri temizle
            </button>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Favori Karakterinizi Bulamadınız mı?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Sürekli yeni karakterler ekliyoruz. Önerinizi bizimle paylaşın!
          </p>
          <Link
            href="/hakkinda#contact"
            className="inline-flex items-center px-6 py-3 border border-blue-400 text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            İletişime Geç
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}