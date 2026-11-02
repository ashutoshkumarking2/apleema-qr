import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import path from 'path'

const keyPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT || 'serviceAccountKey.json')

if (!getApps().length) {
  try {
    initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })
  } catch (err) {
    console.error('Could not load the Firebase service account key at:', keyPath)
    throw err
  }
}

export const adminAuth = getAuth()
export const db = getFirestore()