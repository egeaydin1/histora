'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Mock password reset request - you can implement real API call later
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      setIsEmailSent(true)
    } catch (error) {
      setError('Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock resend email - you can implement real API call later
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate success - in real implementation, you might want to show a toast message
      console.log('Email resent successfully')
    } catch (error) {
      setError('E-posta tekrar gönderilemedi. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">E-posta Gönderildi!</h2>
            <p className="text-gray-600 mb-6">
              Şifre sıfırlama talimatları <strong>{email}</strong> adresine gönderildi. 
              E-posta kutunuzu kontrol edin.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Mail className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">E-postayı bulamıyor musunuz?</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Spam/gereksiz e-posta klasörünüzü kontrol edin</li>
                    <li>E-posta adresinizi doğru yazdığınızdan emin olun</li>
                    <li>Birkaç dakika bekleyip tekrar kontrol edin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="-ml-1 mr-2 h-4 w-4" />
                  E-postayı Tekrar Gönder
                </>
              )}
            </button>

            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-3">
              <Sparkles className="h-12 w-12 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Histora</h1>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Şifrenizi mi unuttunuz?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-posta adresi
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresinizi girin"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !email}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="-ml-1 mr-2 h-4 w-4" />
                  Şifre Sıfırlama E-postası Gönder
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Giriş sayfasına geri dön</span>
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Hesapları:</h3>
          <div className="text-xs text-gray-700 space-y-1">
            <div><strong>Admin:</strong> admin@histora.com / histora2025!</div>
            <div><strong>Demo:</strong> demo@histora.com / demo123</div>
          </div>
        </div>
      </div>
    </div>
  )
}
