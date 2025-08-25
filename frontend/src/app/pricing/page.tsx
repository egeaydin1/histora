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

const pricingPlans: PricingPlan[] = [
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

const creditPackages: CreditPackage[] = [
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
  const { user } = useAuth()

  const handlePlanSelect = (planId: string) => {
    if (!user && planId !== 'free') {
      // Redirect to login for paid plans
      window.location.href = '/login?redirect=/pricing'
      return
    }
    
    if (planId === 'free') {
      // Handle free plan
      window.location.href = '/register'
    } else {
      // Handle paid plan selection
      console.log('Selected plan:', planId)
      // TODO: Integrate with payment system
      alert('Ödeme sistemi yakında aktif olacak!')
    }
  }

  const handleCreditPurchase = (packageId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?redirect=/pricing'
      return
    }
    
    console.log('Purchasing credits:', packageId)
    // TODO: Integrate with payment system
    alert('Ödeme sistemi yakında aktif olacak!')
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
                  <span className="font-bold text-blue-600">{user.credits || 0} kredi</span>
                </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <PricingCard 
                  key={plan.id} 
                  plan={plan} 
                  onSelect={handlePlanSelect}
                />
              ))}
            </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {creditPackages.map((pkg) => (
                <CreditPackageCard 
                  key={pkg.id} 
                  package={pkg} 
                  onPurchase={handleCreditPurchase}
                />
              ))}
            </div>
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