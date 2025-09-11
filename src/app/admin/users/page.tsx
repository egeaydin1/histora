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
import { apiClient } from '@/lib/api'
import type { User } from '@/types'

// Extended interface for display purposes
interface DisplayUser extends User {
  current_plan?: string
  monthly_usage?: {
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
  sortBy: 'created_at' | 'last_login_at' | 'credits' | 'total_tokens'
  sortOrder: 'asc' | 'desc'
}

interface AdminStats {
  total_users: number
  active_users: number
  admin_users: number
  users_by_role: Record<string, number>
  auth_method: string
  token_expire_minutes: number
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
  const [users, setUsers] = useState<DisplayUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<DisplayUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    active_users: 0,
    admin_users: 0,
    users_by_role: {},
    auth_method: '',
    token_expire_minutes: 0
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get admin token and set it for API client
      const adminToken = localStorage.getItem('histora_admin_token')
      if (adminToken) {
        apiClient.client.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
      }
      
      // Load admin users
      const usersResponse = await apiClient.getAdminUsers({ limit: 100 })
      
      if (usersResponse.error) {
        throw new Error(usersResponse.error)
      }
      
      // Transform users to include display fields
      const displayUsers: DisplayUser[] = (usersResponse.data || []).map(user => ({
        ...user,
        // Add default values for fields that might not be present
        display_name: user.display_name || user.full_name || user.email.split('@')[0],
        credits: user.credits || 0,
        total_tokens: user.total_tokens || 0,
        total_credits_used: user.total_credits_used || 0,
        total_credits_purchased: user.total_credits_purchased || 0,
        current_plan: user.current_plan || 'free',
        monthly_usage: {
          tokens: 0, // TODO: Get from usage API
          credits: 0, // TODO: Get from usage API  
          conversations: 0 // TODO: Get from chat sessions API
        }
      }))
      
      setUsers(displayUsers)
      
      // Load admin stats
      const statsResponse = await apiClient.getAdminStats()
      
      if (statsResponse.data) {
        setStats({
          ...statsResponse.data,
          admin_users: statsResponse.data.admin_users || statsResponse.data.users_by_role?.admin || 0
        })
      }
      
    } catch (error) {
      console.error('Failed to load users:', error)
      setError(error instanceof Error ? error.message : 'Failed to load users')
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
        (user.display_name?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
        (user.full_name?.toLowerCase().includes(filters.search.toLowerCase()) || false)
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
        case 'total_tokens':
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
        // Ensure admin token is set
        const adminToken = localStorage.getItem('histora_admin_token')
        if (adminToken) {
          apiClient.client.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
        }
        
        const response = await apiClient.addUserCredits(
          selectedUserId, 
          creditAmount, 
          `Admin added ${creditAmount} credits`
        )
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        setShowCreditModal(false)
        setCreditAmount(0)
        setSelectedUserId('')
        
        // Refresh users data
        loadUsers()
        
        // Show success message
        alert(`Successfully added ${creditAmount} credits!`)
      } catch (error) {
        console.error('Failed to add credits:', error)
        alert(`Failed to add credits: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Ensure admin token is set
      const adminToken = localStorage.getItem('histora_admin_token')
      if (adminToken) {
        apiClient.client.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
      }

      const response = await apiClient.deleteUser(userId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Remove user from local state
      setUsers(prev => prev.filter(user => user.id !== userId))
      alert('User deleted successfully!')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userEmail: string) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} user "${userEmail}"?`)) {
      return
    }

    try {
      // Ensure admin token is set
      const adminToken = localStorage.getItem('histora_admin_token')
      if (adminToken) {
        apiClient.client.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`
      }

      const response = await apiClient.toggleUserStatus(userId, !currentStatus)
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ))
      alert(`User ${action}d successfully!`)
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      alert(`Failed to ${action} user: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 max-w-md">
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Veri Yüklenemedi</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadUsers()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
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
                <p className="text-sm font-medium text-gray-500">Admin Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.admin_users)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Normal Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.users_by_role.user || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Moderatör</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.users_by_role.moderator || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Token Süresi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.token_expire_minutes}dk</p>
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
                <option value="total_tokens">Token</option>
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
                            {(user.display_name || user.full_name || user.email)?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.display_name || user.full_name || 'No Name'}</div>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(user.current_plan || 'free')}`}>
                        {user.current_plan || 'free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(user.credits || 0)}</div>
                      <div className="text-xs text-gray-500">
                        Kullanılan: {formatNumber(user.total_credits_used || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(user.total_tokens || 0)}</div>
                      <div className="text-xs text-gray-500">
                        Bu ay: {formatNumber(user.monthly_usage?.tokens || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{user.monthly_usage?.conversations || 0} sohbet</div>
                      <div>{formatNumber(user.monthly_usage?.credits || 0)} kredi</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at ? formatDate(user.last_login_at) : 'Hiç giriş yapmamış'}
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
                          onClick={() => handleToggleUserStatus(user.id, user.is_active || false, user.email)}
                          className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.is_active ? 'Kullanıcıyı Pasifleştir' : 'Kullanıcıyı Aktifleştir'}
                        >
                          {user.is_active ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="Detayları Görüntüle"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-900"
                          title="Kullanıcıyı Sil"
                        >
                          <TrashIcon className="w-4 h-4" />
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