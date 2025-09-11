'use client'

import { useState, useEffect } from 'react'
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HardDrive,
  Users,
  FileText,
  MessageSquare,
  Layers,
  Settings,
  Play,
  Square,
  RotateCcw
} from 'lucide-react'

interface DatabaseStats {
  tables: Array<{
    name: string
    row_count: number
    size_mb: number
    last_updated: string
  }>
  connections: {
    active: number
    max: number
    idle: number
  }
  performance: {
    queries_per_second: number
    avg_query_time: number
    slow_queries: number
  }
  storage: {
    total_size_mb: number
    used_size_mb: number
    free_size_mb: number
  }
  backups: Array<{
    id: string
    created_at: string
    size_mb: number
    type: 'manual' | 'automatic'
    status: 'completed' | 'failed' | 'in_progress'
  }>
}

export default function AdminDatabasePage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  useEffect(() => {
    fetchDatabaseStats()
    checkConnection()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true)
      // Mock data for now - you can implement real API calls later
      const mockStats: DatabaseStats = {
        tables: [
          { name: 'users', row_count: 1247, size_mb: 15.2, last_updated: '2025-01-25T12:30:00Z' },
          { name: 'characters', row_count: 4, size_mb: 2.1, last_updated: '2025-01-25T10:15:00Z' },
          { name: 'character_sources', row_count: 12, size_mb: 45.8, last_updated: '2025-01-25T11:45:00Z' },
          { name: 'chat_sessions', row_count: 8956, size_mb: 125.4, last_updated: '2025-01-25T12:25:00Z' },
          { name: 'chat_messages', row_count: 45632, size_mb: 234.7, last_updated: '2025-01-25T12:30:00Z' },
          { name: 'embedding_chunks', row_count: 5678, size_mb: 89.3, last_updated: '2025-01-25T11:30:00Z' },
          { name: 'system_logs', row_count: 15432, size_mb: 67.9, last_updated: '2025-01-25T12:29:00Z' }
        ],
        connections: {
          active: 12,
          max: 100,
          idle: 8
        },
        performance: {
          queries_per_second: 245.7,
          avg_query_time: 15.4,
          slow_queries: 3
        },
        storage: {
          total_size_mb: 1024,
          used_size_mb: 580.4,
          free_size_mb: 443.6
        },
        backups: [
          {
            id: 'backup_20250125_120000',
            created_at: '2025-01-25T12:00:00Z',
            size_mb: 567.8,
            type: 'automatic',
            status: 'completed'
          },
          {
            id: 'backup_20250124_120000',
            created_at: '2025-01-24T12:00:00Z',
            size_mb: 562.1,
            type: 'automatic',
            status: 'completed'
          },
          {
            id: 'backup_20250125_090000',
            created_at: '2025-01-25T09:00:00Z',
            size_mb: 565.3,
            type: 'manual',
            status: 'completed'
          }
        ]
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Failed to fetch database stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkConnection = async () => {
    setConnectionStatus('checking')
    // Simulate connection check
    setTimeout(() => {
      setConnectionStatus('connected')
    }, 1000)
  }

  const formatSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb.toFixed(1)} MB`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'users': return <Users className="w-4 h-4 text-blue-500" />
      case 'characters': return <Users className="w-4 h-4 text-green-500" />
      case 'character_sources': return <FileText className="w-4 h-4 text-purple-500" />
      case 'chat_sessions': return <MessageSquare className="w-4 h-4 text-orange-500" />
      case 'chat_messages': return <MessageSquare className="w-4 h-4 text-red-500" />
      case 'embedding_chunks': return <Layers className="w-4 h-4 text-indigo-500" />
      case 'system_logs': return <Settings className="w-4 h-4 text-gray-500" />
      default: return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'disconnected': return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking': return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return <div>Veri yüklenemedi</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veritabanı Yönetimi</h1>
          <p className="text-gray-600">Veritabanı durumu, performansı ve yedekleme işlemleri</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg">
            {getStatusIcon(connectionStatus)}
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' && 'Bağlı'}
              {connectionStatus === 'disconnected' && 'Bağlantı Yok'}
              {connectionStatus === 'checking' && 'Kontrol Ediliyor...'}
            </span>
          </div>
          <button
            onClick={checkConnection}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Status & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Bağlantı</p>
              <p className="text-2xl font-bold text-gray-900">{stats.connections.active}/{stats.connections.max}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(stats.connections.active / stats.connections.max) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Depolama</p>
              <p className="text-2xl font-bold text-gray-900">{formatSize(stats.storage.used_size_mb)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <HardDrive className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(stats.storage.used_size_mb / stats.storage.total_size_mb) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatSize(stats.storage.free_size_mb)} boş</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sorgu/Saniye</p>
              <p className="text-2xl font-bold text-gray-900">{stats.performance.queries_per_second}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Ort. sorgu süresi: {stats.performance.avg_query_time}ms</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yavaş Sorgular</p>
              <p className="text-2xl font-bold text-gray-900">{stats.performance.slow_queries}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Son 24 saatte</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: Database },
              { id: 'tables', label: 'Tablolar', icon: Layers },
              { id: 'backups', label: 'Yedekler', icon: RotateCcw },
              { id: 'maintenance', label: 'Bakım', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Veritabanı Tabloları</h3>
                <button
                  onClick={fetchDatabaseStats}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Yenile</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tablo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Satır Sayısı</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Boyut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Son Güncelleme</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.tables.map((table) => (
                      <tr key={table.name} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {getTableIcon(table.name)}
                            <span className="font-medium text-gray-900">{table.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{formatNumber(table.row_count)}</td>
                        <td className="py-3 px-4 text-gray-600">{formatSize(table.size_mb)}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(table.last_updated)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-green-600">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Veritabanı Yedekleri</h3>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Manuel Yedek Al</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Yedek Yükle</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {stats.backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white rounded-lg">
                        <RotateCcw className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{backup.id}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(backup.created_at)} • {formatSize(backup.size_mb)} • {backup.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBackupStatusColor(backup.status)}`}>
                        {backup.status === 'completed' && 'Tamamlandı'}
                        {backup.status === 'failed' && 'Başarısız'}
                        {backup.status === 'in_progress' && 'Devam Ediyor'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Veritabanı Bakım İşlemleri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Optimize Et</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Tablo indekslerini optimize eder ve performansı artırır.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Optimizasyon Başlat
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Temizlik</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Eski log kayıtlarını ve geçici verileri temizler.
                  </p>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                    Temizlik Başlat
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Analiz</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Veritabanı istatistiklerini günceller ve analiz eder.
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Analiz Başlat
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Güvenlik Taraması</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Güvenlik açıklarını tarar ve raporlar.
                  </p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    Tarama Başlat
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sistem Durumu</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Connection Pool */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Bağlantı Havuzu</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aktif</span>
                      <span className="text-sm font-medium">{stats.connections.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Boşta</span>
                      <span className="text-sm font-medium">{stats.connections.idle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Maksimum</span>
                      <span className="text-sm font-medium">{stats.connections.max}</span>
                    </div>
                  </div>
                </div>

                {/* Storage Usage */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Depolama Kullanımı</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Toplam</span>
                      <span className="text-sm font-medium">{formatSize(stats.storage.total_size_mb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kullanılan</span>
                      <span className="text-sm font-medium">{formatSize(stats.storage.used_size_mb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Boş</span>
                      <span className="text-sm font-medium">{formatSize(stats.storage.free_size_mb)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
