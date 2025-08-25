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
  Package
} from 'lucide-react'

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      // Load pricing plans from database
      const plansResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/pricing-plans`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        const transformedPlans = plansData.map((plan: any) => ({
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
            ...(plan.rag_access ? ['RAG enhanced responses'] : []),
            ...(plan.custom_characters ? ['Custom characters'] : []),
            ...(plan.priority_support ? ['Priority support'] : []),
            ...(plan.api_access ? ['API access'] : []),
            ...(plan.advanced_analytics ? ['Advanced analytics'] : [])
          ],
          features_tr: [
            `${plan.monthly_token_limit.toLocaleString()} token/ay`,
            `${plan.monthly_request_limit} istek/gün`,
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
        console.error('Failed to load pricing plans:', plansResponse.status)
      }
      
      // Load credit packages from database
      const packagesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/credit-packages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json()
        const transformedPackages = packagesData.map((pkg: any) => ({
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
        console.error('Failed to load credit packages:', packagesResponse.status)
      }
      
    } catch (error) {
      console.error('Failed to load pricing data:', error)
      // Fallback to minimal mock data on error
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
      setCreditPackages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (id: string, type: 'plan' | 'credit') => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (type === 'plan') {
        const plan = plans.find(p => p.id === id)
        if (plan) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/pricing-plans/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                display_name: plan.name_tr,
                description: plan.description_tr,
                price_monthly: plan.price_monthly,
                price_yearly: plan.price_yearly,
                is_active: plan.is_active,
                is_featured: plan.is_featured
              })
            }
          )
          
          if (!response.ok) {
            throw new Error(`Failed to update plan: ${response.status}`)
          }
        }
      } else {
        const pkg = creditPackages.find(p => p.id === id)
        if (pkg) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/credit-packages/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                display_name: pkg.name_tr,
                description: pkg.description_tr,
                price: pkg.price * 100, // Convert to cents
                is_active: pkg.is_active,
                is_featured: pkg.is_featured
              })
            }
          )
          
          if (!response.ok) {
            throw new Error(`Failed to update credit package: ${response.status}`)
          }
        }
      }
      
      setEditingItem(null)
      console.log(`Successfully saved ${type} ${id}`)
      
    } catch (error) {
      console.error(`Failed to save ${type}:`, error)
      alert(`Failed to save ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCreate = async () => {
    try {
      console.log(`Creating new ${createType}`)
      // TODO: Implement create new plan/credit package
      setShowCreateModal(false)
      loadData()
    } catch (error) {
      console.error(`Failed to create ${createType}:`, error)
    }
  }

  const handleToggleActive = async (id: string, type: 'plan' | 'credit') => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (type === 'plan') {
        const plan = plans.find(p => p.id === id)
        if (plan) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/pricing-plans/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                is_active: !plan.is_active
              })
            }
          )
          
          if (response.ok) {
            setPlans(prev => prev.map(p => 
              p.id === id ? { ...p, is_active: !p.is_active } : p
            ))
          } else {
            throw new Error(`Failed to toggle plan status: ${response.status}`)
          }
        }
      } else {
        const pkg = creditPackages.find(p => p.id === id)
        if (pkg) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/credit-packages/${id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                is_active: !pkg.is_active
              })
            }
          )
          
          if (response.ok) {
            setCreditPackages(prev => prev.map(p => 
              p.id === id ? { ...p, is_active: !p.is_active } : p
            ))
          } else {
            throw new Error(`Failed to toggle package status: ${response.status}`)
          }
        }
      }
      
      console.log(`Toggled ${type} ${id} active status`)
      
    } catch (error) {
      console.error(`Failed to toggle ${type} status:`, error)
      alert(`Failed to toggle ${type} status: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
            setShowCreateModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New {activeTab === 'plans' ? 'Plan' : 'Package'}
        </button>
      </div>

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
                    >
                      {plan.is_active && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <button
                      onClick={() => setEditingItem(editingItem === plan.id ? null : plan.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
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
                        <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                        <input
                          type="number"
                          defaultValue={plan.price_monthly}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tokens/Month</label>
                        <input
                          type="number"
                          defaultValue={plan.limits.tokens_per_month}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(plan.id, 'plan')}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
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
                    >
                      {pkg.is_active && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <button
                      onClick={() => setEditingItem(editingItem === pkg.id ? null : pkg.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
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
                        <label className="block text-sm font-medium text-gray-700">Credits</label>
                        <input
                          type="number"
                          defaultValue={pkg.credits}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                          type="number"
                          defaultValue={pkg.price}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(pkg.id, 'credit')}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New {createType === 'plan' ? 'Plan' : 'Credit Package'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder={createType === 'plan' ? 'Plan name' : 'Package name'}
                />
              </div>
              {createType === 'plan' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Price (₺)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tokens per Month</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Credits</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₺)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}