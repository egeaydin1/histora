'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  File,
  BookOpen,
  Globe
} from 'lucide-react'

interface Source {
  id: string
  character_id: string
  title: string
  content?: string
  source_type: string
  file_path?: string
  file_size?: number
  is_processed: boolean
  processing_status: string
  error_message?: string
  chunk_count: number
  created_at: string
  updated_at: string
}

interface Character {
  id: string
  name: string
  title: string
}

export default function CharacterSourcesPage() {
  const params = useParams()
  const characterId = params.id as string
  
  const [character, setCharacter] = useState<Character | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  
  // Upload form state
  const [uploadData, setUploadData] = useState({
    title: '',
    content: '',
    source_type: 'text'
  })

  useEffect(() => {
    fetchData()
  }, [characterId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      // Fetch character info
      const characterResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/characters/${characterId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (characterResponse.ok) {
        const characterData = await characterResponse.json()
        setCharacter({
          id: characterData.id,
          name: characterData.name,
          title: characterData.title
        })
      }

      // Mock sources data for now
      const mockSources: Source[] = [
        {
          id: '1',
          character_id: characterId,
          title: 'Atatürk Biyografisi',
          source_type: 'book',
          file_path: '/uploads/ataturk-biography.pdf',
          file_size: 2048000,
          is_processed: true,
          processing_status: 'completed',
          chunk_count: 45,
          created_at: '2025-01-25T10:00:00Z',
          updated_at: '2025-01-25T10:15:00Z'
        },
        {
          id: '2',
          character_id: characterId,
          title: 'Nutuk Metni',
          source_type: 'text',
          content: 'Nutuk\'tan alıntılar...',
          is_processed: false,
          processing_status: 'processing',
          chunk_count: 0,
          created_at: '2025-01-25T11:00:00Z',
          updated_at: '2025-01-25T11:00:00Z'
        }
      ]

      setSources(mockSources)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadData.title.trim()) {
      setError('Başlık gerekli')
      return
    }

    if (!uploadData.content.trim()) {
      setError('İçerik gerekli')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/characters/${characterId}/sources`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(uploadData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Upload failed')
      }

      // Reset form and refresh sources
      setUploadData({ title: '', content: '', source_type: 'text' })
      setShowUploadForm(false)
      await fetchData()
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (sourceId: string, sourceTitle: string) => {
    if (!confirm(`"${sourceTitle}" kaynağını silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/sources/${sourceId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        setSources(sources => sources.filter(s => s.id !== sourceId))
      } else {
        throw new Error('Silme işlemi başarısız')
      }
    } catch (error: any) {
      setError(error.message)
    }
  }

  const getStatusIcon = (status: string, isProcessed: boolean) => {
    if (isProcessed) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'processing') return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  const getStatusText = (status: string, isProcessed: boolean) => {
    if (isProcessed) return 'Tamamlandı'
    if (status === 'processing') return 'İşleniyor'
    if (status === 'failed') return 'Başarısız'
    return 'Bekliyor'
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'book': return <BookOpen className="w-5 h-5 text-blue-500" />
      case 'pdf': return <File className="w-5 h-5 text-red-500" />
      case 'text': return <FileText className="w-5 h-5 text-green-500" />
      case 'web': return <Globe className="w-5 h-5 text-purple-500" />
      default: return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Kaynak Yönetimi</h1>
            <p className="text-gray-600">
              {character ? `${character.name} için kaynakları yönetin` : 'Karakter kaynakları'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kaynak</span>
          </button>
          <Link
            href={`/admin/characters/${characterId}`}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Karakteri Düzenle</span>
          </Link>
        </div>
      </div>

      {/* Character Info */}
      {character && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {character.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{character.name}</h3>
              <p className="text-sm text-gray-600">{character.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Kaynak Ekle</h3>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Kaynak başlığı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kaynak Türü
                </label>
                <select
                  value={uploadData.source_type}
                  onChange={(e) => setUploadData(prev => ({ ...prev, source_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Metin</option>
                  <option value="book">Kitap</option>
                  <option value="pdf">PDF</option>
                  <option value="web">Web Sayfası</option>
                  <option value="manual">Manuel Giriş</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İçerik *
              </label>
              <textarea
                value={uploadData.content}
                onChange={(e) => setUploadData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Kaynak içeriğini buraya yazın..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{uploading ? 'Yükleniyor...' : 'Kaynak Ekle'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sources List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Kaynaklar</h3>
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Kaynak</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Tür</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Boyut</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Durum</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Chunk Sayısı</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Tarih</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {getSourceIcon(source.source_type)}
                        <div>
                          <div className="font-medium text-gray-900">{source.title}</div>
                          {source.error_message && (
                            <div className="text-sm text-red-600">{source.error_message}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {source.source_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {source.file_size ? formatFileSize(source.file_size) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(source.processing_status, source.is_processed)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(source.processing_status, source.is_processed)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {source.chunk_count}
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {formatDate(source.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="İndir"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Yeniden İşle"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(source.id, source.title)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kaynak yok</h3>
            <p className="text-gray-600 mb-6">
              Bu karakter için bilgi kaynağı eklemeye başlayın.
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>İlk Kaynağı Ekle</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
