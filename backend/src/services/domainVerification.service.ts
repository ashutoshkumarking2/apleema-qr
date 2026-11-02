import { randomBytes, createHash } from 'crypto'
import { getDomain, parse } from 'tldts'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../config/firebaseAdmin'

const challenges = db.collection('domain_verification_challenges')
const verifications = db.collection('verified_domains')

const TOKEN_EXPIRY_MS = 60 * 60 * 1000
const META_TAG_NAME = 'apleema-verification'
const TXT_RECORD_PREFIX = '_apleema-verification'

const PLATFORM_SUFFIXES = [
  'vercel.app',
  'netlify.app',
  'pages.dev',
  'github.io',
  'web.app',
  'firebaseapp.com',
]

export type VerificationMethod = 'meta-tag' | 'dns-txt'

export function normalizeHostname(input: string): string {
  let hostname = input.trim()

  if (!hostname) throw new Error('Domain is required.')

  if (!/^https?:\/\//i.test(hostname)) {
    hostname = `https://${hostname}`
  }

  const url = new URL(hostname)

  if (
    url.protocol !== 'https:' &&
    url.protocol !== 'http:'
  ) {
    throw new Error('Only HTTP and HTTPS domains are supported.')
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, '')

  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.includes(':') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  ) {
    throw new Error('Enter a valid public domain name.')
  }

  const parsed = parse(host, { allowPrivateDomains: true })

  if (
    !parsed.domain ||
    parsed.isIp ||
    parsed.isSpecialUse
  ) {
    throw new Error('Enter a valid public domain name.')
  }

  return host
}

export function getVerificationMethod(hostname: string): VerificationMethod {
  const host = normalizeHostname(hostname)

  const isPlatformSubdomain = PLATFORM_SUFFIXES.some(
    suffix => host.endsWith(`.${suffix}`)
  )

  return isPlatformSubdomain ? 'meta-tag' : 'dns-txt'
}

export function getRegistrableDomain(hostname: string): string | null {
  return getDomain(hostname, { allowPrivateDomains: true })
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createDomainChallenge(
  uid: string,
  input: string
) {
  const hostname = normalizeHostname(input)
  const method = getVerificationMethod(hostname)
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS

  const ref = challenges.doc(`${uid}_${hostname}`)

  await ref.set({
    uid,
    hostname,
    method,
    tokenHash,
    expiresAt,
    verified: false,
    createdAt: FieldValue.serverTimestamp(),
  })

  return {
    hostname,
    method,
    token,
    expiresAt,
    metaTag:
      method === 'meta-tag'
        ? `<meta name="${META_TAG_NAME}" content="${token}" />`
        : null,
    dnsRecord:
      method === 'dns-txt'
        ? {
            type: 'TXT',
            name: `${TXT_RECORD_PREFIX}.${hostname}`,
            value: token,
          }
        : null,
  }
}

export async function getDomainChallenge(
  uid: string,
  input: string
) {
  const hostname = normalizeHostname(input)
  const snapshot = await challenges.doc(`${uid}_${hostname}`).get()

  if (!snapshot.exists) return null

  const data = snapshot.data()!

  if (data.expiresAt < Date.now()) return null

  return {
    hostname,
    method: data.method as VerificationMethod,
    tokenHash: data.tokenHash as string,
  }
}

export async function saveVerifiedDomain(
  uid: string,
  hostname: string,
  method: VerificationMethod
) {
  await verifications.doc(`${uid}_${hostname}`).set({
    uid,
    hostname,
    method,
    verified: true,
    verifiedAt: FieldValue.serverTimestamp(),
  })
}

export async function isDomainVerified(
  uid: string,
  input: string
): Promise<boolean> {
  const hostname = normalizeHostname(input)
  const snapshot = await verifications.doc(`${uid}_${hostname}`).get()

  return snapshot.exists && snapshot.data()?.verified === true
}

export async function markChallengeVerified(
  uid: string,
  hostname: string
) {
  await challenges.doc(`${uid}_${hostname}`).set({
    verified: true,
    verifiedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
}

export function verifyTokenValue(
  expectedHash: string,
  submittedToken: string
): boolean {
  return hashToken(submittedToken) === expectedHash
}
