'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckIcon, 
  XMarkIcon,
  SparklesIcon,
  CreditCardIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  period: string
  credits: number
  features: string[]
  limitations: string[]
  recommended: boolean
  popular: boolean
}

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  currency: string
  bonus: number
  popular: boolean
}

// Fallback data for when API is not available
const fallbackPricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    description: 'Histora\'ya başlamak için ideal',
    price: 0,
    currency: 'TL',
    period: 'ay',
    credits: 100,
    features: [
      '100 kredi/ay',
      '3 karakter ile sohbet',
      'Temel sohbet özellikleri',
      'Mobil erişim'
    ],
    limitations: [
      'Sınırlı karakter erişimi',
      'Günlük sohbet limiti',
      'Temel destek'
    ],
    recommended: false,
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'En popüler plan - güçlü özellikler',
    price: 29,
    currency: 'TL',
    period: 'ay',
    credits: 1000,
    features: [
      '1000 kredi/ay',
      'Tüm karakterlerle sohbet',
      'Gelişmiş sohbet özellikleri',
      'Sohbet geçmişi',
      'Öncelikli destek',
      'Özel karakterler'
    ],
    limitations: [],
    recommended: true,
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Sınırsız deneyim için',
    price: 49,
    currency: 'TL',
    period: 'ay',
    credits: 2500,
    features: [
      '2500 kredi/ay',
      'Tüm karakterlerle sohbet',
      'Sınırsız sohbet geçmişi',
      'Özel karakter istekleri',
      '7/24 destek',
      'Beta özellikler',
      'API erişimi'
    ],
    limitations: [],
    recommended: false,
    popular: false
  }
]

const fallbackCreditPackages: CreditPackage[] = [
  {
    id: 'credits-100',
    name: 'Başlangıç',
    credits: 100,
    price: 10,
    currency: 'TL',
    bonus: 0,
    popular: false
  },
  {
    id: 'credits-300',
    name: 'Popüler',
    credits: 300,
    price: 25,
    currency: 'TL',
    bonus: 50,
    popular: true
  },
  {
    id: 'credits-1000',
    name: 'Mega',
    credits: 1000,
    price: 75,
    currency: 'TL',
    bonus: 200,
    popular: false
  },
  {
    id: 'credits-2500',
    name: 'Ultra',
    credits: 2500,
    price: 150,
    currency: 'TL',
    bonus: 500,
    popular: false
  }
]

function PricingCard({ plan, onSelect }: { plan: PricingPlan; onSelect: (planId: string) => void }) {
  return (
    <div className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${
      plan.recommended 
        ? 'border-blue-500 shadow-blue-100' 
        : 'border-gray-200 hover:border-blue-300'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-medium">
            En Popüler
          </span>
        </div>
      )}
      
      {plan.recommended && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <StarIcon className="w-3 h-3 mr-1" />
            Önerilen
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
          
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-gray-600 ml-1">₺/{plan.period}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 bg-blue-50 rounded-lg py-2 px-4">
            <GiftIcon className="w-4 h-4" />
            <span>{plan.credits} kredi dahil</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="text-sm font-medium text-gray-900 mb-2">Özellikler:</div>
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
          
          {plan.limitations.length > 0 && (
            <>
              <div className="text-sm font-medium text-gray-900 mb-2 mt-4">Sınırlamalar:</div>
              {plan.limitations.map((limitation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <XMarkIcon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{limitation}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <button
          onClick={() => onSelect(plan.id)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            plan.recommended
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : plan.price === 0
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
          }`}
        >
          {plan.price === 0 ? 'Ücretsiz Başla' : 'Planı Seç'}
        </button>
      </div>
    </div>
  )
}

function CreditPackageCard({ package: pkg, onPurchase }: { package: CreditPackage; onPurchase: (packageId: string) => void }) {
  const totalCredits = pkg.credits + pkg.bonus
  const savingsPercentage = pkg.bonus > 0 ? Math.round((pkg.bonus / pkg.credits) * 100) : 0

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${
      pkg.popular 
        ? 'border-purple-500 shadow-purple-100' 
        : 'border-gray-200 hover:border-purple-300'
    }`}>
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-medium">
            En Çok Tercih Edilen
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</h3>
          
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-900">{totalCredits}</span>
            <span className="text-gray-600 ml-1">kredi</span>
          </div>
          
          {pkg.bonus > 0 && (
            <div className="text-xs text-green-600 bg-green-50 rounded-lg py-1 px-2 mb-2 inline-block">
              +{pkg.bonus} bonus kredi (%{savingsPercentage} kazanç)
            </div>
          )}
          
          <div className="text-lg font-semibold text-blue-600">
            {pkg.price} ₺
          </div>
        </div>

        <div className="space-y-2 mb-6 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Ana krediler:</span>
            <span className="font-medium">{pkg.credits}</span>
          </div>
          {pkg.bonus > 0 && (
            <div className="flex items-center justify-between">
              <span>Bonus krediler:</span>
              <span className="font-medium text-green-600">+{pkg.bonus}</span>
            </div>
          )}
          <div className="border-t pt-2 flex items-center justify-between font-medium">
            <span>Toplam:</span>
            <span>{totalCredits} kredi</span>
          </div>
        </div>

        <button
          onClick={() => onPurchase(pkg.id)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            pkg.popular
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
          }`}
        >
          Satın Al
        </button>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [selectedTab, setSelectedTab] = useState<'plans' | 'credits'>('plans')
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadPricingData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load user credits if user is logged in
        if (user) {
          try {
            const userStatsResponse = await apiClient.getUserTokenStats()
            if (userStatsResponse.data && !userStatsResponse.error) {
              setUserCredits(userStatsResponse.data.credits || 0)
            } else {
              setUserCredits(user.credits || 0)
            }
          } catch (creditsError) {
            console.warn('Failed to load user credits, using fallback')
            setUserCredits(user.credits || 0)
          }
        }
        
        // Load pricing plans from public pricing API
        const plansResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/pricing/plans`)
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          const transformedPlans = plansData.plans.map((plan: any) => ({
            id: plan.name, // Use the backend plan name as the ID for API calls
            name: plan.display_name,
            description: plan.description,
            price: plan.price_monthly / 100, // Convert from cents to currency
            currency: 'TL',
            period: 'ay',
            credits: plan.included_credits,
            features: [
              `${plan.included_credits} kredi/ay`,
              `${plan.monthly_token_limit.toLocaleString()} token/ay`,
              `${plan.monthly_request_limit} istek/gün`,
              ...(plan.features.rag_access ? ['RAG gelişmiş yanıtlar'] : []),
              ...(plan.features.custom_characters ? ['Özel karakterler'] : []),
              ...(plan.features.priority_support ? ['Öncelikli destek'] : []),
              ...(plan.features.api_access ? ['API erişimi'] : []),
              ...(plan.features.advanced_analytics ? ['Gelişmiş analitik'] : [])
            ],
            limitations: plan.name === 'free' ? [
              'Sınırlı karakter erişimi',
              'Günlük sohbet limiti',
              'Temel destek'
            ] : [],
            recommended: plan.is_featured,
            popular: plan.name === 'premium'
          }))
          setPricingPlans(transformedPlans)
        } else {
          console.warn('Failed to load plans from API, using fallback data')
          setPricingPlans(fallbackPricingPlans)
        }
        
        // Load credit packages from public pricing API
        const creditsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/pricing/credits`)
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json()
          const transformedPackages = creditsData.packages.map((pkg: any) => ({
            id: pkg.id,
            name: pkg.display_name,
            credits: pkg.credit_amount,
            price: pkg.price / 100, // Convert from cents to currency
            currency: 'TL',
            bonus: pkg.bonus_credits,
            popular: pkg.is_popular
          }))
          setCreditPackages(transformedPackages)
        } else {
          console.warn('Failed to load credit packages from API, using fallback data')
          setCreditPackages(fallbackCreditPackages)
        }
        
      } catch (error) {
        console.error('Failed to load pricing data:', error)
        setError('Failed to load pricing information. Please try again.')
        // Fallback to the original hardcoded data
        setPricingPlans(fallbackPricingPlans)
        setCreditPackages(fallbackCreditPackages)
        if (user) {
          setUserCredits(user.credits || 0)
        }
      } finally {
        setLoading(false)
      }
    }

    loadPricingData()
  }, [user])

  const handlePlanSelect = async (planId: string) => {
    if (!user && planId !== 'free') {
      // Redirect to login for paid plans
      window.location.href = '/login?redirect=/pricing'
      return
    }
    
    if (planId === 'free') {
      // Handle free plan
      window.location.href = '/register'
    } else {
      try {
        // Find the plan details
        const selectedPlan = pricingPlans.find(plan => plan.id === planId)
        if (!selectedPlan) {
          alert('Plan not found!')
          return
        }

        // For now, show plan upgrade info since payment gateway isn't implemented
        const confirmed = confirm(
          `Upgrade to ${selectedPlan.name} plan?\n` +
          `Price: ${selectedPlan.price} TL/month\n` +
          `Features: ${selectedPlan.features.slice(0, 3).join(', ')}\n\n` +
          `Note: Payment gateway will be integrated soon.`
        )
        
        if (confirmed) {
          // Use the API to upgrade plan
          const response = await apiClient.upgradePlan(planId)
          
          if (response.data && !response.error) {
            alert(`Successfully upgraded to ${selectedPlan.name} plan!`)
            // Refresh user data or redirect to dashboard
            window.location.href = '/dashboard'
          } else {
            alert('Plan upgrade failed: ' + (response.error || 'Unknown error'))
          }
        }
      } catch (error) {
        console.error('Plan selection error:', error)
        alert('Plan upgrade failed. Please try again.')
      }
    }
  }

  const handleCreditPurchase = async (packageId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?redirect=/pricing'
      return
    }
    
    try {
      // Find the package details
      const selectedPackage = creditPackages.find(pkg => pkg.id === packageId)
      if (!selectedPackage) {
        alert('Package not found!')
        return
      }

      // For now, show payment info since payment gateway isn't implemented
      const confirmed = confirm(
        `Purchase ${selectedPackage.name}?\n` +
        `Credits: ${selectedPackage.credits + selectedPackage.bonus}\n` +
        `Price: ${selectedPackage.price} TL\n\n` +
        `Note: Payment gateway will be integrated soon.`
      )
      
      if (confirmed) {
        // TODO: Integrate with real payment system
        // For now, we'll use the API to simulate purchase
        const response = await apiClient.purchaseCredits(packageId, selectedPackage.credits + selectedPackage.bonus)
        
        if (response.data && !response.error) {
          alert(`Successfully purchased ${selectedPackage.credits + selectedPackage.bonus} credits!`)
          // Refresh user data or redirect to dashboard
          window.location.href = '/dashboard'
        } else {
          alert('Purchase failed: ' + (response.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Credit purchase error:', error)
      alert('Purchase failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Fiyatlandırma
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              İhtiyacınıza en uygun planı seçin ve tarihi figürlerle sınırsız sohbet edin. 
              Kredi sistemi ile kullandığınız kadar ödeyin.
            </p>
            
            {/* Current User Credits */}
            {user && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-md mx-auto mb-8">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <CreditCardIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Mevcut kredileriniz:</span>
                  <span className="font-bold text-blue-600">{userCredits} kredi</span>
                </div>
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto mb-8">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setSelectedTab('plans')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'plans'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Aylık Planlar
            </button>
            <button
              onClick={() => setSelectedTab('credits')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'credits'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kredi Paketleri
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        {selectedTab === 'plans' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Aylık Abonelik Planları</h2>
              <p className="text-gray-600">
                Her ay otomatik olarak kredi yüklemesi yapılır. İstediğiniz zaman iptal edebilirsiniz.
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingPlans.map((plan) => (
                  <PricingCard 
                    key={plan.id} 
                    plan={plan} 
                    onSelect={handlePlanSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Credit Packages */}
        {selectedTab === 'credits' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kredi Paketleri</h2>
              <p className="text-gray-600">
                Tek seferlik kredi satın alın. Krediler asla geçerliliğini yitirmez.
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {creditPackages.map((pkg) => (
                  <CreditPackageCard 
                    key={pkg.id} 
                    package={pkg} 
                    onPurchase={handleCreditPurchase}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Credit Usage Info */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Krediler Nasıl Kullanılır?</h3>
            <p className="text-gray-600">
              Her sohbet mesajı için harcanan kredi miktarı, mesajın uzunluğuna ve karmaşıklığına göre değişir.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Kısa Mesajlar</h4>
              <p className="text-sm text-gray-600">1-2 kredi</p>
              <p className="text-xs text-gray-500 mt-1">Basit sorular ve kısa yanıtlar</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Orta Mesajlar</h4>
              <p className="text-sm text-gray-600">3-5 kredi</p>
              <p className="text-xs text-gray-500 mt-1">Detaylı sorular ve açıklamalar</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Uzun Mesajlar</h4>
              <p className="text-sm text-gray-600">6-10 kredi</p>
              <p className="text-xs text-gray-500 mt-1">Karmaşık analiz ve uzun yanıtlar</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Sıkça Sorulan Sorular</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Krediler geçerliliğini yitirir mi?</h4>
              <p className="text-gray-600 text-sm">Hayır, satın aldığınız krediler asla geçerliliğini yitirmez. İstediğiniz zaman kullanabilirsiniz.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Planımı değiştirebilir miyim?</h4>
              <p className="text-gray-600 text-sm">Evet, istediğiniz zaman planınızı yükseltebilir veya iptal edebilirsiniz.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Ödeme güvenli mi?</h4>
              <p className="text-gray-600 text-sm">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                Tüm ödemeler SSL ile şifrelenir ve güvenli ödeme sağlayıcıları kullanılır.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Ücretsiz plan limitleri?</h4>
              <p className="text-gray-600 text-sm">Ücretsiz planda ayda 100 kredi ve 3 karakterle sohbet edebilirsiniz.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Hala karar veremediniz mi?
          </h3>
          <p className="text-gray-600 mb-8">
            Ücretsiz planla başlayın ve Histora deneyimini yaşayın!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ücretsiz Başla
            <SparklesIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}