'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  UsersIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  display_name: string
  role: string
  is_active: boolean
  credits: number
  total_tokens: number
  total_credits_used: number
  total_credits_purchased: number
  last_login_at: string
  created_at: string
  current_plan: string
  monthly_usage: {
    tokens: number
    credits: number
    conversations: number
  }
}

interface UserFilters {
  search: string
  role: string
  plan: string
  status: string
  sortBy: 'created_at' | 'last_login_at' | 'credits' | 'tokens'
  sortOrder: 'asc' | 'desc'
}

const roles = [
  { value: '', label: 'Tüm Roller' },
  { value: 'user', label: 'Kullanıcı' },
  { value: 'moderator', label: 'Moderatör' },
  { value: 'admin', label: 'Admin' }
]

const plans = [
  { value: '', label: 'Tüm Planlar' },
  { value: 'free', label: 'Ücretsiz' },
  { value: 'pro', label: 'Pro' },
  { value: 'premium', label: 'Premium' }
]

const statuses = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Pasif' }
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [creditAmount, setCreditAmount] = useState<number>(0)
  
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    plan: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_credits_distributed: 0,
    total_tokens_consumed: 0,
    monthly_new_users: 0,
    monthly_revenue: 0
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const loadUsers = async () => {
    try {
      // Mock data for development
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'ahmet@example.com',
          display_name: 'Ahmet Yılmaz',
          role: 'user',
          is_active: true,
          credits: 150,
          total_tokens: 12450,
          total_credits_used: 89,
          total_credits_purchased: 300,
          last_login_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: '2024-01-15T10:00:00Z',
          current_plan: 'pro',
          monthly_usage: { tokens: 3200, credits: 25, conversations: 14 }
        },
        {
          id: '2',
          email: 'elif@example.com',
          display_name: 'Elif Demir',
          role: 'user',
          is_active: true,
          credits: 50,
          total_tokens: 8920,
          total_credits_used: 156,
          total_credits_purchased: 200,
          last_login_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          created_at: '2024-01-10T14:30:00Z',
          current_plan: 'free',
          monthly_usage: { tokens: 1800, credits: 45, conversations: 8 }
        },
        {
          id: '3',
          email: 'mehmet@example.com',
          display_name: 'Mehmet Kaya',
          role: 'moderator',
          is_active: true,
          credits: 500,
          total_tokens: 25600,
          total_credits_used: 234,
          total_credits_purchased: 750,
          last_login_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          created_at: '2024-01-05T09:15:00Z',
          current_plan: 'premium',
          monthly_usage: { tokens: 5400, credits: 67, conversations: 28 }
        }
      ]

      const mockStats = {
        total_users: 1247,
        active_users: 892,
        total_credits_distributed: 45230,
        total_tokens_consumed: 1240567,
        monthly_new_users: 156,
        monthly_revenue: 8950
      }

      setUsers(mockUsers)
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.display_name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    // Plan filter
    if (filters.plan) {
      filtered = filtered.filter(user => user.current_plan === filters.plan)
    }

    // Status filter
    if (filters.status === 'active') {
      filtered = filtered.filter(user => user.is_active)
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(user => !user.is_active)
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (filters.sortBy) {
        case 'created_at':
        case 'last_login_at':
          aValue = new Date(a[filters.sortBy] || 0).getTime()
          bValue = new Date(b[filters.sortBy] || 0).getTime()
          break
        case 'credits':
          aValue = a.credits || 0
          bValue = b.credits || 0
          break
        case 'tokens':
          aValue = a.total_tokens || 0
          bValue = b.total_tokens || 0
          break
        default:
          aValue = 0
          bValue = 0
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  const handleAddCredits = async () => {
    if (selectedUserId && creditAmount > 0) {
      try {
        console.log(`Adding ${creditAmount} credits to user ${selectedUserId}`)
        // TODO: Implement credit addition API call
        setShowCreditModal(false)
        setCreditAmount(0)
        setSelectedUserId('')
        loadUsers() // Refresh data
      } catch (error) {
        console.error('Failed to add credits:', error)
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-yellow-100 text-yellow-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <UsersIcon className="w-6 h-6 mr-2" />
                Kullanıcı Yönetimi
              </h1>
              <p className="text-gray-600 mt-1">
                Kullanıcıları yönetin, kredilerini takip edin ve istatistikleri görüntüleyin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_users)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.active_users)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Dağıtılan Kredi</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_credits_distributed)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Token</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_tokens_consumed)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aylık Yeni</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.monthly_new_users)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aylık Gelir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthly_revenue}₺</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="E-posta veya isim ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {plans.map(plan => (
                <option key={plan.value} value={plan.value}>{plan.label}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <div className="flex space-x-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Katılım Tarihi</option>
                <option value="last_login_at">Son Giriş</option>
                <option value="credits">Kredi</option>
                <option value="tokens">Token</option>
              </select>
              
              <button
                onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredUsers.length} kullanıcı gösteriliyor
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Krediler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokenlar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aylık Kullanım
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {user.display_name?.charAt(0) || user.email.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(user.current_plan)}`}>
                        {user.current_plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(user.credits)}</div>
                      <div className="text-xs text-gray-500">
                        Kullanılan: {formatNumber(user.total_credits_used)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(user.total_tokens)}</div>
                      <div className="text-xs text-gray-500">
                        Bu ay: {formatNumber(user.monthly_usage.tokens)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{user.monthly_usage.conversations} sohbet</div>
                      <div>{formatNumber(user.monthly_usage.credits)} kredi</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_login_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setShowCreditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Kredi Ekle"
                        >
                          <CreditCardIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="Detayları Görüntüle"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Modal */}
        {showCreditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kredi Ekle</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kredi Miktarı
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Eklenecek kredi miktarı"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreditModal(false)
                    setCreditAmount(0)
                    setSelectedUserId('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddCredits}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Kredi Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}