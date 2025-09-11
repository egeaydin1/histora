'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Star, 
  MessageCircle, 
  Users, 
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  BookOpen,
  TrendingUp,
  Crown,
  Heart,
  Lightbulb
} from 'lucide-react'

interface Character {
  id: string
  name: string
  title: string
  birth_year: number
  death_year: number | null
  nationality: string
  category: string
  description: string
  avatar_url?: string
  personality_traits: string[]
  speaking_style: string
  chat_count: number
  rating: number
  is_featured: boolean
  created_at: string
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('popular')

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      
      // Get API base URL dynamically
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.hostname}:8000/api/${apiVersion}`
        : `http://localhost:8000/api/${apiVersion}`
      
      console.log('Fetching characters from:', `${baseUrl}/characters`)
      
      const response = await fetch(`${baseUrl}/characters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('Characters loaded:', data.map((c: any) => ({ id: c.id, name: c.name })))
      
      // Transform API data to match frontend interface
      const charactersWithStats: Character[] = data.map((char: any) => ({
        ...char,
        chat_count: Math.floor(Math.random() * 5000) + 1000, // Mock for now
        rating: 4.5 + Math.random() * 0.5, // Mock for now  
        is_featured: Math.random() > 0.7 // Mock for now
      }))
      
      setCharacters(charactersWithStats)
    } catch (error) {
      console.error('Failed to fetch characters:', error)
      // Fallback to empty array on error
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', label: 'Tümü', icon: Users },
    { id: 'leader', label: 'Liderler', icon: Crown },
    { id: 'philosopher', label: 'Filozoflar', icon: Lightbulb },
    { id: 'scientist', label: 'Bilim İnsanları', icon: BookOpen },
    { id: 'artist', label: 'Sanatçılar', icon: Heart }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-600" />
      case 'philosopher': return <Lightbulb className="w-4 h-4 text-purple-600" />
      case 'scientist': return <BookOpen className="w-4 h-4 text-blue-600" />
      case 'artist': return <Heart className="w-4 h-4 text-pink-600" />
      default: return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'leader': return 'Lider'
      case 'philosopher': return 'Filozof'
      case 'scientist': return 'Bilim İnsanı'
      case 'artist': return 'Sanatçı'
      default: return 'Karakter'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getLifespan = (birthYear: number, deathYear: number | null) => {
    if (deathYear) {
      return `${birthYear} - ${deathYear}`
    }
    return `${birthYear} - ...`
  }

  const filteredCharacters = characters
    .filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           character.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           character.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || character.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.chat_count - a.chat_count
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'name':
          return a.name.localeCompare(b.name, 'tr')
        default:
          return 0
      }
    })

  const featuredCharacters = characters.filter(char => char.is_featured)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tarihi Karakterler</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tarihte iz bırakmış büyük şahsiyetlerle sohbet edin. Onların bilgeliklerinden yararlanın, 
              deneyimlerini öğrenin ve geçmişten günümüze köprü kurun.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Characters */}
      {featuredCharacters.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Öne Çıkan Karakterler
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredCharacters.map((character) => (
              <Link
                key={character.id}
                href={`/chat/${encodeURIComponent(character.id)}`}
                className="group bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {character.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {character.name}
                        </h3>
                        <p className="text-sm text-gray-600">{character.title}</p>
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {character.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{formatNumber(character.chat_count)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{character.rating}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Karakter ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popular">En Popüler</option>
                <option value="rating">En Yüksek Puan</option>
                <option value="newest">En Yeni</option>
                <option value="name">İsim (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Characters Grid */}
        {filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {filteredCharacters.map((character) => (
              <Link
                key={character.id}
                href={`/chat/${encodeURIComponent(character.id)}`}
                className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {character.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {character.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{character.title}</p>
                      </div>
                    </div>
                    {getCategoryIcon(character.category)}
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{getLifespan(character.birth_year, character.death_year)}</span>
                      <MapPin className="w-3 h-3 ml-2" />
                      <span>{character.nationality}</span>
                    </div>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {getCategoryLabel(character.category)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {character.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{formatNumber(character.chat_count)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{character.rating}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Karakter bulunamadı</h3>
            <p className="text-gray-600">
              Arama kriterlerinizle eşleşen karakter bulunmuyor. Farklı anahtar kelimeler deneyin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
