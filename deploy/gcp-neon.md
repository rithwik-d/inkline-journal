# Deploy Inkline Journal to GCP Cloud Run with Neon

This app is set up to run as a single container on Cloud Run:

- Vite builds the client into `dist/client`
- TypeScript builds the server into `dist/server/server`
- Express serves the built client in production
- Postgres connections go to Neon through `DATABASE_URL`

## 1. Prerequisites

- A Google Cloud project with billing enabled
- `gcloud` installed and authenticated
- A Neon project with a database, role, and connection string
- A Google OAuth web client

## 2. Neon setup

In Neon:

1. Open your project.
2. Copy the pooled connection string from **Connect**.
3. Use that value as `DATABASE_URL`.

Example shape:

```text
postgresql://USERNAME:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/DATABASE?sslmode=require&channel_binding=require
```

## 3. OAuth values

For production, your Google OAuth client should include:

- Authorized origin:
  - `https://YOUR_DOMAIN`
- Authorized redirect URI:
  - `https://YOUR_DOMAIN/api/auth/google/callback`

If you use the default Cloud Run URL first, use that URL instead of the custom domain.

## 4. Prepare env vars

Copy:

```bash
cp deploy/cloud-run.env.example deploy/cloud-run.env
```

Then fill in the real values.

If you want email/password sign-up in production, fill in the SMTP values too. Without them, Google sign-in will still work, but email sign-up will stay disabled.

## 5. Build and deploy

Set your project and region:

```bash
gcloud config set project YOUR_GCP_PROJECT_ID
gcloud config set run/region us-central1
```

Build the container:

```bash
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/inkline-journal
```

Deploy to Cloud Run:

```bash
gcloud run deploy inkline-journal \
  --image gcr.io/YOUR_GCP_PROJECT_ID/inkline-journal \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --env-vars-file deploy/cloud-run.env
```

## 6. Seed the public content

After deployment, the app initializes its tables on startup. If the service comes up successfully, the seeded public stories are inserted automatically.

If you want to seed locally before deployment:

```bash
npm run seed:content
```

## 7. Recommended follow-up

- Map your custom domain to the Cloud Run service
- Update Google OAuth to use the final production domain
- Move sensitive env vars to Secret Manager
- Rotate the session secret after first deploy if needed

## 8. Required env vars

- `NODE_ENV=production`
- `APP_BASE_URL`
- `CLIENT_BASE_URL`
- `SESSION_SECRET`
- `SESSION_COOKIE_SECURE=true`
- `DATABASE_URL`
- `PGSSL=true`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `SUPPORT_EMAIL=support@inklinejournal.com`

For email/password verification:

- `SMTP_FROM=support@inklinejournal.com`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `EMAIL_VERIFY_TTL_HOURS=24`
