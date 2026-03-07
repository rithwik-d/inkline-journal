# Inkline Journal

Inkline Journal is a public blog platform built with Node.js, Express, EJS, and SQLite.

## Core Features

- Public home feed where everyone can read published stories
- User signup with email + password
- One-time email verification link during signup
- Password-based sign-in after email is verified
- Dashboard where logged-in users manage their own stories
- Create, edit, publish/unpublish, and delete personal posts
- Persistent data storage in local SQLite (`data/inkline.db`)
- Responsive premium UI tuned for desktop and mobile

## Tech Stack

- Node.js
- Express.js
- EJS
- SQLite (`better-sqlite3`)
- `express-session`
- `bcryptjs`
- `nodemailer`
- `method-override`

## Setup

```bash
npm install
cp .env.example .env
npm start
```

App runs at:

```text
http://localhost:3000
```

For development auto-reload:

```bash
npm run dev
```

## Verification Email Behavior

- If SMTP env vars are configured in `.env`, signup verification links are emailed to users.
- If SMTP env vars are missing, verification links run in local dev mode and are printed in server terminal logs.

## Data Storage

- SQLite database file: `data/inkline.db`
- The app auto-creates tables on startup.
- On Vercel, SQLite runs from `/tmp/inkline-data/inkline.db` (writable but ephemeral).
