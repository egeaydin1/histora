'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  CreditCard,
  DollarSign,
  BarChart3,
  Clock,
  UserCheck,
  Zap
} from 'lucide-react'

interface SystemStats {
  total_characters: number
  published_characters: number
  total_sources: number
  processed_sources: number
  total_chunks: number
  total_users: number
  active_users: number
  total_tokens_consumed: number
  total_credits_distributed: number
  total_credits_used: number
  monthly_revenue: number
  monthly_new_users: number
  top_characters: Array<{
    character_id: string
    name: string
    usage_count: number
    tokens_consumed: number
  }>
  recent_activity: Array<{
    type: string
    description: string
    timestamp: string
    user_count?: number
    tokens?: number
  }>
  rag_health: {
    status: string
    openai_configured: boolean
    chroma_connected: boolean
    collection_count: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Get auth token
      const token = localStorage.getItem('auth_token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/admin/stats`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Fallback to mock data for development
      setStats({
        total_characters: 3,
        published_characters: 3,
        total_sources: 3,
        processed_sources: 3,
        total_chunks: 5,
        total_users: 1247,
        active_users: 892,
        total_tokens_consumed: 1240567,
        total_credits_distributed: 45230,
        total_credits_used: 32145,
        monthly_revenue: 8950,
        monthly_new_users: 156,
        top_characters: [
          { character_id: 'ataturk-001', name: 'Mustafa Kemal Atatürk', usage_count: 342, tokens_consumed: 125430 },
          { character_id: 'mevlana-001', name: 'Mevlana Celaleddin Rumi', usage_count: 198, tokens_consumed: 89245 },
          { character_id: 'konfucyus-001', name: 'Konfüçyüs', usage_count: 156, tokens_consumed: 67892 }
        ],
        recent_activity: [
          { type: 'user_registration', description: '24 yeni kullanıcı kaydı', timestamp: new Date().toISOString(), user_count: 24 },
          { type: 'token_usage', description: '15,420 token kullanımı', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), tokens: 15420 },
          { type: 'credit_purchase', description: '1,250 kredi satışı', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
          { type: 'character_chat', description: '89 yeni sohbet başlatıldı', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
        ],
        rag_health: {
          status: 'healthy',
          openai_configured: false,
          chroma_connected: true,
          collection_count: 5
        }
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Characters',
      value: stats?.total_characters || 0,
      subValue: `${stats?.published_characters || 0} published`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      subValue: `${stats?.active_users || 0} active this month`,
      icon: UserCheck,
      color: 'green',
    },
    {
      title: 'Tokens Consumed',
      value: (stats?.total_tokens_consumed || 0).toLocaleString(),
      subValue: 'lifetime usage',
      icon: Zap,
      color: 'yellow',
    },
    {
      title: 'Credits Distributed',
      value: (stats?.total_credits_distributed || 0).toLocaleString(),
      subValue: `${(stats?.total_credits_used || 0).toLocaleString()} used`,
      icon: CreditCard,
      color: 'purple',
    },
    {
      title: 'Monthly Revenue',
      value: `${stats?.monthly_revenue || 0}₺`,
      subValue: `${stats?.monthly_new_users || 0} new users`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Knowledge Sources',
      value: stats?.total_sources || 0,
      subValue: `${stats?.processed_sources || 0} processed`,
      icon: FileText,
      color: 'indigo',
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Histora sistem yönetimi ve izleme paneli</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/users"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Kullanıcı Yönetimi
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                API Bağlantı Uyarısı
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {error} - Gösterim için mock veri kullanılıyor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subValue}</p>
              </div>
              <div className={`p-3 rounded-full bg-${card.color}-100 flex-shrink-0`}>
                <card.icon className={`h-6 w-6 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Characters & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Characters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            En Popüler Karakterler
          </h2>
          <div className="space-y-4">
            {stats?.top_characters?.map((character, index) => (
              <div key={character.character_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{character.name}</p>
                    <p className="text-xs text-gray-500">{character.usage_count} sohbet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {character.tokens_consumed.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">token</p>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Son Aktiviteler
          </h2>
          <div className="space-y-4">
            {stats?.recent_activity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      </div>

      {/* RAG System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          RAG Sistem Durumu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${
              stats?.rag_health?.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sistem Durumu</p>
              <p className="text-xs text-gray-500 capitalize">{stats?.rag_health?.status || 'bilinmeyen'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${
              stats?.rag_health?.chroma_connected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Vektör Veritabanı</p>
              <p className="text-xs text-gray-500">
                {stats?.rag_health?.chroma_connected ? 'Bağlı' : 'Bağlantısız'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${
              stats?.rag_health?.openai_configured ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">AI Embeddings</p>
              <p className="text-xs text-gray-500">
                {stats?.rag_health?.openai_configured ? 'Yapılandırılmış' : 'Mock Modu'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-blue-400"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Embedding Chunks</p>
              <p className="text-xs text-gray-500">{stats?.total_chunks || 0} chunk hazır</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/characters"
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium text-gray-900">Karakterler</p>
            </div>
          </Link>
          
          <Link
            href="/admin/users"
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium text-gray-900">Kullanıcılar</p>
            </div>
          </Link>
          
          <Link
            href="/admin/analytics"
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium text-gray-900">Analitik</p>
            </div>
          </Link>
          
          <Link
            href="/admin/settings"
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <Database className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium text-gray-900">Ayarlar</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
