// =============================================================================
// HISTORA FRONTEND - TYPE DEFINITIONS
// =============================================================================

export interface Character {
  id: string
  name: string
  name_tr?: string
  name_en?: string
  category: string
  era?: string
  birth_year: number
  death_year?: number
  birth_place?: string
  short_bio_tr: string
  short_bio_en?: string
  personality_traits: string[]
  avatar_url?: string
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  view_count: number
}

export interface Category {
  id: string
  name: string
  name_tr?: string
  name_en?: string
  description_tr?: string
  description_en?: string
  icon?: string
  character_count: number
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  character_id: string
  character_name: string
  title?: string
  message_count: number
  last_message_at: string
  created_at: string
  language: string
  mode: 'chat' | 'advisor' | 'lesson'
}

export interface User {
  id: string
  firebase_uid: string
  email: string
  display_name?: string
  full_name?: string
  role: 'user' | 'admin' | 'moderator'
  is_admin?: boolean
  is_active?: boolean
  language_preference: string
  created_at: string
  updated_at?: string
  // Credit and Token System
  credits?: number
  total_tokens?: number
  total_credits_used?: number
  total_credits_purchased?: number
  last_login_at?: string
  current_plan?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export type Language = 'tr' | 'en'

export type ChatMode = 'chat' | 'advisor' | 'lesson'

export type CharacterCategory = 
  | 'leaders' 
  | 'philosophers' 
  | 'scientists' 
  | 'artists' 
  | 'writers' 
  | 'strategists'

export interface ChatRequest {
  character_id: string
  message: string
  session_id?: string
  language: Language
  mode: ChatMode
}

export interface ChatResponse {
  session_id: string
  character_id: string
  message: string
  response: string
  language: Language
  mode: ChatMode
  timestamp: string
}

// Firebase Auth User
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

// Component Props
export interface LayoutProps {
  children: React.ReactNode
}

export interface CharacterCardProps {
  character: Character
  onClick?: () => void
  className?: string
}

export interface ChatBubbleProps {
  message: ChatMessage
  isUser?: boolean
  className?: string
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export interface ErrorProps {
  message: string
  onRetry?: () => void
}
