'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  HeartIcon,
  UsersIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface TeamMember {
  name: string
  role: string
  description: string
  avatar: string
}

interface Feature {
  icon: React.ComponentType<any>
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Gerçekçi Sohbetler',
    description: 'İleri AI teknolojisi ile tarihi figürlerin gerçek kişiliklerini yansıtan doğal sohbetler yapın.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Eğitici İçerik',
    description: 'Her sohbet bir öğrenme deneyimi. Tarih, felsefe ve bilim alanlarında derinlemesine bilgi edinin.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Kültürel Zenginlik',
    description: 'Farklı kültürlerden tarihi figürlerle tanışın ve çeşitli bakış açıları kazanın.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Güvenli Platform',
    description: 'Verileriniz güvende. Tüm sohbetler şifrelenir ve gizliliğiniz korunur.'
  },
  {
    icon: LightBulbIcon,
    title: 'Sürekli Gelişim',
    description: 'AI modellerimizi sürekli geliştiriyor, yeni karakterler ve özellikler ekliyoruz.'
  },
  {
    icon: HeartIcon,
    title: 'Kullanıcı Odaklı',
    description: 'Kullanıcı geri bildirimlerini dinliyor ve platforumu ihtiyaçlarınıza göre şekillendiriyoruz.'
  }
]

const teamMembers: TeamMember[] = [
  {
    name: 'Dr. Ahmet Yılmaz',
    role: 'Kurucu & CEO',
    description: 'Tarih doçenti ve AI araştırmacısı. Histora vizyonunu hayata geçirmeye kararlı.',
    avatar: 'AY'
  },
  {
    name: 'Elif Demir',
    role: 'CTO',
    description: 'Machine Learning uzmanı. Karakterlerin gerçekçi kişiliklerini geliştiriyor.',
    avatar: 'ED'
  },
  {
    name: 'Prof. Mehmet Kaya',
    role: 'Tarih Danışmanı',
    description: 'Tarih profesörü. Karakterlerin tarihsel doğruluğunu sağlıyor.',
    avatar: 'MK'
  },
  {
    name: 'Zeynep Özkan',
    role: 'UI/UX Tasarımcısı',
    description: 'Kullanıcı deneyimi uzmanı. Platformun kullanım kolaylığını optimize ediyor.',
    avatar: 'ZÖ'
  }
]

export default function HakkindaPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('sending')
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('sent')
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setSubmitStatus('idle'), 3000)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Hakkımızda
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Histora, tarihin büyük zihinleriyle modern teknoloji arasında köprü kuran 
              yenilikçi bir platformdur. Amacımız, geçmişin bilgeliğini geleceğe taşımak.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <SparklesIcon className="w-6 h-6" />
              <span className="text-lg font-semibold">İnsanlığın mirasını canlı hale getiriyoruz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Misyonumuz</h2>
              <p className="text-lg text-gray-600 mb-6">
                Tarihin en büyük düşünürlerinin, liderlerinin ve bilge insanlarının 
                bilgisini ve deneyimini modern dünyada erişilebilir kılmak istiyoruz.
              </p>
              <p className="text-gray-600 mb-6">
                Yapay zeka teknolojisini kullanarak, bu eşsiz kişilikleri dijital 
                dünyada yeniden canlandırıyor ve onlarla gerçekçi sohbetler yapmanızı 
                sağlıyoruz. Her karakter, kendi döneminin bilgisi, kişiliği ve 
                konuşma tarzıyla size rehberlik eder.
              </p>
              <div className="flex items-center space-x-4">
                <Link
                  href="/karakterler"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Karakterleri Keşfet
                </Link>
                <Link
                  href="/pricing"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Fiyatlandırma →
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
                  <div className="text-sm text-gray-600">Tarihi Karakter</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                  <div className="text-sm text-gray-600">Aktif Kullanıcı</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                  <div className="text-sm text-gray-600">Mesaj Sayısı</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
                  <div className="text-sm text-gray-600">Memnuniyet</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden Histora?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Histora'yı özel kılan özellikleri keşfedin ve tarihle nasıl yeni bir bağ 
              kurabileceğinizi görün.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ekibimiz</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Histora'yı hayata geçiren tutkulu ve deneyimli ekibimizle tanışın.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Teknoloji Altyapımız</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Google Gemini 2.0 Flash AI Model</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Next.js 14 & React 18</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">PostgreSQL Veritabanı</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">FastAPI Backend</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Firebase Authentication</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">SSL Şifreleme</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Güçlü Teknoloji</h2>
              <p className="text-lg text-gray-600 mb-6">
                En son AI teknolojilerini kullanarak, tarihi karakterlerin kişiliklerini 
                ve bilgilerini mümkün olduğunca gerçekçi şekilde modellemekteyiz.
              </p>
              <p className="text-gray-600 mb-6">
                Sistemimiz sürekli öğreniyor ve gelişiyor. Her sohbet, karakterlerimizi 
                daha da gerçekçi hale getiriyor ve kullanıcı deneyimini iyileştiriyor.
              </p>
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span className="font-medium">%99.9 Uptime Garantisi</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Güvenilir altyapımızla kesintisiz hizmet sunuyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">İletişime Geçin</h2>
              <p className="text-lg text-gray-600 mb-8">
                Sorularınız, önerileriniz veya işbirliği teklifleriniz için 
                bizimle iletişime geçmekten çekinmeyin.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">info@histora.ai</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">+90 (212) 555-0123</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">İstanbul, Türkiye</span>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sosyal Medya</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-blue-600 hover:text-blue-700">Twitter</a>
                  <a href="#" className="text-blue-600 hover:text-blue-700">LinkedIn</a>
                  <a href="#" className="text-blue-600 hover:text-blue-700">Instagram</a>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Mesaj Gönderin</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İsim
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mesaj
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitStatus === 'sending'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    submitStatus === 'sent'
                      ? 'bg-green-600 text-white'
                      : submitStatus === 'sending'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitStatus === 'sending' && 'Gönderiliyor...'}
                  {submitStatus === 'sent' && '✓ Gönderildi'}
                  {submitStatus === 'idle' && 'Mesaj Gönder'}
                  {submitStatus === 'error' && 'Tekrar Dene'}
                </button>
                
                {submitStatus === 'sent' && (
                  <p className="text-green-600 text-sm text-center">
                    Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Tarihle Tanışmaya Hazır mısınız?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Atatürk, Mevlana, Konfüçyüs ve daha fazlasıyla sohbet etmeye bugün başlayın. 
            Geçmişin bilgeliği sizi bekliyor.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              <UsersIcon className="w-5 h-5 mr-2" />
              Ücretsiz Başla
            </Link>
            <Link
              href="/karakterler"
              className="border border-white text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Karakterleri Gör
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}