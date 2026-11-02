import { createContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../lib/firebase'

type AuthValue = {
  user: User | null
  loading: boolean
  loginGoogle: () => Promise<User>
  loginGithub: () => Promise<User>
  loginEmail: (email: string, password: string) => Promise<User>
  signupEmail: (name: string, email: string, password: string) => Promise<User>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      },
      (error) => {
        console.error('Firebase auth state error:', error)
        setUser(null)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  const value: AuthValue = {
    user,
    loading,

    loginGoogle: async () => {
      await setPersistence(auth, browserLocalPersistence)
      return (await signInWithPopup(auth, googleProvider)).user
    },

    loginGithub: async () => {
      await setPersistence(auth, browserLocalPersistence)
      return (await signInWithPopup(auth, githubProvider)).user
    },

    loginEmail: async (email, password) => {
      await setPersistence(auth, browserLocalPersistence)
      return (await signInWithEmailAndPassword(auth, email, password)).user
    },

    signupEmail: async (name, email, password) => {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      await sendEmailVerification(cred.user)
      return cred.user
    },

    resetPassword: (email) => sendPasswordResetEmail(auth, email),

    logout: () => signOut(auth),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
