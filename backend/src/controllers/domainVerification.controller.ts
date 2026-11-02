import type { Request, Response } from 'express'
import { resolveTxt, lookup } from 'node:dns/promises'
import net from 'node:net'
import {
  createDomainChallenge,
  getDomainChallenge,
  isDomainVerified,
  saveVerifiedDomain,
  markChallengeVerified,
  verifyTokenValue,
  normalizeHostname,
} from '../services/domainVerification.service'

const META_TAG_NAME = 'apleema-verification'
const TXT_PREFIX = '_apleema-verification'

function isPublicIp(ip: string): boolean {
  const version = net.isIP(ip)

  if (version === 4) {
    const parts = ip.split('.').map(Number)
    const [a, b] = parts

    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 192 && b === 88)
    )
  }

  if (version === 6) {
    const normalized = ip.toLowerCase()
    return (
      normalized !== '::' &&
      normalized !== '::1' &&
      !normalized.startsWith('fc') &&
      !normalized.startsWith('fd') &&
      !normalized.startsWith('fe8') &&
      !normalized.startsWith('fe9') &&
      !normalized.startsWith('fea') &&
      !normalized.startsWith('feb') &&
      !normalized.startsWith('::ffff:127.')
    )
  }

  return false
}

async function verifyMetaTag(hostname: string, token: string): Promise<boolean> {
  let currentUrl = `https://${hostname}/`

  for (let redirect = 0; redirect <= 3; redirect++) {
    const url = new URL(currentUrl)

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port && url.port !== '443'
    ) {
      return false
    }

    const addresses = await lookup(url.hostname, { all: true, verbatim: true })

    if (!addresses.length || addresses.some(address => !isPublicIp(address.address))) {
      return false
    }

    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: 'text/html',
        'User-Agent': 'ApleemaDomainVerification/1.0',
      },
    })

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      if (!location || redirect === 3) return false
      currentUrl = new URL(location, url).toString()
      continue
    }

    if (!response.ok) return false

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('text/html')) return false

    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength > 1024 * 1024) return false

    const html = await response.text()
    if (html.length > 1024 * 1024) return false

    const escapedName = META_TAG_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const tags = html.match(/<meta\b[^>]*>/gi) || []

    return tags.some(tag => {
      const nameMatch = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)
      const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)

      return (
        nameMatch?.[1] === META_TAG_NAME &&
        contentMatch?.[1] === token
      )
    })
  }

  return false
}

async function verifyDnsTxt(hostname: string, token: string): Promise<boolean> {
  const recordName = `${TXT_PREFIX}.${hostname}`

  try {
    const records = await resolveTxt(recordName)
    return records.some(record => record.join('') === token)
  } catch {
    return false
  }
}

export async function createDomainVerificationChallenge(
  req: Request,
  res: Response
): Promise<void> {
  const uid = req.user?.uid
  const domain = req.body?.domain

  if (!uid) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  if (typeof domain !== 'string' || domain.length > 253) {
    res.status(400).json({ error: 'Enter a valid domain.' })
    return
  }

  try {
    const challenge = await createDomainChallenge(uid, domain)
    res.status(201).json({ success: true, challenge })
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Could not create verification challenge.',
    })
  }
}

export async function verifyDomainOwnership(
  req: Request,
  res: Response
): Promise<void> {
  const uid = req.user?.uid
  const domain = req.body?.domain

  if (!uid) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  if (
    typeof domain !== 'string' ||
    typeof req.body?.token !== 'string' ||
    req.body.token.length > 200
  ) {
    res.status(400).json({ error: 'Domain and verification token are required.' })
    return
  }

  try {
    const hostname = normalizeHostname(domain)
    const challenge = await getDomainChallenge(uid, hostname)

    if (!challenge) {
      res.status(400).json({ error: 'Verification challenge not found or expired. Generate a new one.' })
      return
    }

    if (!verifyTokenValue(challenge.tokenHash, req.body.token)) {
      res.status(400).json({ error: 'Verification token does not match.' })
      return
    }

    const verified = challenge.method === 'dns-txt'
      ? await verifyDnsTxt(hostname, req.body.token)
      : await verifyMetaTag(hostname, req.body.token)

    if (!verified) {
      res.status(400).json({
        verified: false,
        error: 'Verification record was not found. Check the record and try again.',
      })
      return
    }

    await saveVerifiedDomain(uid, hostname, challenge.method)
    await markChallengeVerified(uid, hostname)

    res.json({ success: true, verified: true, domain: hostname, method: challenge.method })
  } catch (error) {
    console.error('verifyDomainOwnership failed:', error)
    res.status(400).json({ error: 'Could not verify this domain.' })
  }
}

export async function getDomainVerificationStatus(
  req: Request,
  res: Response
): Promise<void> {
  const uid = req.user?.uid
  const domain = req.query.domain

  if (!uid) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  if (typeof domain !== 'string') {
    res.status(400).json({ error: 'Domain query parameter is required.' })
    return
  }

  try {
    const hostname = normalizeHostname(domain)
    const verified = await isDomainVerified(uid, hostname)

    res.json({ success: true, domain: hostname, verified })
  } catch (error) {
    res.status(400).json({ error: 'Invalid domain.' })
  }
}
