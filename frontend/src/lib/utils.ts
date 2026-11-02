export const CONSENT_VERSION = 'v2'
const key = (uid: string) => `apleema_consent_${uid}`

// Stored in the browser for now. Later this moves to the backend database (DPDP needs a server-side record).
export function saveConsent(uid: string) {
  localStorage.setItem(
    key(uid),
    JSON.stringify({ version: CONSENT_VERSION, at: new Date().toISOString() })
  )
}

export function hasConsent(uid: string) {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) || 'null')?.version === CONSENT_VERSION
  } catch {
    return false
  }
}

export function authErrorMessage(code?: string) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'The login window was closed. Please try again.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is linked to a different login method (Google, GitHub or email). Please use that one.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
      return 'Firebase keys are missing in .env. Add them and restart the dev server.'
    default:
      return 'Something went wrong. Please try again.'
  }
}