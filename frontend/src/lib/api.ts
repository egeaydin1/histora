// Histora API client

// Empty string → same-origin requests, proxied to the backend via Next.js
// rewrites (see next.config.ts). Works from any host: LAN IP, tunnel, localhost.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options.headers as Record<string, string> || {}),
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { error: err.detail || `HTTP ${res.status}` }
    }
    const data: T = await res.json()
    return { data }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Network error'
    return { error: msg }
  }
}

export interface ApiCharacter {
  id: string
  name: string
  name_tr?: string
  name_en?: string
  category: string
  era?: string
  birth_year: number
  death_year?: number
  short_bio_tr?: string
  short_bio_en?: string
  personality_traits?: string[]
  avatar_url?: string
  status: string
  is_featured: boolean
  view_count?: number
}

export interface ChatRequest {
  character_id: string
  message: string
  session_id?: string
  language?: string
  mode?: string
}

export interface ChatApiResponse {
  response: string
  session_id: string
  tokens_used?: number
}

export const api = {
  getCharacters: (category?: string) =>
    request<ApiCharacter[]>(`/characters/${category ? `?category=${category}` : ''}`),

  getCharacter: (id: string) =>
    request<ApiCharacter>(`/characters/${id}`),

  sendDemoMessage: (payload: {
    character_id: string
    message: string
    history?: { role: 'user' | 'assistant'; content: string }[]
    language?: string
  }) =>
    request<ChatApiResponse>('/chat/demo', {
      method: 'POST',
      body: JSON.stringify({
        character_id: payload.character_id,
        message: payload.message,
        history: payload.history || [],
        language: payload.language || 'en',
      }),
    }),

  sendMessage: (payload: ChatRequest) =>
    request<ChatApiResponse>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        character_id: payload.character_id,
        message: payload.message,
        session_id: payload.session_id,
        language: payload.language || 'en',
        mode: payload.mode || 'chat',
      }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, full_name: string) =>
    request<{ access_token: string; user: unknown }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    }),

  getCurrentUser: () =>
    request<{ id: string; email: string; role: string }>('/auth/me'),
}

// Stub helper for legacy admin/dashboard pages
type AnyResult = Promise<{ data?: unknown; error?: string }>
const stub = (path: string, method = 'GET', body?: unknown): AnyResult =>
  request(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) })

// Re-export apiClient for backwards compatibility with existing code
// Includes all admin/dashboard stubs so legacy pages compile cleanly
export const apiClient = {
  getCurrentUser: api.getCurrentUser,
  login: (email: string, password: string) => api.login(email, password),
  register: (email: string, firebaseUid: string, displayName?: string) =>
    api.register(email, firebaseUid, displayName || ''),
  getCharacter: (id: string, _lang?: string) => api.getCharacter(id),
  client: {
    post: async (path: string, data: unknown) => {
      const res = await fetch(`${BASE_URL}/api/v1${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      })
      return { data: await res.json().catch(() => null) }
    },
    defaults: { headers: { common: {} as Record<string, string> } },
  },
  // Admin stubs
  adminLogin: (k: string) => stub('/admin/login', 'POST', { api_key: k }),
  getPricingPlans: () => stub('/admin/pricing-plans'),
  getCreditPackages: () => stub('/admin/credit-packages'),
  updatePricingPlan: (id: string, d: unknown) => stub(`/admin/pricing-plans/${id}`, 'PATCH', d),
  updateCreditPackage: (id: string, d: unknown) => stub(`/admin/credit-packages/${id}`, 'PATCH', d),
  createPricingPlan: (d: unknown) => stub('/admin/pricing-plans', 'POST', d),
  createCreditPackage: (d: unknown) => stub('/admin/credit-packages', 'POST', d),
  deletePricingPlan: (id: string) => stub(`/admin/pricing-plans/${id}`, 'DELETE'),
  deleteCreditPackage: (id: string) => stub(`/admin/credit-packages/${id}`, 'DELETE'),
  getAdminUsers: (_p?: unknown) => stub('/admin/users'),
  getAdminStats: () => stub('/admin/stats'),
  addUserCredits: (id: string, d: unknown) => stub(`/admin/users/${id}/credits`, 'POST', d),
  deleteUser: (id: string) => stub(`/admin/users/${id}`, 'DELETE'),
  toggleUserStatus: (id: string, d: unknown) => stub(`/admin/users/${id}/status`, 'PUT', d),
  getUserTokenStats: () => stub('/usage/stats'),
  getChatSessions: () => stub('/chat/sessions'),
  getCreditTransactions: () => stub('/usage/transactions'),
  getQuotaInfo: () => stub('/usage/quota'),
  getUsageStats: () => stub('/usage/stats'),
  upgradePlan: (d: unknown) => stub('/pricing/upgrade', 'POST', d),
  purchaseCredits: (d: unknown) => stub('/pricing/purchase', 'POST', d),
}
