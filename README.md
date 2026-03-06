# Inkline Journal

Inkline Journal is a public blog platform built with Node.js, Express, EJS, and SQLite.

## Core Features

- Public home feed where everyone can read published stories
- User signup with email + password
- Two-step login: credentials + OTP verification via email
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

## OTP Email Behavior

- If SMTP env vars are configured in `.env`, OTP is sent to user email.
- If SMTP env vars are missing, OTP runs in local dev mode and is printed in server terminal logs.

## Data Storage

- SQLite database file: `data/inkline.db`
- The app auto-creates tables on startup.
