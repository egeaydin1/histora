'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
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
  avatar_url: '/avatars/ataturk.jpg',
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
        // For now, use mock data
        // const response = await apiClient.getCharacter(characterId)
        // if (response.data) {
        //   setCharacter(response.data)
        // }
        
        // Mock different characters
        if (characterId === 'mevlana-001') {
          setCharacter({
            ...mockCharacter,
            id: 'mevlana-001',
            name: 'Mevlana Celaleddin Rumi',
            name_tr: 'Mevlana Celaleddin Rumi',
            era: '13th Century',
            short_bio_tr: 'Büyük mutasavvıf, şair ve filozof'
          })
          setMessages([{
            id: generateId(),
            role: 'assistant',
            content: 'Selam aleykum, kardeşim. Ben Mevlana Celaleddin Rumi. Aşk, hoşgörü ve maneviyat üzerine sohbet edebiliriz. Kalbinizde ne var?',
            timestamp: new Date().toISOString()
          }])
        } else if (characterId === 'konfucyus-001') {
          setCharacter({
            ...mockCharacter,
            id: 'konfucyus-001',
            name: 'Konfüçyüs',
            name_tr: 'Konfüçyüs',
            era: 'Spring and Autumn Period',
            short_bio_tr: 'Çin filozofu ve öğretmen'
          })
          setMessages([{
            id: generateId(),
            role: 'assistant',
            content: 'Merhaba! Ben Konfüçyüs. Bilgelik, ahlak, eğitim ve toplumsal düzen üzerine konuşabiliriz. Size nasıl yardımcı olabilirim?',
            timestamp: new Date().toISOString()
          }])
        }
      } catch (error) {
        console.error('Failed to load character:', error)
        setError('Karakter yüklenemedi')
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
      // Real API call to backend
      const response = await fetch('http://localhost:8000/api/v1/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character_id: character.id,
          message: content,
          session_id: sessionId,
          language: 'tr',
          mode: 'chat'
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
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
      setError('Mesaj gönderilemedi. Backend bağlantısını kontrol edin.')
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

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Karakter bulunamadı</h2>
          <p className="text-gray-600">Bu karakter mevcut değil veya yüklenemedi.</p>
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
