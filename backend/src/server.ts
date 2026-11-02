
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes'
import qrRoutes from './routes/qr.routes'
import redirectRoutes from './routes/redirect.routes'
import analyticsRoutes from './routes/analytics.routes'
import githubAppRoutes from './routes/githubApp.routes'
import domainVerificationRoutes from './routes/domainVerification.routes'

import { githubAppCallback } from './controllers/githubApp.controller'

for (const k of [
  'RESEND_API_KEY',
  'OTP_SECRET',
  'FIREBASE_SERVICE_ACCOUNT',
  'FRONTEND_URL',
]) {
  if (!process.env[k]) {
    console.warn(`Warning: ${k} is missing in backend/.env`)
  }
}

const app = express()

app.use(helmet())

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

app.use(express.json({ limit: '100kb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'apleema-qr',
  })
})

// GitHub OAuth callback
app.get('/auth/github/callback', githubAppCallback)

// API routes
app.use('/api/github-app', githubAppRoutes)
app.use('/auth', authRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/domain-verification', domainVerificationRoutes)
app.use('/api/analytics', analyticsRoutes)

// QR redirect
app.use('/r', redirectRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})
