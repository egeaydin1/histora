import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

let app: FirebaseApp
let auth: Auth

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
    firebaseConfig.apiKey.trim() !== '' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your_project_id' &&
    firebaseConfig.projectId.trim() !== ''
  )
}

if (isFirebaseConfigured()) {
  // Initialize Firebase
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  auth = getAuth(app)
  console.log('✅ Firebase initialized successfully')
} else {
  console.warn('⚠️ Firebase configuration missing - running in demo mode')
  // Create mock objects for demo mode
  app = {} as FirebaseApp
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // Mock auth state - no user initially
      setTimeout(() => callback(null), 100)
      return () => {} // unsubscribe function
    },
    signOut: () => Promise.resolve(),
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured - demo mode')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured - demo mode'))
  } as any
}

// Auth helper functions
export const firebaseAuth = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured')
    }
    return await signInWithEmailAndPassword(auth, email, password)
  },

  // Create user with email and password
  signUp: async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured')
    }
    return await createUserWithEmailAndPassword(auth, email, password)
  },

  // Sign out
  signOut: async () => {
    if (!isFirebaseConfigured()) {
      return
    }
    await signOut(auth)
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!isFirebaseConfigured()) {
      setTimeout(() => callback(null), 100)
      return () => {}
    }
    return onAuthStateChanged(auth, callback)
  },

  // Get current user
  getCurrentUser: () => {
    if (!isFirebaseConfigured()) {
      return null
    }
    return auth.currentUser
  },

  // Get ID token
  getIdToken: async () => {
    if (!isFirebaseConfigured()) {
      return `firebase-mock-token-${Date.now()}`
    }
    const user = auth.currentUser
    if (!user) {
      throw new Error('No authenticated user')
    }
    return await user.getIdToken()
  },

  // Check if Firebase is configured
  isConfigured: () => isFirebaseConfigured(),

  // Get configuration status
  getStatus: () => ({
    configured: isFirebaseConfigured(),
    projectId: firebaseConfig.projectId || 'not_configured',
    authDomain: firebaseConfig.authDomain || 'not_configured',
    hasApiKey: !!(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key_here'),
    mode: isFirebaseConfigured() ? 'production' : 'demo'
  })
}

export { app, auth }
export default app