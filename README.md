# Inkline Journal

Inkline Journal is a public blog platform built with Node.js, Express, EJS, and Postgres.

## Core Features

- Public home feed where everyone can read published stories
- User signup with email + password
- One-time email verification link during signup
- Password-based sign-in after verification
- Dashboard where logged-in users manage their own stories
- Create, edit, publish/unpublish, and delete personal posts
- Persistent data storage in Postgres
- Responsive premium UI tuned for desktop and mobile

## Tech Stack

- Node.js
- Express.js
- EJS
- Postgres (`pg`)
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

## Environment

Required:

- `DATABASE_URL` (Postgres connection string)
- `SESSION_SECRET`

Optional:

- `PGSSL` (`true` for hosted SSL-required Postgres providers, otherwise `false`)
- `APP_BASE_URL` (for verification links)
- `EMAIL_VERIFY_TTL_HOURS`
- SMTP variables for email delivery

## Verification Flow

- On signup, the app emails a one-time verification link.
- User clicks the link and is redirected to login.
- Login works with email + password after verification.

## Data Storage

- Postgres tables are auto-created on startup.
- Data is persistent and can be managed via `psql`, pgAdmin, or your cloud provider dashboard.
