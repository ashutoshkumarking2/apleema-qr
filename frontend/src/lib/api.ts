import { auth } from './firebase'

export type OtpPurpose = 'login' | 'logout'

const API_BASE = (import.meta.env.VITE_API_URL || 'https://apleema-qr.onrender.com').replace(/\/$/, '')

async function request(path: string, method = 'GET', body?: unknown) {
  const user = auth.currentUser
  if (!user) throw new Error('Please log in again.')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${await user.getIdToken()}`,
  }

  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed.') as Error & { wait?: number }
    error.wait = data.wait
    throw error
  }

  return data
}

async function otpRequest(path: string, method = 'GET', body?: unknown) {
  const user = auth.currentUser
  if (!user) throw new Error('Please log in again.')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${await user.getIdToken()}`,
  }

  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${API_BASE}/auth${path}`, {
    method,
    headers,
    credentials: 'include',
    cache: 'no-store',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed.') as Error & { wait?: number }
    error.wait = data.wait
    throw error
  }

  return data
}

export function sendOtp(purpose: OtpPurpose = 'login') {
  return otpRequest('/send-code', 'POST', { purpose })
}

export function verifyOtp(code: string, purpose: OtpPurpose = 'login') {
  return otpRequest('/verify-code', 'POST', { code, purpose })
}

export async function checkOtpSession(): Promise<boolean> {
  try {
    const data = await otpRequest('/session')
    return data.verified === true
  } catch {
    return false
  }
}

export function clearOtpSession() {
  // The verified logout endpoint clears the HttpOnly server cookie.
}

export type QrRecord = {
  id: string
  name: string
  type: 'static' | 'dynamic'
  category: string
  content: string
  shortUrl?: string | null
  scanCount?: number
  active?: boolean
  style?: Record<string, unknown>
}

export async function createQr(payload: {
  name: string
  type: 'static' | 'dynamic'
  category: string
  content: string
  style: Record<string, unknown>
  githubRepositoryId?: number
}): Promise<QrRecord> {
  const data = await request('/api/qr', 'POST', payload)
  return data.qr
}

export async function getQrs(): Promise<QrRecord[]> {
  const data = await request('/api/qr')
  return data.qrs || []
}

export async function deleteQr(id: string): Promise<void> {
  await request(`/api/qr/${encodeURIComponent(id)}`, 'DELETE')
}


export type QrScanEvent = {
  id: string
  scannedAt: string | null
  device: string
  browser: string
  referrer: string
  scanCount?: number
}

export type QrAnalyticsResponse = {
  qr: QrRecord
  analytics: {
    totalScans: number
    recordedEvents: number
    dailyScans: { date: string; scans: number }[]
    dailyDeviceScans?: { date: string; Mobile: number; Desktop: number; Tablet: number; Unknown: number }[]
    deviceCounts?: Record<string, number>
    browserCounts?: Record<string, number>
    recentScans: QrScanEvent[]
  }
}

export async function getQrAnalytics(id: string): Promise<QrAnalyticsResponse> {
  return request(`/api/analytics/${encodeURIComponent(id)}`)
}

export async function sendQrDeleteCode(id: string): Promise<{ sent: boolean; email: string }> {
  return request(`/api/qr/${encodeURIComponent(id)}/delete-code`, 'POST')
}

export async function confirmDeleteQr(id: string, email: string, code: string): Promise<void> {
  await request(`/api/qr/${encodeURIComponent(id)}`, 'DELETE', { email, code })
}


export async function sendBulkQrDeleteCode(ids: string[]): Promise<{ sent: boolean; email: string; count: number }> {
  return request('/api/qr/bulk-delete-code', 'POST', { ids })
}

export async function confirmBulkDeleteQrs(ids: string[], email: string, code: string): Promise<void> {
  await request('/api/qr/bulk-delete', 'POST', { ids, email, code })
}




export type GithubAppStatus = { connected: boolean; login?: string; avatarUrl?: string; profileUrl?: string; connectedAt?: number }
export type GithubRepository = { id:number; name:string; fullName:string; private:boolean; url:string; description:string|null; defaultBranch:string; owner:string }
export async function getGithubAppStatus(): Promise<GithubAppStatus> { return request('/api/github-app/status') }
export async function beginGithubAppConnect(): Promise<string> { const data=await request('/api/github-app/connect'); return data.url }
export async function getGithubAppRepositories(): Promise<GithubRepository[]> { const data=await request('/api/github-app/repositories'); return data.repositories || [] }
export async function disconnectGithubApp(): Promise<void> { await request('/api/github-app/disconnect','DELETE') }



