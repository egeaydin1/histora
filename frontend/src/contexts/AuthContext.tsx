'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { apiClient } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isSubscribed = true
    
    // For development, immediately use demo mode to avoid authentication complexity
    const initializeAuth = async () => {
      try {
        // Check environment - if in development, prefer demo mode
        const isDevelopment = process.env.NODE_ENV === 'development'
        const forceDemo = process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true'
        
        if (isDevelopment || forceDemo || !firebaseAuth.isConfigured()) {
          console.log('🎭 Using demo mode for development')
          enableDemoMode()
          return
        }
        
        // If Firebase is configured and not in demo mode, set up the auth listener
        console.log('🔥 Setting up Firebase authentication')
        setupFirebaseAuth()
      } catch (error) {
        console.log('🎭 Authentication setup failed, using demo mode:', error)
        enableDemoMode()
      }
    }
    
    const enableDemoMode = () => {
      console.log('🎭 Demo mode enabled')
      if (isSubscribed) {
        setUser({
          id: 'demo-user-001',
          firebase_uid: 'demo-user-001',
          email: 'demo@histora.com',
          display_name: 'Demo User',
          role: 'user',
          language_preference: 'tr',
          created_at: new Date().toISOString()
        })
        setLoading(false)
      }
    }
    
    const setupFirebaseAuth = () => {
    let isSubscribed = true // Flag to prevent state updates after unmount
    let processingAuth = false // Flag to prevent concurrent auth processing
    
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (!isSubscribed || processingAuth) return // Prevent updates if component unmounted or already processing
      
      processingAuth = true
      console.log('Auth state changed:', firebaseUser?.email || 'No user')
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        // Get or create user in our backend
        try {
          const token = await firebaseAuth.getIdToken()
          localStorage.setItem('auth_token', token)
          
          // Check if we already have user data to avoid redundant calls
          if (user && user.firebase_uid === firebaseUser.uid && isSubscribed) {
            console.log('User already loaded, skipping backend sync')
            setLoading(false)
            processingAuth = false
            return
          }
          
          // Try to get existing user first
          const userResponse = await apiClient.getCurrentUser()
          
          if (userResponse.data && isSubscribed) {
            console.log('User found in backend:', userResponse.data.email)
            setUser(userResponse.data)
          } else if (userResponse.error === 'USER_NOT_FOUND' && isSubscribed) {
            console.log('User not found in backend, attempting registration')
            // Register new user only if we haven't already
            const registerResponse = await apiClient.register(
              firebaseUser.email || '', // email
              firebaseUser.uid, // firebaseUid as second param
              firebaseUser.displayName || undefined // displayName
            )
            
            if (registerResponse.data && isSubscribed) {
              console.log('User registered successfully:', registerResponse.data.email)
              setUser(registerResponse.data)
            } else if (registerResponse.error && registerResponse.error.includes('already exists') && isSubscribed) {
              console.log('User already exists, attempting Firebase login')
              // User exists, try Firebase login instead
              try {
                const token = await firebaseAuth.getIdToken()
                const loginResponse = await apiClient.client.post('/auth/firebase-login', {
                  firebase_token: token
                })
                
                if (loginResponse.data?.user && isSubscribed) {
                  console.log('Firebase login successful:', loginResponse.data.user.email)
                  setUser(loginResponse.data.user)
                  // Update token if backend provides JWT
                  if (loginResponse.data.access_token) {
                    localStorage.setItem('auth_token', loginResponse.data.access_token)
                    apiClient.client.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.access_token}`
                  }
                } else if (isSubscribed) {
                  console.warn('Firebase login failed, using fallback user')
                  // Final fallback to prevent auth loops
                  setUser({
                    id: firebaseUser.uid,
                    firebase_uid: firebaseUser.uid,
                    email: firebaseUser.email || 'demo@histora.com',
                    display_name: firebaseUser.displayName || 'Demo User',
                    role: 'user',
                    language_preference: 'tr',
                    created_at: new Date().toISOString()
                  })
                }
              } catch (loginError) {
                console.error('Firebase login attempt failed:', loginError)
                if (isSubscribed) {
                  // Set a fallback user to prevent auth loops
                  setUser({
                    id: firebaseUser.uid,
                    firebase_uid: firebaseUser.uid,
                    email: firebaseUser.email || 'demo@histora.com',
                    display_name: firebaseUser.displayName || 'Demo User',
                    role: 'user',
                    language_preference: 'tr',
                    created_at: new Date().toISOString()
                  })
                }
              }
            } else if (isSubscribed) {
              console.error('Registration failed:', registerResponse.error)
              // Set a fallback user to prevent auth loops
              setUser({
                id: firebaseUser.uid,
                firebase_uid: firebaseUser.uid,
                email: firebaseUser.email || 'demo@histora.com',
                display_name: firebaseUser.displayName || 'Demo User',
                role: 'user',
                language_preference: 'tr',
                created_at: new Date().toISOString()
              })
            }
          } else if (userResponse.error === 'INVALID_TOKEN' && isSubscribed) {
            console.log('Invalid token, clearing auth and using fallback')
            localStorage.removeItem('auth_token')
            // Set fallback user for invalid token
            setUser({
              id: firebaseUser.uid,
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email || 'demo@histora.com',
              display_name: firebaseUser.displayName || 'Demo User',
              role: 'user',
              language_preference: 'tr',
              created_at: new Date().toISOString()
            })
          } else if (isSubscribed) {
            console.warn('Backend error or unavailable, using fallback mode. Error:', userResponse.error)
            // Set fallback user for any other errors (including network errors)
            setUser({
              id: firebaseUser.uid,
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email || 'demo@histora.com',
              display_name: firebaseUser.displayName || 'Demo User (Offline Mode)', 
              role: 'user',
              language_preference: 'tr',
              created_at: new Date().toISOString()
            })
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error)
          if (isSubscribed) {
            // Fallback to demo mode to prevent infinite loops
            setUser({
              id: firebaseUser.uid,
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email || 'demo@histora.com',
              display_name: firebaseUser.displayName || 'Demo User',
              role: 'user',
              language_preference: 'tr',
              created_at: new Date().toISOString()
            })
          }
        }
      } else if (isSubscribed) {
        console.log('No Firebase user, clearing local state')
        setUser(null)
        localStorage.removeItem('auth_token')
      }
      
      if (isSubscribed) {
        setLoading(false)
      }
      processingAuth = false
    })

    return () => {
      isSubscribed = false
      unsubscribe()
    }
    } // End of setupFirebaseAuth
    
    // Start the authentication process
    initializeAuth()
    
    return () => {
      isSubscribed = false
    }
  }, []) // Empty dependency array is correct here since we only want to set up the auth once

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      if (firebaseAuth.isConfigured()) {
        // Firebase login
        const userCredential = await firebaseAuth.signIn(email, password)
        const firebaseUser = userCredential.user
        
        const token = await firebaseAuth.getIdToken()
        localStorage.setItem('auth_token', token)
        
        // Try to login to our backend using Firebase token
        try {
          const loginResponse = await apiClient.client.post('/auth/firebase-login', {
            firebase_token: token
          })
          
          if (loginResponse.data?.user) {
            setUser(loginResponse.data.user)
            // Update token if backend provides JWT
            if (loginResponse.data.access_token) {
              localStorage.setItem('auth_token', loginResponse.data.access_token)
              apiClient.client.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.access_token}`
            }
          }
        } catch (backendError) {
          console.warn('Backend Firebase login failed, using Firebase-only auth:', backendError)
          // Fallback: just use Firebase user info
          setUser({
            id: firebaseUser.uid,
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email || email,
            display_name: firebaseUser.displayName || email.split('@')[0],
            role: 'user',
            language_preference: 'tr',
            created_at: new Date().toISOString()
          })
        }
      } else {
        // JWT authentication when Firebase is not configured
        const loginResponse = await apiClient.login(email, password)
        
        if (loginResponse.data) {
          setUser(loginResponse.data)
          // Token is already stored by apiClient.login()
        } else {
          return { error: loginResponse.error || 'Login failed' }
        }
      }

      return {}
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle Firebase specific errors
      if (error.code === 'auth/user-not-found') {
        return { error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' }
      }
      if (error.code === 'auth/wrong-password') {
        return { error: 'Şifre yanlış.' }
      }
      if (error.code === 'auth/invalid-email') {
        return { error: 'Geçersiz e-posta adresi formatı.' }
      }
      if (error.code === 'auth/too-many-requests') {
        return { error: 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.' }
      }
      
      // Handle backend errors  
      if (error.response?.status === 401) {
        return { error: 'Geçersiz e-posta veya şifre.' }
      }
      
      return { error: error.message || 'Giriş yapılırken bir hata oluştu.' }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true)
      
      if (firebaseAuth.isConfigured()) {
        // Firebase register
        const userCredential = await firebaseAuth.signUp(email, password)
        const firebaseUser = userCredential.user
        
        const token = await firebaseAuth.getIdToken()
        localStorage.setItem('auth_token', token)
        
        // Register to our backend using the new format
        // For Firebase users: email, firebaseUid, displayName
        const registerResponse = await apiClient.register(
          email, // email
          firebaseUser.uid, // firebaseUid as second param 
          displayName || firebaseUser.displayName || email.split('@')[0] // displayName
        )
        
        if (registerResponse.data) {
          setUser(registerResponse.data)
        } else if (registerResponse.error && registerResponse.error.includes('already exists')) {
          // User already exists, try to login instead
          console.log('User already exists during registration, attempting login')
          const loginResult = await handleLogin(email, password)
          if (loginResult.error) {
            return { error: 'Bu e-posta adresi zaten kullanılıyor. Giriş yapmayı deneyin.' }
          }
        } else {
          return { error: registerResponse.error }
        }
      } else {
        // Regular email/password registration (no Firebase)
        const registerResponse = await apiClient.register(
          email, // email
          password, // password
          displayName || email.split('@')[0] // displayName
        )
        
        if (registerResponse.data) {
          setUser(registerResponse.data)
          // Token is already stored by apiClient.register()
        } else {
          return { error: registerResponse.error || 'Registration failed' }
        }
      }

      return {}
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle Firebase specific errors
      if (error.code === 'auth/email-already-in-use') {
        return { error: 'Bu e-posta adresi zaten kullanılıyor. Giriş yapmayı deneyin.' }
      }
      if (error.code === 'auth/weak-password') {
        return { error: 'Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.' }
      }
      if (error.code === 'auth/invalid-email') {
        return { error: 'Geçersiz e-posta adresi formatı.' }
      }
      
      // Handle backend errors
      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail
        if (detail) {
          if (detail.includes('email')) {
            return { error: 'Bu e-posta adresi zaten kullanılıyor.' }
          }
          return { error: detail }
        }
      }
      
      return { error: error.message || 'Kayıt olurken bir hata oluştu.' }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (firebaseAuth.isConfigured()) {
        await firebaseAuth.signOut()
      }
      setUser(null)
      setFirebaseUser(null)
      localStorage.removeItem('auth_token')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
