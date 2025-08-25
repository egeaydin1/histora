'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { onAuthStateChange, loginWithEmail, registerWithEmail, logout } from '@/lib/firebase'
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
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        // Get or create user in our backend
        try {
          const token = await firebaseUser.getIdToken()
          localStorage.setItem('auth_token', token)
          
          // Try to get existing user
          const userResponse = await apiClient.getCurrentUser()
          
          if (userResponse.data) {
            setUser(userResponse.data)
          } else {
            // Register new user
            const registerResponse = await apiClient.register(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || undefined
            )
            
            if (registerResponse.data) {
              setUser(registerResponse.data)
            }
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error)
        }
      } else {
        setUser(null)
        localStorage.removeItem('auth_token')
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user: firebaseUser, error } = await loginWithEmail(email, password)
      
      if (error) {
        return { error }
      }

      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()
        localStorage.setItem('auth_token', token)
        
        // Login to our backend
        const loginResponse = await apiClient.login(firebaseUser.uid, firebaseUser.email || '')
        
        if (loginResponse.data) {
          setUser(loginResponse.data)
        } else {
          return { error: loginResponse.error }
        }
      }

      return {}
    } catch (error: any) {
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true)
      const { user: firebaseUser, error } = await registerWithEmail(email, password)
      
      if (error) {
        return { error }
      }

      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()
        localStorage.setItem('auth_token', token)
        
        // Register to our backend
        const registerResponse = await apiClient.register(
          firebaseUser.uid, 
          firebaseUser.email || '',
          displayName
        )
        
        if (registerResponse.data) {
          setUser(registerResponse.data)
        } else {
          return { error: registerResponse.error }
        }
      }

      return {}
    } catch (error: any) {
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
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
