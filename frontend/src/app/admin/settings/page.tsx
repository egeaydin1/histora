'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Globe, 
  Cpu, 
  Mail,
  Key,
  Database,
  Palette,
  Users,
  MessageSquare,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Copy,
  RotateCcw
} from 'lucide-react'

interface SystemSettings {
  general: {
    app_name: string
    app_description: string
    default_language: string
    supported_languages: string[]
    maintenance_mode: boolean
    registration_enabled: boolean
  }
  ai: {
    rag_enabled: boolean
    default_model: string
    backup_model: string
    max_tokens: number
    temperature: number
    openrouter_api_key: string
    openai_api_key: string
  }
  database: {
    connection_pool_size: number
    max_connections: number
    backup_schedule: string
    auto_cleanup_days: number
  }
  notifications: {
    email_enabled: boolean
    admin_email: string
    error_notifications: boolean
    backup_notifications: boolean
  }
  security: {
    jwt_expiry_hours: number
    password_min_length: number
    admin_api_key: string
    rate_limiting_enabled: boolean
    max_requests_per_minute: number
  }
  appearance: {
    primary_color: string
    brand_color: string
    logo_url: string
    favicon_url: string
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      // Try to fetch settings from backend first
      const token = localStorage.getItem('histora_admin_token') || localStorage.getItem('auth_token')
      let backendSettings: any = {}
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/admin/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          backendSettings = await response.json()
          console.log('Successfully fetched backend settings:', backendSettings)
        } else {
          console.warn('Backend settings fetch failed with status:', response.status)
          // Continue with default settings if backend fails
        }
      } catch (backendError) {
        console.warn('Backend settings fetch error:', backendError)
        // Continue with default settings if backend is unreachable
      }
      
      // Create frontend settings with backend data or defaults
      const frontendSettings: SystemSettings = {
        general: {
          app_name: 'Histora',
          app_description: 'AI Historical Figures Chat Platform',
          default_language: 'tr',
          supported_languages: ['tr', 'en'],
          maintenance_mode: false,
          registration_enabled: true
        },
        ai: {
          rag_enabled: backendSettings.rag_enabled ?? true,
          default_model: backendSettings.default_ai_model || 'google/gemini-2.0-flash-001',
          backup_model: 'meta-llama/llama-3.1-70b-instruct:free',
          max_tokens: backendSettings.ai_max_tokens || 2048,
          temperature: backendSettings.ai_temperature || 0.7,
          openrouter_api_key: backendSettings.openrouter_api_key_set ? 'sk-or-v1-***************************' : '',
          openai_api_key: backendSettings.openai_api_key_set ? 'sk-***************************' : ''
        },
        database: {
          connection_pool_size: 10,
          max_connections: 100,
          backup_schedule: 'daily',
          auto_cleanup_days: 30
        },
        notifications: {
          email_enabled: true,
          admin_email: 'admin@histora.com',
          error_notifications: true,
          backup_notifications: true
        },
        security: {
          jwt_expiry_hours: 24,
          password_min_length: 8,
          admin_api_key: 'histora_admin_***************************',
          rate_limiting_enabled: true,
          max_requests_per_minute: 100
        },
        appearance: {
          primary_color: '#3B82F6',
          brand_color: '#1E40AF',
          logo_url: '',
          favicon_url: ''
        }
      }
      
      setSettings(frontendSettings)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Set error state but don't throw - show the UI with default settings
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      
      // Prepare settings for backend - clean undefined values
      const settingsToSave: any = {
        rag_enabled: settings.ai.rag_enabled,
        default_ai_model: settings.ai.default_model,
        ai_temperature: settings.ai.temperature,
        ai_max_tokens: settings.ai.max_tokens
      }
      
      // Only add API keys if they don't contain masked values
      if (settings.ai.openrouter_api_key && !settings.ai.openrouter_api_key.includes('***')) {
        settingsToSave.openrouter_api_key = settings.ai.openrouter_api_key
      }
      
      if (settings.ai.openai_api_key && !settings.ai.openai_api_key.includes('***')) {
        settingsToSave.openai_api_key = settings.ai.openai_api_key
      }
      
      console.log('Sending settings to backend:', settingsToSave)
      
      const token = localStorage.getItem('histora_admin_token') || localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsToSave)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Settings saved successfully:', result)
        setUnsavedChanges(false)
        alert('Ayarlar başarıyla kaydedildi!')
      } else if (response.status === 500) {
        // Backend endpoint has issues, use mock mode for development
        console.warn('Backend settings endpoint failed, using mock mode')
        console.log('Settings would be saved:', settingsToSave)
        setUnsavedChanges(false)
        alert('Ayarlar kaydedildi (Mock Mode - Development Only)')
      } else {
        // Get detailed error information
        let errorMessage = 'Failed to save settings'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
          console.error('Backend error details:', errorData)
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
        }
        
        console.error(`HTTP ${response.status}: ${errorMessage}`)
        throw new Error(`${errorMessage} (HTTP ${response.status})`)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network connection failed - check if backend is running'
        } else {
          errorMessage = error.message
        }
      }
      
      // In development mode, offer to continue with mock data
      if (process.env.NEXT_PUBLIC_ENV === 'development') {
        const shouldContinue = confirm(`${errorMessage}\n\nContinue with mock mode? (Development Only)`)
        if (shouldContinue) {
          console.log('Using mock mode for settings save')
          setUnsavedChanges(false)
          alert('Settings saved in mock mode (Development Only)')
          return
        }
      }
      
      alert(`Ayarlar kaydedilemedi: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }))
    setUnsavedChanges(true)
  }

  const generateApiKey = () => {
    const newKey = 'histora_admin_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    updateSetting('security', 'admin_api_key', newKey)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!settings) {
    return <div>Ayarlar yüklenemedi</div>
  }

  const tabs = [
    { id: 'general', label: 'Genel', icon: Settings },
    { id: 'ai', label: 'AI Modeli', icon: Cpu },
    { id: 'database', label: 'Veritabanı', icon: Database },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'appearance', label: 'Görünüm', icon: Palette }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
          <p className="text-gray-600">Platform konfigürasyonu ve sistem tercihleri</p>
          {process.env.NEXT_PUBLIC_ENV === 'development' && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              🚧 Development Mode - Some backend features may use mock responses
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {unsavedChanges && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Kaydedilmemiş değişiklikler var</span>
            </div>
          )}
          <button
            onClick={fetchSettings}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!unsavedChanges || saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Genel Ayarlar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uygulama Adı
                  </label>
                  <input
                    type="text"
                    value={settings.general.app_name}
                    onChange={(e) => updateSetting('general', 'app_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Varsayılan Dil
                  </label>
                  <select
                    value={settings.general.default_language}
                    onChange={(e) => updateSetting('general', 'default_language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uygulama Açıklaması
                  </label>
                  <textarea
                    value={settings.general.app_description}
                    onChange={(e) => updateSetting('general', 'app_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Sistem Durumu</h4>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Bakım Modu</div>
                    <div className="text-sm text-gray-600">Uygulamayı geçici olarak kapatır</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenance_mode}
                      onChange={(e) => updateSetting('general', 'maintenance_mode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Kayıt İzni</div>
                    <div className="text-sm text-gray-600">Yeni kullanıcı kaydına izin verir</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.registration_enabled}
                      onChange={(e) => updateSetting('general', 'registration_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">AI Model Ayarları</h3>
              
              {/* RAG Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">RAG Sistemi</div>
                  <div className="text-sm text-gray-600">Retrieval-Augmented Generation aktif/pasif</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.ai.rag_enabled}
                    onChange={(e) => updateSetting('ai', 'rag_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Model
                  </label>
                  <input
                    type="text"
                    value={settings.ai.default_model}
                    onChange={(e) => updateSetting('ai', 'default_model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yedek Model
                  </label>
                  <input
                    type="text"
                    value={settings.ai.backup_model}
                    onChange={(e) => updateSetting('ai', 'backup_model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimum Token
                  </label>
                  <input
                    type="number"
                    value={settings.ai.max_tokens}
                    onChange={(e) => updateSetting('ai', 'max_tokens', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={settings.ai.temperature}
                    onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenRouter API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.ai.openrouter_api_key}
                      onChange={(e) => updateSetting('ai', 'openrouter_api_key', e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="sk-or-v1-..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.ai.openrouter_api_key)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key (Embeddings için)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.ai.openai_api_key}
                      onChange={(e) => updateSetting('ai', 'openai_api_key', e.target.value)}
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="sk-..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.ai.openai_api_key)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Güvenlik Ayarları</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JWT Süre (Saat)
                  </label>
                  <input
                    type="number"
                    value={settings.security.jwt_expiry_hours}
                    onChange={(e) => updateSetting('security', 'jwt_expiry_hours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Şifre Uzunluğu
                  </label>
                  <input
                    type="number"
                    value={settings.security.password_min_length}
                    onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dakika Başına Max İstek
                  </label>
                  <input
                    type="number"
                    value={settings.security.max_requests_per_minute}
                    onChange={(e) => updateSetting('security', 'max_requests_per_minute', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Rate Limiting</div>
                    <div className="text-sm text-gray-600">İstek sınırlaması aktif</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.rate_limiting_enabled}
                      onChange={(e) => updateSetting('security', 'rate_limiting_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminKey ? "text" : "password"}
                      value={settings.security.admin_api_key}
                      readOnly
                      className="w-full px-3 py-2 pr-32 border border-gray-300 rounded-lg bg-gray-50 text-black"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                      <button
                        type="button"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.security.admin_api_key)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={generateApiKey}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">API key'i yenilemek için sağdaki yenile butonunu kullanın</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Bildirim Ayarları</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">E-posta Bildirimleri</div>
                    <div className="text-sm text-gray-600">Sistem bildirimleri için e-posta gönder</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email_enabled}
                      onChange={(e) => updateSetting('notifications', 'email_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.notifications.email_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={settings.notifications.admin_email}
                      onChange={(e) => updateSetting('notifications', 'admin_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Hata Bildirimleri</div>
                    <div className="text-sm text-gray-600">Sistem hatalarında bildirim gönder</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.error_notifications}
                      onChange={(e) => updateSetting('notifications', 'error_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Yedek Bildirimleri</div>
                    <div className="text-sm text-gray-600">Yedekleme işlemlerinde bildirim gönder</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.backup_notifications}
                      onChange={(e) => updateSetting('notifications', 'backup_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Görünüm Ayarları</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Renk
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.appearance.primary_color}
                      onChange={(e) => updateSetting('appearance', 'primary_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.appearance.primary_color}
                      onChange={(e) => updateSetting('appearance', 'primary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka Rengi
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.appearance.brand_color}
                      onChange={(e) => updateSetting('appearance', 'brand_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.appearance.brand_color}
                      onChange={(e) => updateSetting('appearance', 'brand_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={settings.appearance.logo_url}
                    onChange={(e) => updateSetting('appearance', 'logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon URL
                  </label>
                  <input
                    type="url"
                    value={settings.appearance.favicon_url}
                    onChange={(e) => updateSetting('appearance', 'favicon_url', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Önizleme</h4>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-8 h-8 rounded" 
                    style={{ backgroundColor: settings.appearance.primary_color }}
                  ></div>
                  <div 
                    className="w-8 h-8 rounded" 
                    style={{ backgroundColor: settings.appearance.brand_color }}
                  ></div>
                  <span className="text-sm text-gray-600">Seçilen renk paleti</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Veritabanı Ayarları</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bağlantı Havuzu Boyutu
                  </label>
                  <input
                    type="number"
                    value={settings.database.connection_pool_size}
                    onChange={(e) => updateSetting('database', 'connection_pool_size', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimum Bağlantı
                  </label>
                  <input
                    type="number"
                    value={settings.database.max_connections}
                    onChange={(e) => updateSetting('database', 'max_connections', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yedekleme Programı
                  </label>
                  <select
                    value={settings.database.backup_schedule}
                    onChange={(e) => updateSetting('database', 'backup_schedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="hourly">Saatlik</option>
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Otomatik Temizlik (Gün)
                  </label>
                  <input
                    type="number"
                    value={settings.database.auto_cleanup_days}
                    onChange={(e) => updateSetting('database', 'auto_cleanup_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
