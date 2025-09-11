'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Upload,
  CheckCircle,
  XCircle,
  Star,
  Database,
  Users
} from 'lucide-react'
import { renderError } from '@/utils/errorHandler'

interface Character {
  id: string
  name: string
  title: string
  category: string
  nationality: string
  birth_year?: number
  death_year?: number
  is_published: boolean
  is_featured: boolean
  source_count: number
  processed_sources: number
  chunk_count: number
  ready_for_chat: boolean
  created_at: string
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/characters`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch characters: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setCharacters(data.map((char: any) => ({
        id: char.id,
        name: char.name,
        title: char.title || '',
        category: char.category,
        nationality: char.nationality || '',
        birth_year: char.birth_year,
        death_year: char.death_year,
        is_published: char.is_published,
        is_featured: char.is_featured,
        source_count: 0, // RAG system removed, keeping for UI
        processed_sources: 0,
        chunk_count: 0,
        ready_for_chat: char.is_published,
        created_at: char.created_at
      })))
      setError(null)
    } catch (err) {
      console.error('Error fetching characters:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Fallback to mock data for development
      setCharacters([
        {
          id: 'ataturk-001',
          name: 'Mustafa Kemal Atatürk',
          title: 'Türkiye Cumhuriyeti Kurucusu ve İlk Cumhurbaşkanı',
          category: 'leader',
          nationality: 'Türk',
          birth_year: 1881,
          death_year: 1938,
          is_published: true,
          is_featured: true,
          source_count: 1,
          processed_sources: 1,
          chunk_count: 2,
          ready_for_chat: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'mevlana-001',
          name: 'Mevlana Celaleddin Rumi',
          title: 'Büyük Mutasavvıf ve Şair',
          category: 'philosopher',
          nationality: 'Türk-Fars',
          birth_year: 1207,
          death_year: 1273,
          is_published: true,
          is_featured: false,
          source_count: 1,
          processed_sources: 1,
          chunk_count: 2,
          ready_for_chat: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'konfucyus-001',
          name: 'Konfüçyüs',
          title: 'Çin Filozofu ve Öğretmen',
          category: 'philosopher',
          nationality: 'Çinli',
          birth_year: -551,
          death_year: -479,
          is_published: true,
          is_featured: true,
          source_count: 1,
          processed_sources: 1,
          chunk_count: 2,
          ready_for_chat: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'ibn-sina-001',
          name: 'İbn-i Sina',
          title: 'Hekim, Filozof ve Bilgin',
          category: 'scientist',
          nationality: 'Fars',
          birth_year: 980,
          death_year: 1037,
          is_published: true,
          is_featured: false,
          source_count: 1,
          processed_sources: 1,
          chunk_count: 2,
          ready_for_chat: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'leonardo-001',
          name: 'Leonardo da Vinci',
          title: 'Ressam, Mucit ve Bilim İnsanı',
          category: 'scientist',
          nationality: 'İtalyan',
          birth_year: 1452,
          death_year: 1519,
          is_published: true,
          is_featured: true,
          source_count: 1,
          processed_sources: 1,
          chunk_count: 2,
          ready_for_chat: true,
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handlePublishToggle = async (characterId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/characters/${characterId}`,
        {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ is_published: !currentStatus })
        }
      )
      
      if (response.ok) {
        // Update local state
        setCharacters(chars => 
          chars.map(char => 
            char.id === characterId 
              ? { ...char, is_published: !currentStatus }
              : char
          )
        )
      } else {
        const errorData = await response.text()
        throw new Error(`Failed to update character: ${response.status} ${errorData}`)
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
      alert(`Failed to update character status: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (characterId: string, characterName: string) => {
    if (!confirm(`Are you sure you want to delete "${characterName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/characters/${characterId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.ok) {
        // Remove from local state
        setCharacters(chars => chars.filter(char => char.id !== characterId))
        alert('Character deleted successfully')
      } else {
        const errorData = await response.text()
        console.error('Delete failed:', response.status, errorData)
        throw new Error(`Failed to delete character: ${response.status} ${response.statusText}`)
      }
    } catch (err: any) {
      console.error('Failed to delete character:', err)
      alert(`Failed to delete character: ${renderError(err)}`)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Characters</h1>
          <p className="text-gray-600">Manage historical characters and their knowledge</p>
        </div>
        <Link
          href="/admin/characters/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-700">
            Warning: {error}. Using mock data for demonstration.
          </p>
        </div>
      )}

      {/* Characters Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Character
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Knowledge Sources
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {characters.map((character) => (
              <tr key={character.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {character.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {character.name}
                        </div>
                        {character.is_featured && (
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{character.title}</div>
                      <div className="text-xs text-gray-400">
                        {character.nationality} • {character.birth_year}-{character.death_year}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                    {character.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {character.processed_sources}/{character.source_count} sources
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>{character.chunk_count} chunks</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      {character.is_published ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {character.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {character.ready_for_chat ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {character.ready_for_chat ? 'Chat Ready' : 'Not Ready'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/characters/${character.id}`}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Edit Character"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/characters/${character.id}/sources`}
                      className="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Manage Sources"
                    >
                      <Upload className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/chat/${character.id}`}
                      className="text-purple-600 hover:text-purple-900 p-1 rounded"
                      title="Chat with Character"
                      target="_blank"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handlePublishToggle(character.id, character.is_published)}
                      className={`p-1 rounded ${
                        character.is_published 
                          ? 'text-orange-600 hover:text-orange-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={character.is_published ? 'Unpublish Character' : 'Publish Character'}
                    >
                      {character.is_published ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(character.id, character.name)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Character"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {characters.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No characters</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first character.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/characters/add"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Character
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
