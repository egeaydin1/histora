'use client'

import { useState } from 'react'
import { Upload, User, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import seedCharacters from '../../data/seed-characters.json'

interface SeedCharacterData {
  id: string
  name: string
  title: string
  birth_year: number
  death_year: number | null
  nationality: string
  category: string
  description: string
  personality_traits: string[]
  speaking_style: string
  system_prompt: string
  knowledge_context: string
  supported_languages: string[]
  is_published: boolean
}

interface CreationStatus {
  characterId: string
  status: 'pending' | 'success' | 'error'
  message?: string
}

export default function SeedCharactersComponent() {
  const [creating, setCreating] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<CreationStatus[]>([])
  const [showDetails, setShowDetails] = useState(false)

  const handleTestConnection = async () => {
    setTesting(true)
    setConnectionStatus(null)

    const token = localStorage.getItem('histora_admin_token') || localStorage.getItem('auth_token')
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'

    try {
      console.log('Testing connection to:', `${API_BASE_URL}/api/${API_VERSION}/admin/stats`)
      
      const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Test response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus(`✅ Connection successful! Found ${data.characters?.total || 0} characters in database.`)
      } else {
        const errorText = await response.text()
        console.error('Test connection failed:', errorText)
        setConnectionStatus(`❌ Connection failed: HTTP ${response.status} - ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Test connection error:', error)
      setConnectionStatus(`❌ Connection error: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  const handleCreateCharacters = async () => {
    setCreating(true)
    setStatuses([])

    const token = localStorage.getItem('histora_admin_token') || localStorage.getItem('auth_token')
    if (!token) {
      const errorMsg = 'Admin authentication required. Please login to admin panel first.'
      alert(errorMsg)
      console.error(errorMsg)
      setCreating(false)
      return
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
    
    console.log('API Configuration:')
    console.log('- API_BASE_URL:', API_BASE_URL)
    console.log('- API_VERSION:', API_VERSION)
    console.log('- Full URL:', `${API_BASE_URL}/api/${API_VERSION}/admin/characters`)
    console.log('- Token available:', !!token)
    console.log('- Token preview:', token ? `${token.substring(0, 20)}...` : 'No token')

    for (const characterData of seedCharacters as SeedCharacterData[]) {
      console.log(`🔄 Creating character: ${characterData.name}`)
      
      // Update status to pending
      setStatuses(prev => [...prev, {
        characterId: characterData.id,
        status: 'pending'
      }])

      try {
        // Prepare character data for API
        const apiCharacterData = {
          id: characterData.id,
          name: characterData.name,
          title: characterData.title,
          birth_year: characterData.birth_year,
          death_year: characterData.death_year,
          nationality: characterData.nationality,
          category: characterData.category,
          description: characterData.description,
          personality_traits: characterData.personality_traits,
          speaking_style: characterData.speaking_style,
          avatar_url: `/avatars/${characterData.id}.jpg`,
          system_prompt: characterData.system_prompt,
          knowledge_context: characterData.knowledge_context,
          supported_languages: characterData.supported_languages,
          is_published: characterData.is_published
        }

        const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/admin/characters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(apiCharacterData)
        })

        console.log(`Response status for ${characterData.name}:`, response.status)
        console.log(`Response headers:`, Array.from(response.headers.entries()))

        if (response.ok) {
          const result = await response.json()
          console.log(`  ✅ Created character: ${result.name}`)
          
          // Update status to success
          setStatuses(prev => prev.map(s => 
            s.characterId === characterData.id 
              ? { ...s, status: 'success', message: 'Character created successfully' }
              : s
          ))
        } else {
          const errorText = await response.text()
          console.log(`Raw error response for ${characterData.name}:`, errorText)
          
          let errorDetail = 'Unknown error'
          try {
            const errorJson = JSON.parse(errorText)
            errorDetail = errorJson.detail || errorJson.message || 'Unknown error'
          } catch {
            errorDetail = errorText || `HTTP ${response.status}: ${response.statusText}`
          }
          
          console.error(`  ❌ Failed to create ${characterData.name}:`, errorDetail)
          
          // Update status to error
          setStatuses(prev => prev.map(s => 
            s.characterId === characterData.id 
              ? { ...s, status: 'error', message: errorDetail }
              : s
          ))
        }
      } catch (error: any) {
        console.error(`  ❌ Error creating ${characterData.name}:`, error)
        
        // Check if it's a network error and offer mock mode
        const isNetworkError = error.message.includes('fetch') || error.name === 'TypeError'
        let errorMessage = error.message
        
        if (isNetworkError) {
          errorMessage = `Network error: ${error.message}. Try the 'Test Connection' button first.`
          
          // Mock success for development if backend is not available
          if (process.env.NEXT_PUBLIC_ENV === 'development') {
            console.log(`🔧 Mock mode: Simulating character creation for ${characterData.name}`)
            
            // Update status to success (mock)
            setStatuses(prev => prev.map(s => 
              s.characterId === characterData.id 
                ? { ...s, status: 'success', message: 'Character created (mock mode - backend not available)' }
                : s
            ))
            
            // Skip to next character
            continue
          }
        }
        
        // Update status to error
        setStatuses(prev => prev.map(s => 
          s.characterId === characterData.id 
            ? { ...s, status: 'error', message: errorMessage }
            : s
        ))
      }

      // Add delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setCreating(false)
    console.log('🎉 Character creation completed!')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const successCount = statuses.filter(s => s.status === 'success').length
  const errorCount = statuses.filter(s => s.status === 'error').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Seed Characters</h1>
        <p className="text-lg text-gray-600">
          Create 3 historical characters: Atatürk, Mevlana, and Konfüçyüs
        </p>
      </div>

      {/* Character Preview */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Characters to Create</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(seedCharacters as SeedCharacterData[]).map((character) => {
            const status = statuses.find(s => s.characterId === character.id)
            
            return (
              <div key={character.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <h3 className="font-medium text-gray-900">{character.name}</h3>
                  </div>
                  {status && getStatusIcon(status.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{character.title}</p>
                <p className="text-xs text-gray-500">
                  {character.birth_year} - {character.death_year || 'Present'}
                </p>
                
                {showDetails && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-2">{character.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {character.personality_traits.slice(0, 3).map((trait) => (
                        <span key={trait} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {status && status.status === 'error' && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700">{status.message}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
          >
            {testing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Test Connection</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCreateCharacters}
            disabled={creating}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
          >
            {creating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Creating Characters...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Create All Characters</span>
              </>
            )}
          </button>
        </div>
        
        {/* Connection Status */}
        {connectionStatus && (
          <div className={`p-3 rounded-lg text-sm ${
            connectionStatus.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {connectionStatus}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {statuses.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Creation Results</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{statuses.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          {!creating && statuses.length === seedCharacters.length && (
            <div className="mt-6 text-center">
              {errorCount === 0 ? (
                <div className="text-green-600 font-medium">
                  🎉 All characters created successfully!
                </div>
              ) : (
                <div className="text-amber-600 font-medium">
                  ⚠️ {successCount} characters created, {errorCount} failed
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Step 1:</strong> Click "Test Connection" to verify backend is running</li>
          <li>• <strong>Step 2:</strong> Make sure you're logged in as admin</li>
          <li>• <strong>Step 3:</strong> Backend should be running on <code>http://localhost:8000</code></li>
          <li>• Characters will be created without RAG dependencies</li>
          <li>• Avatar images should be placed in <code>/public/avatars/</code> directory</li>
        </ul>
        
        {process.env.NEXT_PUBLIC_ENV === 'development' && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              🔧 <strong>Development Mode:</strong> If backend is not available, mock character creation will be used.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}