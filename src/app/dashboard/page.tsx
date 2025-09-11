'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { 
  ChartBarIcon, 
  CreditCardIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  FireIcon,
  TrophyIcon,
  BanknotesIcon,
  ArrowUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api'

interface UserStats {
  user_id: string
  credits: number
  total_credits_purchased: number
  total_credits_used: number
  total_tokens: number
  monthly_usage: {
    tokens: number
    credits: number
    requests: number
  }
  recent_activity: Array<{
    type: string
    amount: number
    balance_after: number
    description: string
    created_at: string
  }>
}

interface RecentActivity {
  id: string
  type: 'chat' | 'credit_purchase' | 'plan_change' | 'usage' | 'admin_add'
  character_name?: string
  tokens_used?: number
  credits_used?: number
  amount?: number
  timestamp: string
  description: string
}

interface ChatSession {
  id: string
  character_id: string
  character_name: string
  title?: string
  message_count: number
  last_message_at: string
  created_at: string
  language: string
  mode: string
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteCharacter, setFavoriteCharacter] = useState<string>('')
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load user stats from API
      const statsResponse = await apiClient.getUserTokenStats()
      if (statsResponse.data && !statsResponse.error) {
        setUserStats(statsResponse.data)
      }

      // Load recent chat sessions
      const sessionsResponse = await apiClient.getChatSessions(10, 0)
      if (sessionsResponse.data && !sessionsResponse.error) {
        setChatSessions(sessionsResponse.data)
        
        // Find most used character as favorite
        const characterCounts: Record<string, number> = {}
        sessionsResponse.data.forEach((session: any) => {
          characterCounts[session.character_name] = (characterCounts[session.character_name] || 0) + session.message_count
        })
        
        const mostUsedCharacter = Object.entries(characterCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Henüz yok'
        setFavoriteCharacter(mostUsedCharacter)
      }

      // Load credit transactions for recent activity
      const transactionsResponse = await apiClient.getCreditTransactions(10, 0)
      if (transactionsResponse.data && !transactionsResponse.error) {
        const activities: RecentActivity[] = transactionsResponse.data.transactions.map((tx: any, index: number) => ({
          id: tx.id || `tx-${index}`,
          type: tx.type as RecentActivity['type'],
          amount: tx.amount,
          timestamp: tx.created_at,
          description: tx.description,
          tokens_used: tx.tokens_consumed,
          credits_used: Math.abs(tx.amount)
        }))
        
        // Add recent chat sessions to activity
        const chatActivities: RecentActivity[] = sessionsResponse.data
          ?.slice(0, 5)
          .map((session: any, index: number) => ({
            id: `chat-${session.id}`,
            type: 'chat' as const,
            character_name: session.character_name,
            timestamp: session.last_message_at,
            description: `${session.character_name} ile sohbet - ${session.message_count} mesaj`,
            credits_used: session.message_count * 2 // Estimate 2 credits per message
          })) || []
        
        // Combine and sort all activities by timestamp
        const allActivities = [...activities, ...chatActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
        
        setRecentActivity(allActivities)
      }

      // Try to get quota info for current plan
      const quotaResponse = await apiClient.getQuotaInfo()
      if (quotaResponse.data && !quotaResponse.error) {
        setCurrentPlan(quotaResponse.data.plan_type || 'free')
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Fallback to basic data from user object if API fails
      if (user) {
        setUserStats({
          user_id: user.id,
          credits: user.credits || 0,
          total_credits_purchased: user.total_credits_purchased || 0,
          total_credits_used: user.total_credits_used || 0,
          total_tokens: user.total_tokens || 0,
          monthly_usage: {
            tokens: 0,
            credits: 0,
            requests: 0
          },
          recent_activity: []
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />
      case 'credit_purchase':
        return <CreditCardIcon className="w-4 h-4" />
      case 'plan_change':
        return <ArrowTrendingUpIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'text-blue-600 bg-blue-100'
      case 'credit_purchase':
        return 'text-green-600 bg-green-100'
      case 'plan_change':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-8">Dashboard'a erişmek için giriş yapmanız gerekiyor.</p>
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const creditsPercentage = userStats && userStats.total_credits_purchased > 0 
    ? Math.round((userStats.total_credits_used / userStats.total_credits_purchased) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hoş geldin, {user.display_name || user.email?.split('@')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Histora kullanım istatistiklerin ve hesap bilgilerin burada.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Credits */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Mevcut Krediler</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {formatNumber(userStats?.credits || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Kullanılan: {userStats?.total_credits_used || 0}</span>
                  <span>{creditsPercentage}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${creditsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Token</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {formatNumber(userStats?.total_tokens || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span>Bu ay: {formatNumber(userStats?.monthly_usage.tokens || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversations */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sohbet Sayısı</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {formatNumber(chatSessions.length || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-purple-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span>Bu ay: {userStats?.monthly_usage.requests || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Mevcut Plan</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {currentPlan === 'free' ? 'Ücretsiz' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/pricing" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Planı Değiştir →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Son Aktiviteler
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.timestamp)} - {formatTime(activity.timestamp)}
                      </p>
                      {activity.tokens_used && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {activity.tokens_used} token
                        </span>
                      )}
                      {activity.credits_used && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {activity.credits_used} kredi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FireIcon className="w-5 h-5 mr-2" />
              Hızlı İşlemler
            </h3>
            <div className="space-y-3">
              <Link
                href="/karakterler"
                className="flex items-center justify-between w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-blue-700 font-medium">Sohbete Başla</span>
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-between w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="text-green-700 font-medium">Kredi Satın Al</span>
                <BanknotesIcon className="w-4 h-4 text-green-600" />
              </Link>
              <Link
                href="/dashboard/usage"
                className="flex items-center justify-between w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="text-purple-700 font-medium">Detaylı İstatistik</span>
                <ChartBarIcon className="w-4 h-4 text-purple-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Credit Usage Warning */}
        {creditsPercentage > 80 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">Kredi Azalıyor!</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              Kredilerinizin %{creditsPercentage}'i tükendi. Yeni kredi satın almayı düşünün.
            </p>
            <Link
              href="/pricing"
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              Kredi Satın Al →
            </Link>
          </div>
        )}

        {/* User Profile Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCircleIcon className="w-5 h-5 mr-2" />
            Profil Özeti
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-500">E-posta:</span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Üyelik Tarihi:</span>
              <p className="font-medium">{formatDate(user.created_at || '')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Favori Karakter:</span>
              <p className="font-medium">{favoriteCharacter || 'Henüz yok'}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-4">
            <Link
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Ayarları Düzenle
            </Link>
            <Link
              href="/dashboard/usage"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Detaylı Analiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}