# Inkline Journal

Inkline Journal is a story-first writing platform built with React, TypeScript, Node.js, Express, and PostgreSQL. It is meant for people who want to share lived experiences in a quieter, more thoughtful space.

## Core Features

- Google OAuth sign-in
- Email/password sign-up with SMTP email verification
- Public story discovery through themes and featured stories
- Personal dashboard for drafts, published work, reading list, and notifications
- PostgreSQL-backed persistence with startup migrations and seed content

## Tech Stack

- React
- TypeScript
- Vite
- Node.js
- Express
- PostgreSQL (`pg`)
- `express-session`
- `nodemailer`

## Local Setup

```bash
npm install
cp .env.example .env
```

Create the local database before starting the app:

```sql
CREATE DATABASE inkline_journal_local;
```

Then edit `.env` with your real local values and start the app:

```bash
npm run dev
```

Local URLs:

```text
client: http://localhost:5173
server: http://localhost:3001
```

Important:

- edit `.env`, not `.env.example`
- `DATABASE_URL` must point to your local or hosted Postgres database
- if your Postgres password contains `#`, `@`, or similar characters, URL-encode it in `DATABASE_URL`
- email/password sign-up stays disabled until SMTP values are configured

## Environment

Required:

- `DATABASE_URL`
- `SESSION_SECRET`

Common:

- `APP_BASE_URL`
- `CLIENT_BASE_URL`
- `PGSSL`
- `SUPPORT_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `SMTP_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `EMAIL_VERIFY_TTL_HOURS`

## Google OAuth Notes

For Google Cloud OAuth client setup:

- Authorized JavaScript origins:
  - `https://inklinejournal.com`
  - `http://localhost:5173`
- Authorized redirect URIs:
  - `https://inklinejournal.com/api/auth/google/callback`
  - `http://localhost:3001/api/auth/google/callback`

The app starts Google sign-in at:

```text
/api/auth/google
```

Google redirects back to:

```text
/api/auth/google/callback
```

## Email Verification Flow

Email/password accounts are not signed in immediately after registration.

Flow:

1. user signs up with name, email, and password
2. the server creates an unverified account
3. Inkline sends a verification email from `SMTP_FROM`
4. the user clicks the verification link
5. only then can the user sign in with email/password

Google sign-in still relies on Google's verified email state.

## Production Deployment

Deployment notes for GCP Cloud Run with Neon live in:

- [`deploy/gcp-neon.md`](/Users/rithwik/Documents/Codex/2026-06-27/g/inkline-journal/deploy/gcp-neon.md)
- [`deploy/cloud-run.env.example`](/Users/rithwik/Documents/Codex/2026-06-27/g/inkline-journal/deploy/cloud-run.env.example)

## Data Storage

The app auto-creates and migrates these main tables on startup:

- `journal_users`
- `themes`
- `prompts`
- `stories`
- `comments`
- `reading_list`
- `notifications`
- `email_verification_tokens`
- `user_sessions`
