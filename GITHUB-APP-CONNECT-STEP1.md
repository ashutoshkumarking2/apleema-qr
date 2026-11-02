# Step 1 — GitHub App Connect

This patch adds a separate GitHub App OAuth connection in Settings. It does not alter Firebase GitHub sign-in or OTP.

Required backend/.env variables (keep values private):
- GITHUB_APP_CLIENT_ID
- GITHUB_APP_CLIENT_SECRET
- GITHUB_APP_CALLBACK_URL=http://localhost:5000/auth/github/callback
- GITHUB_TOKEN_ENCRYPTION_KEY (base64 encoding of exactly 32 random bytes)
- FRONTEND_URL=http://localhost:5173

The callback URL must exactly match the GitHub App user authorization callback. Firebase Admin credentials must be configured because connection records and one-time OAuth state are stored in Firestore.

This is Step 1 only: connect/disconnect and list public/private repositories. Repository selection persistence, domain ownership verification, and QR create/update enforcement are intentionally not included yet. Repository listing is limited to the first 100 results in this step.
