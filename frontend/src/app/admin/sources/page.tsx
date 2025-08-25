'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  RefreshCw
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
}

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Mock data for now - you can implement real API calls later
      const mockSources: Source[] = [
        {
          id: '1',
          character_id: 'ataturk-001',
          title: 'Atatürk Biyografi',
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
          character_id: 'mevlana-001',
          title: 'Mesnevi Metinleri',
          source_type: 'text',
          file_path: '/uploads/mesnevi-texts.txt',
          file_size: 1024000,
          is_processed: false,
          processing_status: 'processing',
          chunk_count: 0,
          created_at: '2025-01-25T11:00:00Z',
          updated_at: '2025-01-25T11:00:00Z'
        },
        {
          id: '3',
          character_id: 'konfucyus-001',
          title: 'Analektalar',
          source_type: 'document',
          file_path: '/uploads/analektalar.docx',
          file_size: 512000,
          is_processed: false,
          processing_status: 'failed',
          error_message: 'File format not supported',
          chunk_count: 0,
          created_at: '2025-01-25T12:00:00Z',
          updated_at: '2025-01-25T12:05:00Z'
        }
      ]

      const mockCharacters: Character[] = [
        { id: 'ataturk-001', name: 'Mustafa Kemal Atatürk' },
        { id: 'mevlana-001', name: 'Mevlana Celaleddin Rumi' },
        { id: 'konfucyus-001', name: 'Konfüçyüs' }
      ]

      setSources(mockSources)
      setCharacters(mockCharacters)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string, isProcessed: boolean) => {
    if (isProcessed) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'processing') return <Clock className="w-4 h-4 text-yellow-500" />
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

  const filteredSources = sources.filter(source => {
    const matchesCharacter = selectedCharacter === 'all' || source.character_id === selectedCharacter
    const matchesSearch = source.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'processed' && source.is_processed) ||
      (statusFilter === 'processing' && source.processing_status === 'processing') ||
      (statusFilter === 'failed' && source.processing_status === 'failed')
    
    return matchesCharacter && matchesSearch && matchesStatus
  })

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kaynak Yönetimi</h1>
          <p className="text-gray-600">Karakter kaynaklarını görüntüleyin ve yönetin</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Yeni Kaynak</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Kaynak ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Character Filter */}
          <select
            value={selectedCharacter}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm Karakterler</option>
            {characters.map(character => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="processed">Tamamlandı</option>
            <option value="processing">İşleniyor</option>
            <option value="failed">Başarısız</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Kaynak</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Karakter</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tür</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Boyut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Durum</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Chunk Sayısı</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Tarih</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSources.map((source) => {
                const character = characters.find(c => c.id === source.character_id)
                return (
                  <tr key={source.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{source.title}</div>
                          {source.error_message && (
                            <div className="text-sm text-red-600">{source.error_message}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {character?.name || source.character_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {source.source_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {source.file_size ? formatFileSize(source.file_size) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(source.processing_status, source.is_processed)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(source.processing_status, source.is_processed)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {source.chunk_count}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {formatDate(source.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredSources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kaynak bulunamadı</h3>
            <p className="text-gray-600">Henüz hiç kaynak eklenmemiş veya filtrelerinizle eşleşen kaynak yok.</p>
          </div>
        )}
      </div>
    </div>
  )
}
