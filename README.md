# Inkline Journal

Inkline Journal is a public blog platform built with Node.js, Express, EJS, and Postgres.

## Core Features

- Public home feed where everyone can read published stories
- User signup with email + password
- Password-based sign-in
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

## Data Storage

- Postgres tables are auto-created on startup.
- Data is persistent and can be managed via `psql`, pgAdmin, or your cloud provider dashboard.
