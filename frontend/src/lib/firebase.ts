// Firebase auth wrapper — gracefully handles unconfigured Firebase

interface FirebaseUserLike {
  uid: string
  email: string | null
  displayName: string | null
}

type AuthStateCallback = (user: FirebaseUserLike | null) => void

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

const configured = Boolean(config.apiKey && config.authDomain && config.projectId)

// Lazy-load Firebase only if configured
let _firebaseAuth: import('firebase/auth').Auth | null = null

async function getFirebaseAuth() {
  if (!configured) return null
  if (_firebaseAuth) return _firebaseAuth
  try {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    const app = getApps().length ? getApps()[0] : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
    _firebaseAuth = getAuth(app)
    return _firebaseAuth
  } catch {
    return null
  }
}

export const firebaseAuth = {
  isConfigured: () => configured,

  onAuthStateChanged: (callback: AuthStateCallback) => {
    if (!configured) {
      callback(null)
      return () => {}
    }
    let unsubscribe = () => {}
    getFirebaseAuth().then(auth => {
      if (!auth) { callback(null); return }
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, callback)
      })
    })
    return () => unsubscribe()
  },

  getIdToken: async (): Promise<string> => {
    const auth = await getFirebaseAuth()
    if (!auth?.currentUser) return ''
    const { getIdToken } = await import('firebase/auth')
    return getIdToken(auth.currentUser)
  },

  signIn: async (email: string, password: string) => {
    const auth = await getFirebaseAuth()
    if (!auth) throw new Error('Firebase not configured')
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    return signInWithEmailAndPassword(auth, email, password)
  },

  signUp: async (email: string, password: string) => {
    const auth = await getFirebaseAuth()
    if (!auth) throw new Error('Firebase not configured')
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    return createUserWithEmailAndPassword(auth, email, password)
  },

  signOut: async () => {
    const auth = await getFirebaseAuth()
    if (!auth) return
    const { signOut } = await import('firebase/auth')
    return signOut(auth)
  },

  verifyIdToken: async (token: string): Promise<FirebaseUserLike | null> => {
    // Client-side can't verify — return null (server does this)
    return null
  },
}
