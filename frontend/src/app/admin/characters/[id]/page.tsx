'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  User, 
  Globe, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'

interface CharacterFormData {
  id: string
  name: string
  title: string
  birth_year: number
  death_year: number | null
  nationality: string
  category: string
  description: string
  personality_traits: string[]
  speaking_style: string
  avatar_url: string
  supported_languages: string[]
  is_published: boolean
}

export default function EditCharacterPage() {
  const router = useRouter()
  const params = useParams()
  const characterId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<CharacterFormData>({
    id: '',
    name: '',
    title: '',
    birth_year: new Date().getFullYear(),
    death_year: null,
    nationality: '',
    category: 'leader',
    description: '',
    personality_traits: [],
    speaking_style: '',
    avatar_url: '',
    supported_languages: ['tr'],
    is_published: false
  })

  const [personalityInput, setPersonalityInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const categories = [
    { value: 'leader', label: 'Lider' },
    { value: 'philosopher', label: 'Filozof' },
    { value: 'scientist', label: 'Bilim İnsanı' },
    { value: 'artist', label: 'Sanatçı' },
    { value: 'writer', label: 'Yazar' },
    { value: 'explorer', label: 'Kaşif' },
    { value: 'inventor', label: 'Mucit' },
    { value: 'other', label: 'Diğer' }
  ]

  useEffect(() => {
    fetchCharacter()
  }, [characterId])

  const fetchCharacter = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/characters/${characterId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch character: ${response.status}`)
      }

      const character = await response.json()
      
      setFormData({
        id: character.id,
        name: character.name || '',
        title: character.title || '',
        birth_year: character.birth_year || new Date().getFullYear(),
        death_year: character.death_year,
        nationality: character.nationality || '',
        category: character.category || 'leader',
        description: character.description || '',
        personality_traits: character.personality_traits || [],
        speaking_style: character.speaking_style || '',
        avatar_url: character.avatar_url || '',
        supported_languages: character.supported_languages || ['tr'],
        is_published: character.is_published || false
      })
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CharacterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const addPersonalityTrait = () => {
    if (personalityInput.trim() && !formData.personality_traits.includes(personalityInput.trim())) {
      handleInputChange('personality_traits', [...formData.personality_traits, personalityInput.trim()])
      setPersonalityInput('')
    }
  }

  const removePersonalityTrait = (trait: string) => {
    handleInputChange('personality_traits', formData.personality_traits.filter(t => t !== trait))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'İsim gerekli'
    if (!formData.title.trim()) return 'Başlık gerekli'
    if (!formData.description.trim()) return 'Açıklama gerekli'
    if (!formData.speaking_style.trim()) return 'Konuşma stili gerekli'
    if (formData.personality_traits.length === 0) return 'En az bir kişilik özelliği gerekli'
    if (formData.birth_year < 1 || formData.birth_year > new Date().getFullYear()) return 'Geçerli doğum yılı gerekli'
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/characters/${characterId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/characters')
      }, 2000)
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Karakter yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-lg shadow text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Karakter Başarıyla Güncellendi!</h2>
        <p className="text-gray-600 mb-6">
          <strong>{formData.name}</strong> karakteri güncellendi.
        </p>
        <div className="space-y-3">
          <Link
            href="/admin/characters"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Karakter Listesine Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/characters"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Karakteri Düzenle</h1>
            <p className="text-gray-600">{formData.name} karakterini düzenleyin</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreview ? 'Önizlemeyi Gizle' : 'Önizleme'}</span>
          </button>
          <Link
            href={`/admin/characters/${characterId}/sources`}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-4 h-4" />
            <span>Kaynakları Yönet</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Form */}
        <div className="bg-white rounded-lg border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Temel Bilgiler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Karakter ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID değiştirilemez</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İsim *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Mustafa Kemal Atatürk"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Türkiye Cumhuriyeti Kurucusu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Life Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Yaşam Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Yılı *
                  </label>
                  <input
                    type="number"
                    value={formData.birth_year}
                    onChange={(e) => handleInputChange('birth_year', parseInt(e.target.value) || 0)}
                    min="1"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ölüm Yılı
                  </label>
                  <input
                    type="number"
                    value={formData.death_year || ''}
                    onChange={(e) => handleInputChange('death_year', e.target.value ? parseInt(e.target.value) : null)}
                    min={formData.birth_year}
                    max={new Date().getFullYear()}
                    placeholder="Yaşıyorsa boş bırakın"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Milliyet
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="Türk"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Category & Language */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Kategori & Dil
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desteklenen Diller
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.supported_languages.includes('tr')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('supported_languages', [...formData.supported_languages, 'tr'])
                          } else {
                            handleInputChange('supported_languages', formData.supported_languages.filter(l => l !== 'tr'))
                          }
                        }}
                        className="mr-2"
                      />
                      Türkçe
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.supported_languages.includes('en')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('supported_languages', [...formData.supported_languages, 'en'])
                          } else {
                            handleInputChange('supported_languages', formData.supported_languages.filter(l => l !== 'en'))
                          }
                        }}
                        className="mr-2"
                      />
                      English
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Açıklama & Kişilik
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Bu karakterin hayatı, başarıları ve önemli katkıları hakkında kısa bir açıklama yazın..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kişilik Özellikleri *
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={personalityInput}
                    onChange={(e) => setPersonalityInput(e.target.value)}
                    placeholder="Özellik ekle (ör: Cesur, Vizyoner)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPersonalityTrait())}
                  />
                  <button
                    type="button"
                    onClick={addPersonalityTrait}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ekle
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.personality_traits.map((trait, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {trait}
                      <button
                        type="button"
                        onClick={() => removePersonalityTrait(trait)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konuşma Stili *
                </label>
                <textarea
                  value={formData.speaking_style}
                  onChange={(e) => handleInputChange('speaking_style', e.target.value)}
                  placeholder="Bu karakterin nasıl konuştuğunu açıklayın (ör: Resmi ama sıcak, öğretici ve ilham verici)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Medya
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Publishing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Karakteri Yayınla</div>
                  <div className="text-sm text-gray-600">Kullanıcıların erişebilmesi için karakteri yayınla</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => handleInputChange('is_published', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/characters"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {formData.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{formData.name || 'Karakter Adı'}</h4>
                  <p className="text-sm text-gray-600">{formData.title || 'Karakter Başlığı'}</p>
                  <p className="text-xs text-gray-500">
                    {formData.birth_year} - {formData.death_year || '...'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  {formData.description || 'Karakter açıklaması buraya gelecek...'}
                </p>
                
                {formData.personality_traits.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Kişilik Özellikleri:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.personality_traits.map((trait, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.speaking_style && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Konuşma Stili:</p>
                    <p className="text-xs text-gray-600">{formData.speaking_style}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Kategori: {categories.find(c => c.value === formData.category)?.label}</span>
                <span>{formData.is_published ? '✅ Yayınlandı' : '⏳ Taslak'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
