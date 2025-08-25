'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Plus,
  User
} from 'lucide-react'

interface Character {
  id: string
  name: string
  title: string
  is_published: boolean
}

export default function UploadPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/characters`)
      if (response.ok) {
        const data = await response.json()
        setCharacters(data)
      }
    } catch (err) {
      // Mock data for development
      setCharacters([
        { id: 'ataturk-001', name: 'Mustafa Kemal Atatürk', title: 'Cumhurbaşkanı', is_published: true },
        { id: 'mevlana-001', name: 'Mevlana Celaleddin Rumi', title: 'Büyük Mutasavvıf', is_published: true },
        { id: 'konfucyus-001', name: 'Konfüçyüs', title: 'Antik Çin Filozofu', is_published: true }
      ])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.txt', '.md', '.pdf', '.docx']
      const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
      
      if (!allowedTypes.includes(fileExt)) {
        setError(`File type ${fileExt} not supported. Allowed types: ${allowedTypes.join(', ')}`)
        setFile(null)
        return
      }
      
      // Validate file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setError(null)
      
      // Auto-generate title from filename if empty
      if (!title) {
        const baseName = selectedFile.name.split('.').slice(0, -1).join('.')
        setTitle(baseName.replace(/[_-]/g, ' '))
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedCharacter || !title || !file) {
      setError('Please select character, enter title, and choose a file')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/characters/${selectedCharacter}/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (response.ok) {
        const result = await response.json()
        setSuccess(`File uploaded successfully! Processing status: ${result.processing_status}`)
        
        // Reset form
        setSelectedCharacter('')
        setTitle('')
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }))
        setError(errorData.detail || 'Failed to upload file')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      // Mock success for demo
      setSuccess(`Mock upload successful for "${title}" to character ${selectedCharacter}`)
      setSelectedCharacter('')
      setTitle('')
      setFile(null)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Knowledge Source</h1>
        <p className="text-gray-600">Add new content to character knowledge base</p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Character Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Character *
          </label>
          <select
            value={selectedCharacter}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a character...</option>
            {characters.map((char) => (
              <option key={char.id} value={char.id}>
                {char.name} - {char.title}
              </option>
            ))}
          </select>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Atatürk'ün Eğitim Görüşleri"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File *
          </label>
          
          {!file ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".txt,.md,.pdf,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  TXT, MD, PDF, DOCX up to 50MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Upload Successful
                </p>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  Upload Error
                </p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!selectedCharacter || !title || !file || uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Upload Source
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Choose the character this content belongs to</li>
          <li>Give your source a descriptive title</li>
          <li>Upload files in TXT, MD, PDF, or DOCX format</li>
          <li>Files will be automatically processed and added to the character's knowledge</li>
          <li>Processing may take a few minutes for large files</li>
        </ul>
      </div>
    </div>
  )
}
