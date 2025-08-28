'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Check,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Trash2
} from 'lucide-react'
import { apiClient } from '@/lib/api'

interface PricingPlan {
  id: string
  name: string
  name_tr: string
  description: string
  description_tr: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: string[]
  features_tr: string[]
  limits: {
    tokens_per_month: number
    requests_per_day: number
    rag_access: boolean
    custom_characters: boolean
    priority_support: boolean
  }
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface CreditPackage {
  id: string
  name: string
  name_tr: string
  credits: number
  price: number
  currency: string
  bonus_credits: number
  description: string
  description_tr: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'plans' | 'credits'>('plans')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createType, setCreateType] = useState<'plan' | 'credit'>('plan')
  const [error, setError] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [createData, setCreateData] = useState<Record<string, any>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load pricing plans using API client
      const plansResponse = await apiClient.getPricingPlans()
      if (plansResponse.data && !plansResponse.error) {
        const transformedPlans = plansResponse.data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          name_tr: plan.display_name,
          description: plan.description || '',
          description_tr: plan.description || '',
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly || 0,
          currency: plan.currency,
          features: [
            `${plan.monthly_token_limit.toLocaleString()} tokens/month`,
            `${plan.monthly_request_limit} requests/day`,
            `${plan.included_credits} credits included`,
            ...(plan.rag_access ? ['RAG enhanced responses'] : []),
            ...(plan.custom_characters ? ['Custom characters'] : []),
            ...(plan.priority_support ? ['Priority support'] : []),
            ...(plan.api_access ? ['API access'] : []),
            ...(plan.advanced_analytics ? ['Advanced analytics'] : [])
          ],
          features_tr: [
            `${plan.monthly_token_limit.toLocaleString()} token/ay`,
            `${plan.monthly_request_limit} istek/gün`,
            `${plan.included_credits} kredi dahil`,
            ...(plan.rag_access ? ['RAG gelişmiş yanıtlar'] : []),
            ...(plan.custom_characters ? ['Özel karakterler'] : []),
            ...(plan.priority_support ? ['Öncelikli destek'] : []),
            ...(plan.api_access ? ['API erişimi'] : []),
            ...(plan.advanced_analytics ? ['Gelişmiş analitik'] : [])
          ],
          limits: {
            tokens_per_month: plan.monthly_token_limit,
            requests_per_day: plan.monthly_request_limit,
            rag_access: plan.rag_access,
            custom_characters: plan.custom_characters,
            priority_support: plan.priority_support
          },
          is_active: plan.is_active,
          is_featured: plan.is_featured,
          sort_order: plan.sort_order,
          created_at: plan.created_at,
          updated_at: plan.updated_at
        }))
        setPlans(transformedPlans)
      } else {
        throw new Error(plansResponse.error || 'Failed to load pricing plans')
      }
      
      // Load credit packages using API client
      const packagesResponse = await apiClient.getCreditPackages()
      if (packagesResponse.data && !packagesResponse.error) {
        const transformedPackages = packagesResponse.data.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.display_name,
          name_tr: pkg.display_name,
          credits: pkg.credit_amount,
          price: pkg.price / 100, // Convert from cents
          currency: pkg.currency,
          bonus_credits: pkg.bonus_credits,
          description: pkg.description || '',
          description_tr: pkg.description || '',
          is_active: pkg.is_active,
          is_featured: pkg.is_popular,
          sort_order: pkg.sort_order,
          created_at: pkg.created_at,
          updated_at: pkg.updated_at
        }))
        setCreditPackages(transformedPackages)
      } else {
        throw new Error(packagesResponse.error || 'Failed to load credit packages')
      }
      
    } catch (error) {
      console.error('Failed to load pricing data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load pricing data')
      // Fallback to minimal mock data on error
      if (plans.length === 0) {
        setPlans([
          {
            id: 'free-plan',
            name: 'free',
            name_tr: 'Ücretsiz',
            description: 'Basic free plan',
            description_tr: 'Temel ücretsiz plan',
            price_monthly: 0,
            price_yearly: 0,
            currency: 'TRY',
            features: ['100 tokens/month', '10 requests/day'],
            features_tr: ['100 token/ay', '10 istek/gün'],
            limits: {
              tokens_per_month: 1000,
              requests_per_day: 10,
              rag_access: false,
              custom_characters: false,
              priority_support: false
            },
            is_active: true,
            is_featured: false,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      }
      if (creditPackages.length === 0) {
        setCreditPackages([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (id: string, type: 'plan' | 'credit') => {
    try {
      if (type === 'plan') {
        const plan = plans.find(p => p.id === id)
        if (plan) {
          const updateData = {
            display_name: editData[id]?.name_tr || plan.name_tr,
            description: editData[id]?.description_tr || plan.description_tr,
            price_monthly: editData[id]?.price_monthly || plan.price_monthly,
            price_yearly: editData[id]?.price_yearly || plan.price_yearly,
            monthly_token_limit: editData[id]?.tokens_per_month || plan.limits.tokens_per_month,
            monthly_request_limit: editData[id]?.requests_per_day || plan.limits.requests_per_day,
            included_credits: editData[id]?.included_credits || 0,
            rag_access: editData[id]?.rag_access !== undefined ? editData[id].rag_access : plan.limits.rag_access,
            custom_characters: editData[id]?.custom_characters !== undefined ? editData[id].custom_characters : plan.limits.custom_characters,
            priority_support: editData[id]?.priority_support !== undefined ? editData[id].priority_support : plan.limits.priority_support,
            is_active: plan.is_active,
            is_featured: plan.is_featured
          }
          
          const response = await apiClient.updatePricingPlan(id, updateData)
          if (response.error) {
            throw new Error(response.error)
          }
        }
      } else {
        const pkg = creditPackages.find(p => p.id === id)
        if (pkg) {
          const updateData = {
            display_name: editData[id]?.name_tr || pkg.name_tr,
            description: editData[id]?.description_tr || pkg.description_tr,
            credit_amount: editData[id]?.credits || pkg.credits,
            bonus_credits: editData[id]?.bonus_credits || pkg.bonus_credits,
            price: (editData[id]?.price || pkg.price) * 100, // Convert to cents
            is_active: pkg.is_active,
            is_popular: pkg.is_featured
          }
          
          const response = await apiClient.updateCreditPackage(id, updateData)
          if (response.error) {
            throw new Error(response.error)
          }
        }
      }
      
      setEditingItem(null)
      setEditData({})
      await loadData() // Reload data to reflect changes
      
    } catch (error) {
      console.error(`Failed to save ${type}:`, error)
      setError(`Failed to save ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCreate = async () => {
    try {
      if (createType === 'plan') {
        const planData = {
          name: createData.name || 'new-plan',
          display_name: createData.display_name || 'New Plan',
          description: createData.description || '',
          price_monthly: (createData.price_monthly || 0) * 100, // Convert to cents
          price_yearly: (createData.price_yearly || 0) * 100,
          monthly_token_limit: createData.monthly_token_limit || 1000,
          monthly_request_limit: createData.monthly_request_limit || 100,
          included_credits: createData.included_credits || 0,
          rag_access: createData.rag_access || false,
          custom_characters: createData.custom_characters || false,
          priority_support: createData.priority_support || false,
          api_access: createData.api_access || false,
          advanced_analytics: createData.advanced_analytics || false,
          is_active: true,
          is_featured: false,
          sort_order: plans.length
        }
        
        const response = await apiClient.createPricingPlan(planData)
        if (response.error) {
          throw new Error(response.error)
        }
      } else {
        const packageData = {
          name: createData.name || 'new-package',
          display_name: createData.display_name || 'New Package',
          description: createData.description || '',
          credit_amount: createData.credit_amount || 100,
          bonus_credits: createData.bonus_credits || 0,
          price: (createData.price || 10) * 100, // Convert to cents
          original_price: createData.original_price ? createData.original_price * 100 : null,
          is_popular: false,
          discount_percentage: 0,
          is_active: true,
          sort_order: creditPackages.length
        }
        
        const response = await apiClient.createCreditPackage(packageData)
        if (response.error) {
          throw new Error(response.error)
        }
      }
      
      setShowCreateModal(false)
      setCreateData({})
      await loadData() // Reload data to show new item
      
    } catch (error) {
      console.error(`Failed to create ${createType}:`, error)
      setError(`Failed to create ${createType}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string, type: 'plan' | 'credit') => {
    const itemName = type === 'plan' 
      ? plans.find(p => p.id === id)?.name_tr 
      : creditPackages.find(p => p.id === id)?.name_tr
    
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      if (type === 'plan') {
        const response = await apiClient.deletePricingPlan(id)
        if (response.error) {
          throw new Error(response.error)
        }
        setPlans(prev => prev.filter(p => p.id !== id))
      } else {
        const response = await apiClient.deleteCreditPackage(id)
        if (response.error) {
          throw new Error(response.error)
        }
        setCreditPackages(prev => prev.filter(p => p.id !== id))
      }
      
      setEditingItem(null)
      setError(null)
      
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
      setError(`Failed to delete ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleToggleActive = async (id: string, type: 'plan' | 'credit') => {
    try {
      if (type === 'plan') {
        const plan = plans.find(p => p.id === id)
        if (plan) {
          const updateData = { is_active: !plan.is_active }
          const response = await apiClient.updatePricingPlan(id, updateData)
          
          if (!response.error) {
            setPlans(prev => prev.map(p => 
              p.id === id ? { ...p, is_active: !p.is_active } : p
            ))
          } else {
            throw new Error(response.error)
          }
        }
      } else {
        const pkg = creditPackages.find(p => p.id === id)
        if (pkg) {
          const updateData = { is_active: !pkg.is_active }
          const response = await apiClient.updateCreditPackage(id, updateData)
          
          if (!response.error) {
            setCreditPackages(prev => prev.map(p => 
              p.id === id ? { ...p, is_active: !p.is_active } : p
            ))
          } else {
            throw new Error(response.error)
          }
        }
      }
      
    } catch (error) {
      console.error(`Failed to toggle ${type} status:`, error)
      setError(`Failed to toggle ${type} status: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans & Pricing Management</h1>
          <p className="text-gray-600">Manage subscription plans and credit packages</p>
        </div>
        <button
          onClick={() => {
            setCreateType(activeTab === 'plans' ? 'plan' : 'credit')
            setCreateData({})
            setShowCreateModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New {activeTab === 'plans' ? 'Plan' : 'Package'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">{plans.filter(p => p.is_active).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Credit Packages</p>
              <p className="text-2xl font-bold text-gray-900">{creditPackages.filter(p => p.is_active).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue (Monthly)</p>
              <p className="text-2xl font-bold text-gray-900">₺12,450</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">847</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'credits'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Credit Packages
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'plans' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-lg shadow-sm border-2 ${plan.is_featured ? 'border-blue-500' : 'border-gray-200'} relative`}>
              {plan.is_featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name_tr}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(plan.id, 'plan')}
                      className={`w-6 h-6 rounded-full ${plan.is_active ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center`}
                      title={plan.is_active ? 'Deactivate plan' : 'Activate plan'}
                    >
                      {plan.is_active && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <button
                      onClick={() => {
                        if (editingItem === plan.id) {
                          setEditingItem(null)
                          setEditData({})
                        } else {
                          setEditingItem(plan.id)
                          setEditData({
                            [plan.id]: {
                              name_tr: plan.name_tr,
                              description_tr: plan.description_tr,
                              price_monthly: plan.price_monthly,
                              price_yearly: plan.price_yearly,
                              tokens_per_month: plan.limits.tokens_per_month,
                              requests_per_day: plan.limits.requests_per_day,
                              included_credits: 0,
                              rag_access: plan.limits.rag_access,
                              custom_characters: plan.limits.custom_characters,
                              priority_support: plan.limits.priority_support
                            }
                          })
                        }
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id, 'plan')}
                      className="text-red-400 hover:text-red-600"
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{plan.description_tr}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">₺{plan.price_monthly}</span>
                    <span className="text-gray-500 ml-2">/ay</span>
                  </div>
                  {plan.price_yearly > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      Yıllık: ₺{plan.price_yearly} (%{Math.round((1 - (plan.price_yearly / (plan.price_monthly * 12))) * 100)} indirim)
                    </div>
                  )}
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features_tr.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {editingItem === plan.id && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                          type="text"
                          value={editData[plan.id]?.name_tr || plan.name_tr}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [plan.id]: { ...prev[plan.id], name_tr: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Monthly Price (₺)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editData[plan.id]?.price_monthly || plan.price_monthly}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [plan.id]: { ...prev[plan.id], price_monthly: parseFloat(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Yearly Price (₺)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editData[plan.id]?.price_yearly || plan.price_yearly}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [plan.id]: { ...prev[plan.id], price_yearly: parseFloat(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tokens/Month</label>
                        <input
                          type="number"
                          value={editData[plan.id]?.tokens_per_month || plan.limits.tokens_per_month}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [plan.id]: { ...prev[plan.id], tokens_per_month: parseInt(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Requests/Day</label>
                        <input
                          type="number"
                          value={editData[plan.id]?.requests_per_day || plan.limits.requests_per_day}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [plan.id]: { ...prev[plan.id], requests_per_day: parseInt(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Included Credits</label>
                        <input
                          type="number"
                          value={editData[plan.id]?.included_credits || 0}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [plan.id]: { ...prev[plan.id], included_credits: parseInt(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={editData[plan.id]?.description_tr || plan.description_tr}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [plan.id]: { ...prev[plan.id], description_tr: e.target.value }
                          }))}
                          rows={2}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`rag-${plan.id}`}
                            checked={editData[plan.id]?.rag_access !== undefined ? editData[plan.id].rag_access : plan.limits.rag_access}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              [plan.id]: { ...prev[plan.id], rag_access: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`rag-${plan.id}`} className="ml-2 text-sm text-gray-700">RAG Access</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`custom-${plan.id}`}
                            checked={editData[plan.id]?.custom_characters !== undefined ? editData[plan.id].custom_characters : plan.limits.custom_characters}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              [plan.id]: { ...prev[plan.id], custom_characters: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`custom-${plan.id}`} className="ml-2 text-sm text-gray-700">Custom Characters</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`priority-${plan.id}`}
                            checked={editData[plan.id]?.priority_support !== undefined ? editData[plan.id].priority_support : plan.limits.priority_support}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              [plan.id]: { ...prev[plan.id], priority_support: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor={`priority-${plan.id}`} className="ml-2 text-sm text-gray-700">Priority Support</label>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(plan.id, 'plan')}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(null)
                          setEditData({})
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-400"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <div key={pkg.id} className={`bg-white rounded-lg shadow-sm border-2 ${pkg.is_featured ? 'border-green-500' : 'border-gray-200'} relative`}>
              {pkg.is_featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name_tr}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(pkg.id, 'credit')}
                      className={`w-6 h-6 rounded-full ${pkg.is_active ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center`}
                      title={pkg.is_active ? 'Deactivate package' : 'Activate package'}
                    >
                      {pkg.is_active && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <button
                      onClick={() => {
                        if (editingItem === pkg.id) {
                          setEditingItem(null)
                          setEditData({})
                        } else {
                          setEditingItem(pkg.id)
                          setEditData({
                            [pkg.id]: {
                              name_tr: pkg.name_tr,
                              description_tr: pkg.description_tr,
                              credits: pkg.credits,
                              bonus_credits: pkg.bonus_credits,
                              price: pkg.price
                            }
                          })
                        }
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit package"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id, 'credit')}
                      className="text-red-400 hover:text-red-600"
                      title="Delete package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{pkg.description_tr}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{pkg.credits}</span>
                      <span className="text-gray-500 ml-1">kredi</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900">₺{pkg.price}</span>
                    </div>
                  </div>
                  {pkg.bonus_credits > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      +{pkg.bonus_credits} bonus kredi!
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  Kredi başına: ₺{(pkg.price / (pkg.credits + pkg.bonus_credits)).toFixed(2)}
                </div>
                
                {editingItem === pkg.id && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                          type="text"
                          value={editData[pkg.id]?.name_tr || pkg.name_tr}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [pkg.id]: { ...prev[pkg.id], name_tr: e.target.value }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Credits</label>
                        <input
                          type="number"
                          value={editData[pkg.id]?.credits || pkg.credits}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [pkg.id]: { ...prev[pkg.id], credits: parseInt(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bonus Credits</label>
                        <input
                          type="number"
                          value={editData[pkg.id]?.bonus_credits || pkg.bonus_credits}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [pkg.id]: { ...prev[pkg.id], bonus_credits: parseInt(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price (₺)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editData[pkg.id]?.price || pkg.price}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            [pkg.id]: { ...prev[pkg.id], price: parseFloat(e.target.value) || 0 }
                          }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={editData[pkg.id]?.description_tr || pkg.description_tr}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          [pkg.id]: { ...prev[pkg.id], description_tr: e.target.value }
                        }))}
                        rows={2}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(pkg.id, 'credit')}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(null)
                          setEditData({})
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-400"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New {createType === 'plan' ? 'Plan' : 'Credit Package'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name *</label>
                <input
                  type="text"
                  value={createData.display_name || ''}
                  onChange={(e) => setCreateData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder={createType === 'plan' ? 'Plan display name' : 'Package display name'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Internal Name *</label>
                <input
                  type="text"
                  value={createData.name || ''}
                  onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder={createType === 'plan' ? 'plan-name' : 'package-name'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={createData.description || ''}
                  onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter description"
                />
              </div>
              {createType === 'plan' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monthly Price (₺) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={createData.price_monthly || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, price_monthly: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Yearly Price (₺)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={createData.price_yearly || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, price_yearly: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tokens per Month *</label>
                      <input
                        type="number"
                        value={createData.monthly_token_limit || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, monthly_token_limit: parseInt(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Requests per Day *</label>
                      <input
                        type="number"
                        value={createData.monthly_request_limit || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, monthly_request_limit: parseInt(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Included Credits</label>
                    <input
                      type="number"
                      value={createData.included_credits || ''}
                      onChange={(e) => setCreateData(prev => ({ ...prev, included_credits: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="create-rag"
                        checked={createData.rag_access || false}
                        onChange={(e) => setCreateData(prev => ({ ...prev, rag_access: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="create-rag" className="ml-2 text-sm text-gray-700">RAG Access</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="create-custom"
                        checked={createData.custom_characters || false}
                        onChange={(e) => setCreateData(prev => ({ ...prev, custom_characters: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="create-custom" className="ml-2 text-sm text-gray-700">Custom Characters</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="create-priority"
                        checked={createData.priority_support || false}
                        onChange={(e) => setCreateData(prev => ({ ...prev, priority_support: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="create-priority" className="ml-2 text-sm text-gray-700">Priority Support</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="create-api"
                        checked={createData.api_access || false}
                        onChange={(e) => setCreateData(prev => ({ ...prev, api_access: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="create-api" className="ml-2 text-sm text-gray-700">API Access</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="create-analytics"
                        checked={createData.advanced_analytics || false}
                        onChange={(e) => setCreateData(prev => ({ ...prev, advanced_analytics: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="create-analytics" className="ml-2 text-sm text-gray-700">Advanced Analytics</label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Credits *</label>
                      <input
                        type="number"
                        value={createData.credit_amount || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, credit_amount: parseInt(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bonus Credits</label>
                      <input
                        type="number"
                        value={createData.bonus_credits || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, bonus_credits: parseInt(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price (₺) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={createData.price || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Original Price (₺)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={createData.original_price || ''}
                        onChange={(e) => setCreateData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || null }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="create-popular"
                      checked={createData.is_popular || false}
                      onChange={(e) => setCreateData(prev => ({ ...prev, is_popular: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="create-popular" className="ml-2 text-sm text-gray-700">Mark as Popular</label>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateData({})
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !createData.display_name || !createData.name || (createType === 'plan' ? !createData.price_monthly || !createData.monthly_token_limit : !createData.credit_amount || !createData.price)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}