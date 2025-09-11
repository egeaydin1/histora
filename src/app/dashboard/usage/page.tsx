'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface UsageStats {
  period_days: number
  total_tokens: number
  total_cost_cents: number
  total_requests: number
  daily_usage: Record<string, {
    tokens: number
    cost_cents: number
    requests: number
  }>
  current_quota: {
    plan_type: string
    tokens_used: number
    tokens_limit: number
    requests_used: number
    requests_limit: number
    cost_this_month_cents: number
  }
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [period, setPeriod] = useState(30)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadUsageStats()
    }
  }, [user, period])

  const loadUsageStats = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getUsageStats(period)
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`
    }
    return tokens.toLocaleString()
  }

  const getDailyUsageArray = () => {
    if (!stats?.daily_usage) return []
    
    const days = []
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const usage = stats.daily_usage[dateKey] || { tokens: 0, requests: 0, cost_cents: 0 }
      
      days.push({
        date: dateKey,
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        ...usage
      })
    }
    return days
  }

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(d => d[key]), 1)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view usage details.</p>
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
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

  const dailyData = getDailyUsageArray()
  const maxTokens = getMaxValue(dailyData, 'tokens')
  const maxRequests = getMaxValue(dailyData, 'requests')
  const maxCost = getMaxValue(dailyData, 'cost_cents')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/dashboard"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Details</h1>
          <p className="mt-2 text-gray-600">
            Detailed breakdown of your AI conversation usage and costs.
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Last {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Tokens</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {formatTokens(stats.total_tokens)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stats.total_requests.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {formatPrice(stats.total_cost_cents)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Token Usage Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Token Usage Over Time</h3>
            <div className="space-y-2">
              {dailyData.map((day, index) => (
                <div key={day.date} className="flex items-center space-x-4">
                  <div className="w-16 text-xs text-gray-500 text-right">
                    {day.formattedDate}
                  </div>
                  <div className="flex-1 flex items-center">
                    <div 
                      className="bg-blue-500 h-6 rounded transition-all duration-300"
                      style={{ 
                        width: `${(day.tokens / maxTokens) * 100}%`,
                        minWidth: day.tokens > 0 ? '4px' : '0px'
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {formatTokens(day.tokens)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Count Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Requests Over Time</h3>
            <div className="space-y-2">
              {dailyData.map((day, index) => (
                <div key={day.date} className="flex items-center space-x-4">
                  <div className="w-16 text-xs text-gray-500 text-right">
                    {day.formattedDate}
                  </div>
                  <div className="flex-1 flex items-center">
                    <div 
                      className="bg-green-500 h-6 rounded transition-all duration-300"
                      style={{ 
                        width: `${(day.requests / maxRequests) * 100}%`,
                        minWidth: day.requests > 0 ? '4px' : '0px'
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {day.requests}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Cost Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Daily Costs</h3>
          <div className="space-y-2">
            {dailyData.map((day, index) => (
              <div key={day.date} className="flex items-center space-x-4">
                <div className="w-16 text-xs text-gray-500 text-right">
                  {day.formattedDate}
                </div>
                <div className="flex-1 flex items-center">
                  <div 
                    className="bg-yellow-500 h-6 rounded transition-all duration-300"
                    style={{ 
                      width: `${(day.cost_cents / maxCost) * 100}%`,
                      minWidth: day.cost_cents > 0 ? '4px' : '0px'
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {formatPrice(day.cost_cents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Month Summary */}
        {stats?.current_quota && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Current Month Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Token Usage</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{formatTokens(stats.current_quota.tokens_used)} used</span>
                  <span>{formatTokens(stats.current_quota.tokens_limit)} limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((stats.current_quota.tokens_used / stats.current_quota.tokens_limit) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Request Usage</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{stats.current_quota.requests_used.toLocaleString()} used</span>
                  <span>{stats.current_quota.requests_limit.toLocaleString()} limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((stats.current_quota.requests_used / stats.current_quota.requests_limit) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Monthly Cost</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.current_quota.cost_this_month_cents)}
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-medium text-gray-700">Plan</h4>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {stats.current_quota.plan_type}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
