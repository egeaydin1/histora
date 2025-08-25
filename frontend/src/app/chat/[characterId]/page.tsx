'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { renderError } from '@/utils/errorHandler'
import { apiClient } from '@/lib/api'
import { Character, ChatMessage, ChatResponse } from '@/types'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { generateId } from '@/lib/utils'

// Mock character data for development
const mockCharacter: Character = {
  id: 'ataturk-001',
  name: 'Mustafa Kemal Atatürk',
  name_tr: 'Mustafa Kemal Atatürk',
  name_en: 'Mustafa Kemal Atatürk',
  category: 'leaders',
  era: 'Modern Turkey',
  birth_year: 1881,
  death_year: 1938,
  birth_place: 'Selanik',
  short_bio_tr: 'Türkiye Cumhuriyeti\'nin kurucusu ve ilk Cumhurbaşkanı',
  short_bio_en: 'Founder and first President of the Republic of Turkey',
  personality_traits: ['visionary', 'determined', 'modern', 'strategic'],
  avatar_url: '/avatars/ataturk.svg',
  status: 'published',
  is_featured: true,
  view_count: 1250
}

// Mock initial message
const initialMessage: ChatMessage = {
  id: generateId(),
  role: 'assistant',
  content: 'Merhaba! Ben Mustafa Kemal Atatürk. Size nasıl yardımcı olabilirim? Türkiye Cumhuriyeti\'nin kuruluşu, reformlar, veya liderlik hakkında konuşabiliriz.',
  timestamp: new Date().toISOString()
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [character, setCharacter] = useState<Character | null>(mockCharacter)
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const characterId = params.characterId as string

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load character data
  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) return

      try {
        // Decode the character ID in case it's URL encoded
        const decodedCharacterId = decodeURIComponent(characterId)
        console.log('Loading character:', decodedCharacterId)
        
        const response = await apiClient.getCharacter(decodedCharacterId, 'tr')
        
        if (response.error) {
          // Enhanced error handling with detailed information
          const isNetworkError = response.error.includes('timeout') || 
                                response.error.includes('Connection refused') ||
                                response.error.includes('Network Error')
          
          if (isNetworkError) {
            console.warn('Network error detected, character may be loaded from cache/mock data')
            
            // If we have mock data, the error might be harmless
            if (response.data) {
              console.log('Using fallback character data due to network issues')
              setCharacter(response.data)
              setMessages([{
                id: generateId(),
                role: 'assistant',
                content: `Merhaba! Ben ${response.data.name}. ${response.data.short_bio_tr || 'Size nasıl yardımcı olabilirim?'} 

⚠️ Not: Şu anda mock verilerle çalışıyorum, backend bağlantısı yok.`,
                timestamp: new Date().toISOString()
              }])
              return
            }
          }
          
          throw new Error(response.error)
        }
        
        if (!response.data) {
          throw new Error('Character not found')
        }
        
        const data = response.data
        
        // Set character data
        setCharacter(data)
        
        // Set initial greeting message
        setMessages([{
          id: generateId(),
          role: 'assistant',
          content: `Merhaba! Ben ${data.name}. ${data.short_bio_tr || 'Size nasıl yardımcı olabilirim?'}`,
          timestamp: new Date().toISOString()
        }])
        
      } catch (error) {
        console.error('Failed to load character:', error)
        const errorMessage = error instanceof Error ? error.message : 'Character could not be loaded'
        
        // Enhanced error information
        const isNetworkError = errorMessage.includes('timeout') || 
                              errorMessage.includes('Connection refused') ||
                              errorMessage.includes('ECONNABORTED')
        
        if (isNetworkError) {
          setError(`Bağlantı Hatası: Backend sunucusuna ulaşılamıyor. Lütfen backend'in çalıştığını kontrol edin (http://localhost:8000). Hata: ${errorMessage}`)
        } else {
          setError(errorMessage)
        }
        
        // Log available characters for debugging
        console.log('Available characters:')
        apiClient.getCharacters().then(resp => {
          if (resp.data) {
            const available = resp.data.map(c => ({ id: c.id, name: c.name }))
            console.log(available)
            
            // Suggest similar character IDs
            const normalized = characterId ? decodeURIComponent(characterId).toLowerCase() : ''
            const suggestions = available.filter(c => 
              c.id.toLowerCase().includes(normalized) || 
              normalized.includes(c.id.toLowerCase())
            )
            
            if (suggestions.length > 0) {
              console.log('Suggested characters:', suggestions)
            }
          }
        })
      }
    }

    loadCharacter()
  }, [characterId])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSendMessage = async (content: string) => {
    if (!character || !user) return

    setLoading(true)
    setError('')

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await apiClient.sendMessage({
        character_id: character.id,
        message: content,
        session_id: sessionId || undefined,
        language: 'tr',
        mode: 'chat'
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (!response.data) {
        throw new Error('No response from server')
      }
      
      const data = response.data
      
      // Set session ID if we didn't have one
      if (!sessionId) {
        setSessionId(data.session_id)
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)

    } catch (error) {
      console.error('Failed to send message:', error)
      setError(renderError(error))
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    const isNetworkError = error.includes('Bağlantı Hatası') || 
                          error.includes('timeout') || 
                          error.includes('Connection refused')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isNetworkError ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {isNetworkError ? (
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNetworkError ? 'Bağlantı Sorunu' : 'Karakter Bulunamadı'}
          </h2>
          
          <p className="text-gray-600 mb-4">{error}</p>
          
          {isNetworkError && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">🔧 Geliştirici Rehberi:</h3>
              <div className="text-sm text-blue-800 text-left space-y-1">
                <div>• Backend'in çalıştığını kontrol edin: <code className="bg-blue-100 px-1 rounded">http://localhost:8000</code></div>
                <div>• Docker container'ı başlatın: <code className="bg-blue-100 px-1 rounded">docker-compose up</code></div>
                <div>• Backend log'larını kontrol edin</div>
                <div>• API_URL environment variable'ını doğrulayın</div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Mevcut Karakterler:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• <code>ataturk-001</code> - Mustafa Kemal Atatürk</div>
              <div>• <code>mevlana-001</code> - Mevlana Celaleddin Rumi</div>
              <div>• <code>konfucyus-001</code> - Konfüçyüs</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sayfayı Yenile
            </button>
            {isNetworkError && (
              <button
                onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                className="w-full bg-green-200 text-green-700 px-4 py-2 rounded-md hover:bg-green-300 transition-colors"
              >
                Backend API Docs'ı Aç
              </button>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <p><strong>Karakter ID:</strong> <code>{characterId}</code></p>
            <p><strong>API URL:</strong> <code>{process.env.NEXT_PUBLIC_API_URL}</code></p>
            <p><strong>Geliştirme Modu:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Karakter yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <ChatHeader character={character} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto">
          {/* Welcome message */}
          <div className="text-center mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              {character.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{character.name}</h2>
            <p className="text-gray-600 mb-4">{character.short_bio_tr}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {character.personality_traits.slice(0, 4).map((trait) => (
                <span key={trait} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Chat messages */}
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isUser={message.role === 'user'}
            />
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={loading}
            placeholder={`${character.name} ile konuşun...`}
          />
        </div>
      </div>
    </div>
  )
}
