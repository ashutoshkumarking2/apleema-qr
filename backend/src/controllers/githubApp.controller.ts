import type { Request, Response } from 'express'
import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto'
import { db } from '../config/firebaseAdmin'

const stateCollection = db.collection('github_app_oauth_states')
const connectionCollection = db.collection('github_app_connections')
function encryptionKey(): Buffer {
  const raw = process.env.GITHUB_TOKEN_ENCRYPTION_KEY || ''
  let key: Buffer
  try { key = Buffer.from(raw, 'base64') } catch { key = Buffer.alloc(0) }
  if (key.length !== 32) throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY must be base64 for exactly 32 bytes.')
  return key
}
function encrypt(value: string): string {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]); const tag = cipher.getAuthTag()
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join('.')
}
function decrypt(value: string): string {
  const [iv, tag, data] = value.split('.')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8')
}
function frontendUrl() { return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '') }
export async function startGithubAppConnect(req: Request, res: Response) {
  try {
    const clientId = process.env.GITHUB_APP_CLIENT_ID
    if (!clientId || !process.env.GITHUB_APP_CLIENT_SECRET || !process.env.GITHUB_APP_CALLBACK_URL) return res.status(500).json({ error: 'GitHub App environment configuration is incomplete.' })
    const uid = req.user?.uid
    if (!uid) return res.status(401).json({ error: 'Not logged in.' })
    const state = randomBytes(32).toString('hex')
    await stateCollection.doc(createHash('sha256').update(state).digest('hex')).set({ uid, createdAt: Date.now(), expiresAt: Date.now() + 10 * 60 * 1000 })
    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', clientId); url.searchParams.set('redirect_uri', process.env.GITHUB_APP_CALLBACK_URL!); url.searchParams.set('state', state)
    res.json({ url: url.toString() })
  } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : 'Could not start GitHub connection.' }) }
}
export async function githubAppCallback(req: Request, res: Response) {
  const fail = (message: string) => res.redirect(`${frontendUrl()}/settings?github=error&message=${encodeURIComponent(message)}`)
  try {
    if (req.query.error) return fail('GitHub authorization was cancelled.')
    const code = String(req.query.code || ''); const state = String(req.query.state || '')
    if (!code || !state) return fail('GitHub did not return a valid authorization code.')
    const stateRef = stateCollection.doc(createHash('sha256').update(state).digest('hex'))
    const stateSnap = await stateRef.get(); if (!stateSnap.exists) return fail('GitHub connection expired. Please try again.')
    const stateData = stateSnap.data()!; await stateRef.delete()
    if (stateData.expiresAt < Date.now()) return fail('GitHub connection expired. Please try again.')
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: process.env.GITHUB_APP_CLIENT_ID, client_secret: process.env.GITHUB_APP_CLIENT_SECRET, code, redirect_uri: process.env.GITHUB_APP_CALLBACK_URL }) })
    const tokenData = await tokenResponse.json() as { access_token?: string; error_description?: string }
    if (!tokenResponse.ok || !tokenData.access_token) return fail(tokenData.error_description || 'GitHub token exchange failed.')
    const profileResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Apleema-QR-Generator' } })
    if (!profileResponse.ok) return fail('Could not read your GitHub profile.')
    const profile = await profileResponse.json() as { id: number; login: string; avatar_url?: string; html_url?: string }
    await connectionCollection.doc(stateData.uid).set({ uid: stateData.uid, githubUserId: profile.id, login: profile.login, avatarUrl: profile.avatar_url || '', profileUrl: profile.html_url || '', encryptedAccessToken: encrypt(tokenData.access_token), connectedAt: Date.now(), updatedAt: Date.now() })
    return res.redirect(`${frontendUrl()}/settings?github=connected`)
  } catch (e) { return fail(e instanceof Error ? e.message : 'GitHub connection failed.') }
}
export async function githubAppStatus(req: Request, res: Response) {
  try { const snap = await connectionCollection.doc(req.user!.uid).get(); if (!snap.exists) return res.json({ connected: false }); const d=snap.data()!; return res.json({ connected: true, login:d.login, avatarUrl:d.avatarUrl, profileUrl:d.profileUrl, connectedAt:d.connectedAt }) }
  catch { return res.status(500).json({ error: 'Could not load GitHub connection.' }) }
}
export async function disconnectGithubApp(req: Request, res: Response) {
  try { await connectionCollection.doc(req.user!.uid).delete(); return res.json({ disconnected: true }) }
  catch { return res.status(500).json({ error: 'Could not disconnect GitHub.' }) }
}

export async function githubAppRepositories(req: Request, res: Response) {
  try {
    const snap = await connectionCollection.doc(req.user!.uid).get()
    if (!snap.exists) return res.status(409).json({ error: 'Connect your GitHub account first.' })
    const token = decrypt(snap.data()!.encryptedAccessToken)
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Apleema-QR-Generator' } })
    if (response.status === 401) { await connectionCollection.doc(req.user!.uid).delete(); return res.status(401).json({ error: 'GitHub authorization expired. Connect again.' }) }
    if (!response.ok) return res.status(502).json({ error: 'GitHub repository request failed.' })
    const repos = await response.json() as Array<{ id:number; name:string; full_name:string; private:boolean; html_url:string; description:string|null; default_branch:string; owner:{login:string} }>
    return res.json({ repositories: repos.map(r => ({ id:r.id, name:r.name, fullName:r.full_name, private:r.private, url:r.html_url, description:r.description, defaultBranch:r.default_branch, owner:r.owner.login })) })
  } catch (e) { return res.status(500).json({ error: e instanceof Error ? e.message : 'Could not load repositories.' }) }
}


export async function verifyGithubRepositoryAccess(
  uid: string,
  repositoryId: number
) {
  if (!Number.isSafeInteger(repositoryId) || repositoryId <= 0) {
    return null
  }

  const snap = await connectionCollection.doc(uid).get()

  if (!snap.exists) {
    return null
  }

  const token = decrypt(snap.data()!.encryptedAccessToken)

  const response = await fetch(
    `https://api.github.com/repositories/${repositoryId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Apleema-QR-Generator',
      },
    }
  )

  if (!response.ok) {
    return null
  }

  const repo = await response.json() as {
    id: number
    name: string
    full_name: string
    private: boolean
    html_url: string
    default_branch: string
    owner: { login: string }
  }

  if (repo.id !== repositoryId) {
    return null
  }

  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    url: repo.html_url,
    defaultBranch: repo.default_branch,
    owner: repo.owner.login,
  }
}
