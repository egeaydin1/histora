'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  ThumbsUp
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalChats: number
    totalMessages: number
    averageSessionTime: number
    userGrowth: number
    chatGrowth: number
  }
  characterPopularity: Array<{
    character_id: string
    character_name: string
    chat_count: number
    message_count: number
    avg_rating: number
  }>
  userEngagement: Array<{
    date: string
    active_users: number
    new_users: number
    chat_sessions: number
  }>
  messageStats: {
    daily: Array<{
      date: string
      count: number
    }>
    hourly: Array<{
      hour: number
      count: number
    }>
  }
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Mock data for now - you can implement real API calls later
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1247,
          totalChats: 8956,
          totalMessages: 45632,
          averageSessionTime: 12.5,
          userGrowth: 15.2,
          chatGrowth: 23.7
        },
        characterPopularity: [
          {
            character_id: 'ataturk-001',
            character_name: 'Mustafa Kemal Atatürk',
            chat_count: 3245,
            message_count: 18750,
            avg_rating: 4.8
          },
          {
            character_id: 'mevlana-001',
            character_name: 'Mevlana Celaleddin Rumi',
            chat_count: 2876,
            message_count: 15430,
            avg_rating: 4.7
          },
          {
            character_id: 'konfucyus-001',
            character_name: 'Konfüçyüs',
            chat_count: 2835,
            message_count: 11452,
            avg_rating: 4.6
          }
        ],
        userEngagement: [
          { date: '2025-01-19', active_users: 145, new_users: 23, chat_sessions: 287 },
          { date: '2025-01-20', active_users: 162, new_users: 31, chat_sessions: 325 },
          { date: '2025-01-21', active_users: 178, new_users: 28, chat_sessions: 356 },
          { date: '2025-01-22', active_users: 189, new_users: 34, chat_sessions: 378 },
          { date: '2025-01-23', active_users: 203, new_users: 42, chat_sessions: 412 },
          { date: '2025-01-24', active_users: 198, new_users: 29, chat_sessions: 398 },
          { date: '2025-01-25', active_users: 216, new_users: 38, chat_sessions: 445 }
        ],
        messageStats: {
          daily: [
            { date: '2025-01-19', count: 4521 },
            { date: '2025-01-20', count: 5123 },
            { date: '2025-01-21', count: 5678 },
            { date: '2025-01-22', count: 6234 },
            { date: '2025-01-23', count: 6789 },
            { date: '2025-01-24', count: 6456 },
            { date: '2025-01-25', count: 7234 }
          ],
          hourly: [
            { hour: 0, count: 156 },
            { hour: 6, count: 234 },
            { hour: 12, count: 567 },
            { hour: 18, count: 445 },
            { hour: 24, count: 321 }
          ]
        }
      }

      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return <div>Veri yüklenemedi</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik Veriler</h1>
          <p className="text-gray-600">Platform kullanım istatistikleri ve trendler</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Son 24 Saat</option>
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 3 Ay</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Rapor İndir</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalUsers)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{data.overview.userGrowth}%</span>
            <span className="text-sm text-gray-500 ml-1">bu ay</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sohbet</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalChats)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{data.overview.chatGrowth}%</span>
            <span className="text-sm text-gray-500 ml-1">bu ay</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalMessages)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Eye className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-gray-600">Günlük ortalama: {Math.round(data.overview.totalMessages / 30)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ort. Oturum Süresi</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.averageSessionTime}dk</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">Kullanıcı başına ortalama</span>
          </div>
        </div>
      </div>

      {/* Character Popularity */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Karakter Popülaritesi</h3>
        <div className="space-y-4">
          {data.characterPopularity.map((character, index) => (
            <div key={character.character_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{character.character_name}</h4>
                  <p className="text-sm text-gray-600">
                    {formatNumber(character.chat_count)} sohbet • {formatNumber(character.message_count)} mesaj
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{character.avg_rating}</span>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(character.chat_count / Math.max(...data.characterPopularity.map(c => c.chat_count))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Etkileşimi</h3>
          <div className="space-y-4">
            {data.userEngagement.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{day.active_users} aktif</div>
                    <div className="text-xs text-gray-500">+{day.new_users} yeni</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(day.active_users / Math.max(...data.userEngagement.map(d => d.active_users))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Activity */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mesaj Aktivitesi</h3>
          <div className="space-y-4">
            {data.messageStats.daily.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{formatDate(day.date)}</div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900">{formatNumber(day.count)}</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(day.count / Math.max(...data.messageStats.daily.map(d => d.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Gerçek Zamanlı Aktivite</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Canlı</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">23</div>
            <div className="text-sm text-gray-600">Aktif Sohbet</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">145</div>
            <div className="text-sm text-gray-600">Online Kullanıcı</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">1.2K</div>
            <div className="text-sm text-gray-600">Bu Saat Mesaj</div>
          </div>
        </div>
      </div>
    </div>
  )
}
