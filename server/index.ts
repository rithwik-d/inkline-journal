import "dotenv/config";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type NextFunction, type Request, type Response } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import nodemailer from "nodemailer";
import { Pool, type PoolConfig, type QueryResultRow } from "pg";
import { seedAuthors, seedStories, type SeedAuthor } from "./seed-public-stories.js";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    oauthState?: string;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3001;
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || (isProduction ? APP_BASE_URL : "http://localhost:5173");
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@inklinejournal.com";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${APP_BASE_URL}/api/auth/google/callback`;
const SMTP_HOST = process.env.SMTP_HOST?.trim() || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER?.trim() || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM?.trim() || SUPPORT_EMAIL;
const SMTP_SECURE = readBooleanFlag(process.env.SMTP_SECURE, SMTP_PORT === 465);
const EMAIL_VERIFICATION_TTL_HOURS = Number(process.env.EMAIL_VERIFY_TTL_HOURS || 24);
const EMAIL_VERIFICATION_LAUNCH_AT = "2026-07-01T00:00:00.000Z";

type StoryStatus = "draft" | "published" | "archived";
type ThemeCatalogItem = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  gradientFrom: string;
  gradientTo: string;
  sortOrder: number;
};

type PromptCatalogItem = {
  title: string;
  body: string;
  suggestedTheme: string | null;
  tone: string | null;
};

const themeCatalog: ThemeCatalogItem[] = [
  {
    slug: "grief",
    name: "Grief",
    description: "Losses we carry, named and unnamed.",
    longDescription: "Grief is rarely linear. These stories sit with loss and refuse the pressure to resolve it neatly.",
    gradientFrom: "#E8C5C0",
    gradientTo: "#C2956B",
    sortOrder: 1,
  },
  {
    slug: "family",
    name: "Family",
    description: "Inheritance, distance, return.",
    longDescription: "What gets passed down, what gets left, what gets renamed. The people who made us, and what we are still making of them.",
    gradientFrom: "#F1D9CC",
    gradientTo: "#C9B99A",
    sortOrder: 2,
  },
  {
    slug: "identity",
    name: "Identity",
    description: "Becoming, unbecoming, naming yourself.",
    longDescription: "Coming into a self. Letting one go. The quiet rebellions and the loud ones.",
    gradientFrom: "#D7E3CE",
    gradientTo: "#7D9B76",
    sortOrder: 3,
  },
  {
    slug: "healing",
    name: "Healing",
    description: "The long, ordinary work of repair.",
    longDescription: "Not the inspirational arc. The slow, uneven, deeply specific work of getting better.",
    gradientFrom: "#E8E1D5",
    gradientTo: "#A8C0A0",
    sortOrder: 4,
  },
  {
    slug: "migration",
    name: "Migration",
    description: "Leaving, arriving, the in-between.",
    longDescription: "The places we left and the ones we tried to make home. The languages that fit and the ones that did not.",
    gradientFrom: "#F5E6D3",
    gradientTo: "#C2654A",
    sortOrder: 5,
  },
  {
    slug: "first-love",
    name: "First Love",
    description: "The shape it left in you.",
    longDescription: "Not nostalgic. Just true. The first time someone changed the temperature of a room you were in.",
    gradientFrom: "#F8E8EE",
    gradientTo: "#E88AAB",
    sortOrder: 6,
  },
  {
    slug: "friendship",
    name: "Friendship",
    description: "The chosen ones, the ones who left.",
    longDescription: "The friendships that held. The ones that quietly dissolved. The ones that came back, different.",
    gradientFrom: "#E8C07A",
    gradientTo: "#A0522D",
    sortOrder: 7,
  },
  {
    slug: "failure",
    name: "Failure",
    description: "Quiet collapses, what they taught.",
    longDescription: "Not as a stepping stone. As a thing that happened. As something to be honest about.",
    gradientFrom: "#DCD4C7",
    gradientTo: "#6B5849",
    sortOrder: 8,
  },
  {
    slug: "motherhood",
    name: "Motherhood",
    description: "Becoming someone's person.",
    longDescription: "All the parts of it. The wonder, the boredom, the rage, the grace.",
    gradientFrom: "#F4D5C5",
    gradientTo: "#C45C7C",
    sortOrder: 9,
  },
  {
    slug: "faith",
    name: "Faith",
    description: "What you keep believing in, anyway.",
    longDescription: "Religious, secular, complicated. The things we hold on to when we cannot explain why.",
    gradientFrom: "#EDE5D2",
    gradientTo: "#8B7355",
    sortOrder: 10,
  },
];

const promptCatalog: PromptCatalogItem[] = [
  {
    title: "A turning point",
    body: "Write about a moment that quietly changed the direction of your life.",
    suggestedTheme: "identity",
    tone: "reflective",
  },
  {
    title: "What I never said",
    body: "Tell the story of words you wish you had spoken, or words you are still holding.",
    suggestedTheme: "family",
    tone: "honest",
  },
  {
    title: "Starting over",
    body: "Describe a time you had to begin again, even when you did not feel ready.",
    suggestedTheme: "healing",
    tone: "gentle",
  },
  {
    title: "A small victory",
    body: "Capture a quiet win that mattered deeply, even if no one else noticed.",
    suggestedTheme: "failure",
    tone: "hopeful",
  },
  {
    title: "The place I still carry",
    body: "Write about a place that still lives inside your body, even after you left it.",
    suggestedTheme: "migration",
    tone: "lyrical",
  },
  {
    title: "The body remembers",
    body: "Write from the memory that never quite left your body, even when you stopped speaking about it.",
    suggestedTheme: "healing",
    tone: "intimate",
  },
];

function readBooleanFlag(value: string | undefined, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

const defaultSsl = isProduction;
const shouldUseSsl = readBooleanFlag(process.env.PGSSL, defaultSsl);
const hasConnectionString = Boolean(process.env.DATABASE_URL?.trim());

if (!hasConnectionString) {
  throw new Error("DATABASE_URL is required.");
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (shouldUseSsl) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);
const PgSession = connectPgSimple(session);
const app = express();
const smtpTransport = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

pool.on("error", (error) => {
  console.error("Unexpected Postgres pool error", error);
});

function isEmailPasswordSignUpAvailable() {
  return Boolean(smtpTransport && SMTP_FROM);
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingTimeMinutes(text: string) {
  return Math.max(1, Math.round(wordCount(text) / 220));
}

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `story-${Date.now()}`
  );
}

function excerpt(text: string, maxLength = 180) {
  const clean = text.trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  return `${clean.slice(0, maxLength).trim()}…`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function buildThemeMap() {
  return new Map(themeCatalog.map((theme) => [theme.slug, theme]));
}

const themeMap = buildThemeMap();

async function ensureSeedUser(author: SeedAuthor) {
  const existing = await findUserByEmail(author.email);

  if (existing) {
    return queryOne<UserRow>(
      `
        UPDATE journal_users
        SET display_name = $2,
            bio = $3,
            email_verified = true,
            email_verified_at = COALESCE(email_verified_at, now()),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [existing.id, author.displayName, author.bio],
    );
  }

  const handle = await buildUniqueHandle(author.handle || author.displayName);
  return queryOne<UserRow>(
    `
      INSERT INTO journal_users (email, email_verified, email_verified_at, display_name, handle, bio)
      VALUES (lower($1), true, now(), $2, $3, $4)
      RETURNING *
    `,
    [author.email, author.displayName, handle, author.bio],
  );
}

async function seedPublicStories() {
  const authorIds = new Map<string, string>();

  for (const author of seedAuthors) {
    const user = await ensureSeedUser(author);
    if (user) {
      authorIds.set(author.email.toLowerCase(), user.id);
    }
  }

  for (const story of seedStories) {
    const authorId = authorIds.get(story.authorEmail.toLowerCase());
    if (!authorId) {
      continue;
    }

    const words = wordCount(story.body);
    const readingMinutes = readingTimeMinutes(story.body);

    await pool.query(
      `
        INSERT INTO stories (
          author_id,
          slug,
          title,
          dek,
          body,
          theme,
          content_warning,
          allow_comments,
          status,
          word_count,
          reading_time_minutes,
          is_featured,
          published_at,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'published', $8, $9, $10, $11, $11, $11)
        ON CONFLICT (slug)
        DO UPDATE SET
          author_id = EXCLUDED.author_id,
          title = EXCLUDED.title,
          dek = EXCLUDED.dek,
          body = EXCLUDED.body,
          theme = EXCLUDED.theme,
          content_warning = EXCLUDED.content_warning,
          allow_comments = EXCLUDED.allow_comments,
          status = EXCLUDED.status,
          word_count = EXCLUDED.word_count,
          reading_time_minutes = EXCLUDED.reading_time_minutes,
          is_featured = EXCLUDED.is_featured,
          published_at = EXCLUDED.published_at,
          updated_at = EXCLUDED.updated_at
      `,
      [
        authorId,
        story.slug,
        story.title,
        story.dek,
        story.body,
        story.theme,
        story.contentWarning ?? null,
        words,
        readingMinutes,
        Boolean(story.isFeatured),
        story.publishedAt,
      ],
    );
  }
}

async function initializeDatabase() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS journal_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      email_verified_at TIMESTAMPTZ,
      display_name TEXT NOT NULL,
      handle TEXT UNIQUE NOT NULL,
      bio TEXT,
      google_id TEXT UNIQUE,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    ALTER TABLE journal_users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
  `);
  await pool.query(`
    ALTER TABLE journal_users
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS themes (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT NOT NULL,
      gradient_from TEXT NOT NULL,
      gradient_to TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      suggested_theme TEXT REFERENCES themes(slug) ON DELETE SET NULL,
      tone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id UUID NOT NULL REFERENCES journal_users(id) ON DELETE CASCADE,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL DEFAULT 'Untitled',
      dek TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      theme TEXT REFERENCES themes(slug) ON DELETE SET NULL,
      content_warning TEXT,
      allow_comments BOOLEAN NOT NULL DEFAULT true,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
      prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
      word_count INT NOT NULL DEFAULT 0,
      reading_time_minutes INT NOT NULL DEFAULT 1,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES journal_users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      hidden BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reading_list (
      user_id UUID NOT NULL REFERENCES journal_users(id) ON DELETE CASCADE,
      story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, story_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES journal_users(id) ON DELETE CASCADE,
      actor_id UUID REFERENCES journal_users(id) ON DELETE SET NULL,
      story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'comment',
      message TEXT NOT NULL,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES journal_users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_stories_author_status_updated ON stories(author_id, status, updated_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(status, published_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_stories_theme ON stories(theme, published_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_comments_story_created ON comments(story_id, created_at ASC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_created ON email_verification_tokens(user_id, created_at DESC);
  `);

  await pool.query(
    `
      UPDATE journal_users
      SET email_verified = true,
          email_verified_at = COALESCE(email_verified_at, now()),
          updated_at = now()
      WHERE email_verified = false
        AND (
          google_id IS NOT NULL
          OR email LIKE '%@seed.inklinejournal.local'
          OR (
            password_hash IS NOT NULL
            AND created_at < $1::timestamptz
          )
        )
    `,
    [EMAIL_VERIFICATION_LAUNCH_AT],
  );

  for (const theme of themeCatalog) {
    await pool.query(
      `
        INSERT INTO themes (slug, name, description, long_description, gradient_from, gradient_to, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          long_description = EXCLUDED.long_description,
          gradient_from = EXCLUDED.gradient_from,
          gradient_to = EXCLUDED.gradient_to,
          sort_order = EXCLUDED.sort_order
      `,
      [
        theme.slug,
        theme.name,
        theme.description,
        theme.longDescription,
        theme.gradientFrom,
        theme.gradientTo,
        theme.sortOrder,
      ],
    );
  }

  const promptCountResult = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM prompts`);
  if (Number(promptCountResult.rows[0]?.count ?? 0) === 0) {
    for (const prompt of promptCatalog) {
      await pool.query(
        `
          INSERT INTO prompts (title, body, suggested_theme, tone)
          VALUES ($1, $2, $3, $4)
        `,
        [prompt.title, prompt.body, prompt.suggestedTheme, prompt.tone],
      );
    }
  }

  await seedPublicStories();
}

const dbReadyPromise = initializeDatabase();

type UserRow = {
  id: string;
  email: string;
  password_hash: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  display_name: string;
  handle: string;
  bio: string | null;
  google_id: string | null;
  avatar_url: string | null;
};

type StoryRow = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  theme: string | null;
  content_warning: string | null;
  allow_comments: boolean;
  status: StoryStatus;
  prompt_id: string | null;
  word_count: number;
  reading_time_minutes: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  display_name?: string;
  handle?: string;
  avatar_url?: string | null;
  theme_name?: string | null;
  gradient_from?: string | null;
  gradient_to?: string | null;
  comments_count?: string | number;
  is_saved?: boolean;
};

function userToResponse(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.email_verified,
    displayName: user.display_name,
    handle: user.handle,
    avatarUrl: user.avatar_url,
    bio: user.bio,
  };
}

function storyToPreview(row: StoryRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    dek: row.dek || excerpt(row.body, 90),
    excerpt: excerpt(row.body, 220),
    author: row.display_name ?? "Inkline Writer",
    authorHandle: row.handle ?? "writer",
    authorAvatar: row.avatar_url ?? null,
    theme: row.theme ?? "identity",
    themeName: row.theme_name ?? themeMap.get(row.theme ?? "")?.name ?? "Identity",
    readingTime: row.reading_time_minutes,
    publishedAt: row.published_at ?? row.updated_at,
    coverGradient: [
      row.gradient_from ?? themeMap.get(row.theme ?? "")?.gradientFrom ?? "#F5E6D3",
      row.gradient_to ?? themeMap.get(row.theme ?? "")?.gradientTo ?? "#C2654A",
    ] as [string, string],
    contentWarning: row.content_warning,
    isSaved: Boolean(row.is_saved),
    source: "real" as const,
  };
}

function storyToListItem(row: StoryRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    theme: row.theme,
    themeName: row.theme_name ?? null,
    wordCount: row.word_count,
    readingTimeMinutes: row.reading_time_minutes,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    coverGradient: [
      row.gradient_from ?? themeMap.get(row.theme ?? "")?.gradientFrom ?? "#F5E6D3",
      row.gradient_to ?? themeMap.get(row.theme ?? "")?.gradientTo ?? "#C2654A",
    ] as [string, string],
    allowComments: row.allow_comments,
    commentsCount: Number(row.comments_count ?? 0),
  };
}

async function queryOne<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  const result = await pool.query<T>(sql, params);
  return result.rows[0] ?? null;
}

async function queryAll<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

async function findUserById(userId: string) {
  return queryOne<UserRow>(`SELECT * FROM journal_users WHERE id = $1`, [userId]);
}

async function findUserByEmail(email: string) {
  return queryOne<UserRow>(`SELECT * FROM journal_users WHERE lower(email) = lower($1)`, [email]);
}

async function findUserByGoogleId(googleId: string) {
  return queryOne<UserRow>(`SELECT * FROM journal_users WHERE google_id = $1`, [googleId]);
}

async function buildUniqueHandle(seed: string) {
  const base = (seed || "writer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^$/, "writer")
    .slice(0, 24);

  let attempt = base;
  let counter = 1;

  while (await queryOne(`SELECT 1 FROM journal_users WHERE handle = $1`, [attempt])) {
    counter += 1;
    attempt = `${base}${counter}`;
  }

  return attempt;
}

async function buildUniquePublishedSlug(title: string, storyId: string) {
  const base = slugify(title);
  let attempt = `${base}-${storyId.slice(0, 6)}`;
  let counter = 1;

  while (await queryOne(`SELECT 1 FROM stories WHERE slug = $1 AND id <> $2`, [attempt, storyId])) {
    counter += 1;
    attempt = `${base}-${storyId.slice(0, 6)}-${counter}`;
  }

  return attempt;
}

function hashEmailVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildEmailVerificationUrl(token: string) {
  const url = new URL("/api/auth/verify-email", APP_BASE_URL);
  url.searchParams.set("token", token);
  return url.toString();
}

async function issueEmailVerificationToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashEmailVerificationToken(rawToken);

  await pool.query(
    `
      DELETE FROM email_verification_tokens
      WHERE user_id = $1
    `,
    [userId],
  );

  await pool.query(
    `
      INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, now() + ($3::text || ' hours')::interval)
    `,
    [userId, tokenHash, String(EMAIL_VERIFICATION_TTL_HOURS)],
  );

  return rawToken;
}

async function sendEmailVerificationEmail(user: UserRow, token: string) {
  if (!smtpTransport || !SMTP_FROM) {
    throw new Error("Email signup is not available until SMTP delivery is configured.");
  }

  const verificationUrl = buildEmailVerificationUrl(token);
  await smtpTransport.sendMail({
    from: SMTP_FROM,
    to: user.email,
    replyTo: SUPPORT_EMAIL,
    subject: "Verify your Inkline Journal email",
    text: [
      `Hi ${user.display_name},`,
      "",
      "Please verify your email before signing in to Inkline Journal.",
      "",
      verificationUrl,
      "",
      `This link expires in ${EMAIL_VERIFICATION_TTL_HOURS} hours.`,
      "",
      `If you did not create this account, you can ignore this email or contact ${SUPPORT_EMAIL}.`,
    ].join("\n"),
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #2c2018;">
        <p>Hi ${escapeHtml(user.display_name)},</p>
        <p>Please verify your email before signing in to Inkline Journal.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#c2654a;color:#fff;text-decoration:none;">
            Verify email
          </a>
        </p>
        <p style="word-break:break-all;">${verificationUrl}</p>
        <p>This link expires in ${EMAIL_VERIFICATION_TTL_HOURS} hours.</p>
        <p>If you did not create this account, you can ignore this email or contact ${escapeHtml(SUPPORT_EMAIL)}.</p>
      </div>
    `,
  });
}

async function createUserWithPassword(email: string, displayName: string, password: string) {
  const handle = await buildUniqueHandle(displayName || email.split("@")[0] || "writer");
  const passwordHash = await bcrypt.hash(password, 12);
  return queryOne<UserRow>(
    `
      INSERT INTO journal_users (email, password_hash, email_verified, display_name, handle)
      VALUES (lower($1), $2, false, $3, $4)
      RETURNING *
    `,
    [email, passwordHash, displayName, handle],
  );
}

async function createGoogleUser(email: string, displayName: string, googleId: string, avatarUrl: string | null) {
  const handle = await buildUniqueHandle(displayName || email.split("@")[0] || "writer");
  return queryOne<UserRow>(
    `
      INSERT INTO journal_users (email, email_verified, email_verified_at, display_name, handle, google_id, avatar_url)
      VALUES (lower($1), true, now(), $2, $3, $4, $5)
      RETURNING *
    `,
    [email, displayName, handle, googleId, avatarUrl],
  );
}

async function updateGoogleUser(userId: string, displayName: string, avatarUrl: string | null) {
  return queryOne<UserRow>(
    `
      UPDATE journal_users
      SET display_name = $1, avatar_url = $2, updated_at = now()
      WHERE id = $3
      RETURNING *
    `,
    [displayName, avatarUrl, userId],
  );
}

async function linkGoogleAccount(userId: string, googleId: string, displayName: string, avatarUrl: string | null) {
  return queryOne<UserRow>(
    `
      UPDATE journal_users
      SET google_id = $1, email_verified = true, email_verified_at = COALESCE(email_verified_at, now()), display_name = $2, avatar_url = $3, updated_at = now()
      WHERE id = $4
      RETURNING *
    `,
    [googleId, displayName, avatarUrl, userId],
  );
}

async function getCurrentUser(req: Request) {
  if (!req.session.userId) {
    return null;
  }

  return findUserById(req.session.userId);
}

function assertString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Sign in to continue." });
  }

  return next();
}

function sanitizeStoryInput(payload: Record<string, unknown>) {
  return {
    title: assertString(payload.title).trim().slice(0, 180),
    dek: assertString(payload.dek).trim().slice(0, 220),
    body: assertString(payload.body).trim(),
    theme: assertString(payload.theme).trim() || null,
    contentWarning: assertString(payload.contentWarning).trim() || null,
    allowComments: Boolean(payload.allowComments),
  };
}

function validatePublishableStory(input: ReturnType<typeof sanitizeStoryInput>) {
  if (!input.title) {
    return "Add a title before publishing.";
  }

  if (!input.body) {
    return "Add some writing before publishing.";
  }

  return null;
}

async function getStoryForEditor(storyId: string, authorId: string) {
  return queryOne<StoryRow>(
    `
      SELECT stories.*, themes.name AS theme_name, themes.gradient_from, themes.gradient_to
      FROM stories
      LEFT JOIN themes ON themes.slug = stories.theme
      WHERE stories.id = $1 AND stories.author_id = $2
    `,
    [storyId, authorId],
  );
}

async function getStoryBySlug(slug: string, currentUserId: string | undefined) {
  return queryOne<StoryRow>(
    `
      SELECT
        stories.*,
        journal_users.display_name,
        journal_users.handle,
        journal_users.avatar_url,
        themes.name AS theme_name,
        themes.gradient_from,
        themes.gradient_to,
        EXISTS (
          SELECT 1
          FROM reading_list
          WHERE reading_list.story_id = stories.id
            AND reading_list.user_id = $2
        ) AS is_saved
      FROM stories
      INNER JOIN journal_users ON journal_users.id = stories.author_id
      LEFT JOIN themes ON themes.slug = stories.theme
      WHERE stories.slug = $1 AND stories.status = 'published'
    `,
    [slug, currentUserId ?? null],
  );
}

async function getPublishedStoryPreviews(limit = 12, currentUserId?: string) {
  return queryAll<StoryRow>(
    `
      SELECT
        stories.*,
        journal_users.display_name,
        journal_users.handle,
        journal_users.avatar_url,
        themes.name AS theme_name,
        themes.gradient_from,
        themes.gradient_to,
        EXISTS (
          SELECT 1
          FROM reading_list
          WHERE reading_list.story_id = stories.id
            AND reading_list.user_id = $2
        ) AS is_saved
      FROM stories
      INNER JOIN journal_users ON journal_users.id = stories.author_id
      LEFT JOIN themes ON themes.slug = stories.theme
      WHERE stories.status = 'published'
      ORDER BY stories.is_featured DESC, stories.published_at DESC NULLS LAST, stories.updated_at DESC
      LIMIT $1
    `,
    [limit, currentUserId ?? null],
  );
}

async function getPublishedThemeStories(themeSlug: string, currentUserId?: string) {
  return queryAll<StoryRow>(
    `
      SELECT
        stories.*,
        journal_users.display_name,
        journal_users.handle,
        journal_users.avatar_url,
        themes.name AS theme_name,
        themes.gradient_from,
        themes.gradient_to,
        EXISTS (
          SELECT 1
          FROM reading_list
          WHERE reading_list.story_id = stories.id
            AND reading_list.user_id = $2
        ) AS is_saved
      FROM stories
      INNER JOIN journal_users ON journal_users.id = stories.author_id
      LEFT JOIN themes ON themes.slug = stories.theme
      WHERE stories.status = 'published' AND stories.theme = $1
      ORDER BY stories.published_at DESC NULLS LAST, stories.updated_at DESC
    `,
    [themeSlug, currentUserId ?? null],
  );
}

async function getRelatedStories(themeSlug: string, storyId: string) {
  return queryAll<StoryRow>(
    `
      SELECT
        stories.*,
        journal_users.display_name,
        journal_users.handle,
        journal_users.avatar_url,
        themes.name AS theme_name,
        themes.gradient_from,
        themes.gradient_to
      FROM stories
      INNER JOIN journal_users ON journal_users.id = stories.author_id
      LEFT JOIN themes ON themes.slug = stories.theme
      WHERE stories.status = 'published' AND stories.theme = $1 AND stories.id <> $2
      ORDER BY stories.published_at DESC NULLS LAST
      LIMIT 3
    `,
    [themeSlug, storyId],
  );
}

async function getStoryComments(storyId: string, currentUserId?: string, storyAuthorId?: string) {
  const rows = await queryAll<{
    id: string;
    body: string;
    created_at: string;
    user_id: string;
    display_name: string;
    handle: string;
    avatar_url: string | null;
  }>(
    `
      SELECT comments.id, comments.body, comments.created_at, comments.user_id, journal_users.display_name, journal_users.handle, journal_users.avatar_url
      FROM comments
      INNER JOIN journal_users ON journal_users.id = comments.user_id
      WHERE comments.story_id = $1 AND comments.hidden = false
      ORDER BY comments.created_at ASC
    `,
    [storyId],
  );

  return rows.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
    author: {
      id: comment.user_id,
      displayName: comment.display_name,
      handle: comment.handle,
      avatarUrl: comment.avatar_url,
    },
    canDelete: Boolean(currentUserId && (currentUserId === comment.user_id || currentUserId === storyAuthorId)),
  }));
}

async function listThemesWithCounts() {
  return queryAll<{
    slug: string;
    name: string;
    description: string;
    long_description: string;
    gradient_from: string;
    gradient_to: string;
    sort_order: number;
    count: string;
  }>(
    `
      SELECT
        themes.*,
        COUNT(stories.id)::text AS count
      FROM themes
      LEFT JOIN stories
        ON stories.theme = themes.slug
       AND stories.status = 'published'
      GROUP BY themes.slug
      ORDER BY themes.sort_order ASC
    `,
  );
}

async function listPromptsFromDb() {
  return queryAll<{
    id: string;
    title: string;
    body: string;
    suggested_theme: string | null;
    tone: string | null;
  }>(`SELECT * FROM prompts ORDER BY created_at ASC`);
}

async function getDashboardDataForUser(userId: string) {
  const stories = await queryAll<StoryRow>(
    `
      SELECT
        stories.*,
        themes.name AS theme_name,
        themes.gradient_from,
        themes.gradient_to,
        (
          SELECT COUNT(*)
          FROM comments
          WHERE comments.story_id = stories.id AND comments.hidden = false
        )::text AS comments_count
      FROM stories
      LEFT JOIN themes ON themes.slug = stories.theme
      WHERE stories.author_id = $1
      ORDER BY stories.updated_at DESC
    `,
    [userId],
  );

  const prompts = await listPromptsFromDb();
  const todayPrompt = prompts.length > 0 ? prompts[new Date().getDate() % prompts.length] : null;

  return {
    drafts: stories.filter((story) => story.status === "draft").slice(0, 3).map(storyToListItem),
    published: stories.filter((story) => story.status === "published").slice(0, 3).map(storyToListItem),
    prompts: prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      body: prompt.body,
      suggestedTheme: prompt.suggested_theme,
      tone: prompt.tone,
    })),
    todayPrompt: todayPrompt
      ? {
          id: todayPrompt.id,
          title: todayPrompt.title,
          body: todayPrompt.body,
          suggestedTheme: todayPrompt.suggested_theme,
          tone: todayPrompt.tone,
        }
      : null,
  };
}

async function listStoriesForUser(userId: string, status: StoryStatus) {
  const rows = await queryAll<StoryRow>(
    `
      SELECT
        stories.*,
        themes.name AS theme_name,
        themes.gradient_from,
        themes.gradient_to,
        (
          SELECT COUNT(*)
          FROM comments
          WHERE comments.story_id = stories.id AND comments.hidden = false
        )::text AS comments_count
      FROM stories
      LEFT JOIN themes ON themes.slug = stories.theme
      WHERE stories.author_id = $1 AND stories.status = $2
      ORDER BY stories.updated_at DESC
    `,
    [userId, status],
  );

  return rows.map(storyToListItem);
}

async function getPublicStats() {
  const [storyCountRow, writersRow, themeCountRow, readingMinutesRow] = await Promise.all([
    queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM stories WHERE status = 'published'`),
    queryOne<{ count: string }>(
      `
        SELECT COUNT(DISTINCT author_id)::text AS count
        FROM stories
        WHERE status = 'published'
          AND published_at >= now() - interval '7 days'
      `,
    ),
    queryOne<{ count: string }>(
      `
        SELECT COUNT(DISTINCT theme)::text AS count
        FROM stories
        WHERE status = 'published' AND theme IS NOT NULL
      `,
    ),
    queryOne<{ count: string }>(
      `SELECT COALESCE(SUM(reading_time_minutes), 0)::text AS count FROM stories WHERE status = 'published'`,
    ),
  ]);

  const storyCount = Number(storyCountRow?.count ?? 0);
  const writerCount = Number(writersRow?.count ?? 0);
  const themeCount = Number(themeCountRow?.count ?? 0);
  const readingMinutes = Number(readingMinutesRow?.count ?? 0);

  return [
    { n: formatCount(storyCount || 127), l: "stories shared this month" },
    { n: formatCount(writerCount || 42), l: "writers this week" },
    { n: formatCount(themeCount || 10), l: "active life themes" },
    { n: formatCount(readingMinutes || 8300), l: "minutes spent reading" },
  ];
}

async function createNotificationForComment(storyId: string, actorId: string, message: string) {
  const story = await queryOne<{ author_id: string }>(`SELECT author_id FROM stories WHERE id = $1`, [storyId]);
  if (!story || story.author_id === actorId) {
    return;
  }

  await pool.query(
    `
      INSERT INTO notifications (user_id, actor_id, story_id, type, message)
      VALUES ($1, $2, $3, 'comment', $4)
    `,
    [story.author_id, actorId, storyId, message],
  );
}

function buildGoogleAuthUrl(state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

async function exchangeGoogleCodeForToken(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with status ${response.status}`);
  }

  return response.json() as Promise<{ access_token: string }>;
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google profile lookup failed with status ${response.status}`);
  }

  return response.json() as Promise<{
    email?: string;
    email_verified?: boolean;
    sub?: string;
    name?: string;
    picture?: string;
  }>;
}

function authRedirect(path: string) {
  return `${CLIENT_BASE_URL}${path}`;
}

function authRedirectWithEmail(path: string, email?: string) {
  const url = new URL(path, CLIENT_BASE_URL);
  if (email) {
    url.searchParams.set("email", email);
  }
  return url.toString();
}

async function markUserEmailVerified(userId: string) {
  await pool.query(
    `
      UPDATE journal_users
      SET email_verified = true, email_verified_at = COALESCE(email_verified_at, now()), updated_at = now()
      WHERE id = $1
    `,
    [userId],
  );
}

async function consumeEmailVerificationToken(rawToken: string) {
  const tokenHash = hashEmailVerificationToken(rawToken);
  return queryOne<{
    id: string;
    user_id: string;
    email: string;
    display_name: string;
    expired: boolean;
    already_used: boolean;
    already_verified: boolean;
  }>(
    `
      SELECT
        email_verification_tokens.id,
        email_verification_tokens.user_id,
        journal_users.email,
        journal_users.display_name,
        email_verification_tokens.expires_at < now() AS expired,
        email_verification_tokens.consumed_at IS NOT NULL AS already_used,
        journal_users.email_verified AS already_verified
      FROM email_verification_tokens
      INNER JOIN journal_users ON journal_users.id = email_verification_tokens.user_id
      WHERE email_verification_tokens.token_hash = $1
    `,
    [tokenHash],
  );
}

function beginGoogleAuth(req: Request, res: Response) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(authRedirect("/auth?error=google_not_configured"));
  }

  const state = crypto.randomBytes(24).toString("hex");
  req.session.oauthState = state;
  res.redirect(buildGoogleAuthUrl(state));
}

async function finishGoogleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const returnedState = assertString(req.query.state);
    const storedState = req.session.oauthState ?? "";
    delete req.session.oauthState;

    if (!returnedState || returnedState !== storedState) {
      return res.redirect(authRedirect("/auth?error=google_state"));
    }

    if (req.query.error) {
      return res.redirect(authRedirect("/auth?error=google_cancelled"));
    }

    const code = assertString(req.query.code).trim();
    if (!code) {
      return res.redirect(authRedirect("/auth?error=google_code"));
    }

    const tokenResult = await exchangeGoogleCodeForToken(code);
    const profile = await fetchGoogleProfile(tokenResult.access_token);

    if (!profile.email || !profile.email_verified || !profile.sub) {
      return res.redirect(authRedirect("/auth?error=google_email"));
    }

    const displayName = profile.name?.trim() || profile.email.split("@")[0];
    const avatarUrl = profile.picture ?? null;
    let user = await findUserByGoogleId(profile.sub);

    if (user) {
      user = await updateGoogleUser(user.id, displayName, avatarUrl);
    } else {
      const existingUser = await findUserByEmail(profile.email);
      if (existingUser) {
        user = await linkGoogleAccount(existingUser.id, profile.sub, displayName, avatarUrl);
      } else {
        user = await createGoogleUser(profile.email, displayName, profile.sub, avatarUrl);
      }
    }

    if (!user) {
      return res.redirect(authRedirect("/auth?error=google_account"));
    }

    req.session.userId = user.id;
    res.redirect(authRedirect("/app"));
  } catch (error) {
    next(error);
  }
}

app.set("trust proxy", 1);
app.use(express.json());
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    name: "inkline.sid",
    secret: process.env.SESSION_SECRET || "replace-this-local-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: readBooleanFlag(process.env.SESSION_COOKIE_SECURE, isProduction),
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(async (_req, _res, next) => {
  try {
    await dbReadyPromise;
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/session", async (req, res, next) => {
  try {
    const user = await getCurrentUser(req);
    res.json({ user: user ? userToResponse(user) : null });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/verify-email", async (req, res, next) => {
  try {
    const token = assertString(req.query.token).trim();
    if (!token) {
      return res.redirect(authRedirect("/auth?mode=signin&verified=invalid"));
    }

    const verification = await consumeEmailVerificationToken(token);
    if (!verification) {
      return res.redirect(authRedirect("/auth?mode=signin&verified=invalid"));
    }

    if (verification.expired) {
      return res.redirect(authRedirectWithEmail("/auth?mode=signin&verified=invalid", verification.email));
    }

    if (verification.already_used || verification.already_verified) {
      return res.redirect(authRedirectWithEmail("/auth?mode=signin&verified=success", verification.email));
    }

    if (!verification.already_verified) {
      await markUserEmailVerified(verification.user_id);
    }

    await pool.query(
      `
        UPDATE email_verification_tokens
        SET consumed_at = now()
        WHERE id = $1
      `,
      [verification.id],
    );

    return res.redirect(authRedirectWithEmail("/auth?mode=signin&verified=success", verification.email));
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/signup", async (req, res, next) => {
  try {
    const email = assertString(req.body.email).trim().toLowerCase();
    const displayName = assertString(req.body.displayName).trim();
    const password = assertString(req.body.password);

    if (!email || !displayName || password.length < 6) {
      return res.status(400).json({ message: "Enter a name, email, and password with at least 6 characters." });
    }

    if (!isEmailPasswordSignUpAvailable()) {
      return res.status(503).json({
        message: "Email signup is not available until SMTP delivery is configured.",
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      if (!existing.email_verified && existing.password_hash) {
        const token = await issueEmailVerificationToken(existing.id);
        await sendEmailVerificationEmail(existing, token);
        return res.status(200).json({
          requiresEmailVerification: true,
          email: existing.email,
          message: "That account is waiting for verification. We sent you a fresh link.",
        });
      }

      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const user = await createUserWithPassword(email, displayName, password);
    if (!user) {
      return res.status(500).json({ message: "Could not create your account." });
    }

    const token = await issueEmailVerificationToken(user.id);
    await sendEmailVerificationEmail(user, token);

    res.status(201).json({
      requiresEmailVerification: true,
      email: user.email,
      message: "Check your inbox to verify your email before signing in.",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/resend-verification", async (req, res, next) => {
  try {
    const email = assertString(req.body.email).trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Enter your email first." });
    }

    if (!isEmailPasswordSignUpAvailable()) {
      return res.status(503).json({
        message: "Email delivery is not configured yet.",
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.json({ message: "If that email exists, a verification link has been sent." });
    }

    if (user.email_verified) {
      return res.json({ message: "That email is already verified. You can sign in now." });
    }

    const token = await issueEmailVerificationToken(user.id);
    await sendEmailVerificationEmail(user, token);

    res.json({ message: "A fresh verification link is on its way." });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = assertString(req.body.email).trim().toLowerCase();
    const password = assertString(req.body.password);
    const user = await findUserByEmail(email);

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        message: "Verify your email before signing in.",
      });
    }

    req.session.userId = user.id;
    res.json({ user: userToResponse(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("inkline.sid");
    res.status(204).end();
  });
});

app.get("/api/auth/google", beginGoogleAuth);
app.get("/api/auth/google/callback", finishGoogleAuth);

app.get("/api/themes", async (_req, res, next) => {
  try {
    const themes = await listThemesWithCounts();
    res.json({
      themes: themes.map((theme) => ({
        slug: theme.slug,
        name: theme.name,
        description: theme.description,
        longDescription: theme.long_description,
        gradientFrom: theme.gradient_from,
        gradientTo: theme.gradient_to,
        sortOrder: theme.sort_order,
        count: Number(theme.count),
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/prompts", async (_req, res, next) => {
  try {
    const prompts = await listPromptsFromDb();
    res.json({
      prompts: prompts.map((prompt) => ({
        id: prompt.id,
        title: prompt.title,
        body: prompt.body,
        suggestedTheme: prompt.suggested_theme,
        tone: prompt.tone,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/public/stories", async (req, res, next) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 40)
      : 12;
    const stories = await getPublishedStoryPreviews(limit, req.session.userId);
    const stats = await getPublicStats();
    res.json({ stories: stories.map(storyToPreview), stats });
  } catch (error) {
    next(error);
  }
});

app.get("/api/public/themes/:slug", async (req, res, next) => {
  try {
    const themeSlug = assertString(req.params.slug);
    const stories = await getPublishedThemeStories(themeSlug, req.session.userId);
    res.json({ stories: stories.map(storyToPreview) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/public/stories/:slug", async (req, res, next) => {
  try {
    const storySlug = assertString(req.params.slug);
    const story = await getStoryBySlug(storySlug, req.session.userId);
    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    const comments = await getStoryComments(story.id, req.session.userId, story.author_id);
    const related = story.theme ? await getRelatedStories(story.theme, story.id) : [];

    res.json({
      story: {
        ...storyToPreview(story),
        id: story.id,
        body: story.body,
        authorId: story.author_id,
        updatedAt: story.updated_at,
        allowComments: story.allow_comments,
      },
      comments,
      related: related.map(storyToPreview),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/public/stories/:slug/comments", requireAuth, async (req, res, next) => {
  try {
    const storySlug = assertString(req.params.slug);
    const story = await getStoryBySlug(storySlug, req.session.userId);
    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    if (!story.allow_comments) {
      return res.status(400).json({ message: "Comments are closed on this story." });
    }

    const body = assertString(req.body.body).trim();
    if (!body) {
      return res.status(400).json({ message: "Write something before posting a comment." });
    }

    await pool.query(
      `
        INSERT INTO comments (story_id, user_id, body)
        VALUES ($1, $2, $3)
      `,
      [story.id, req.session.userId, body.slice(0, 2000)],
    );

    const currentUser = await findUserById(req.session.userId!);
    if (currentUser) {
      await createNotificationForComment(
        story.id,
        currentUser.id,
        `${currentUser.display_name} left a comment on "${story.title}".`,
      );
    }

    const comments = await getStoryComments(story.id, req.session.userId, story.author_id);
    res.status(201).json({ comments });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/comments/:id", requireAuth, async (req, res, next) => {
  try {
    const commentId = assertString(req.params.id);
    const comment = await queryOne<{ id: string; user_id: string; story_id: string }>(
      `SELECT id, user_id, story_id FROM comments WHERE id = $1`,
      [commentId],
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const story = await queryOne<{ author_id: string }>(`SELECT author_id FROM stories WHERE id = $1`, [comment.story_id]);
    const canDelete = comment.user_id === req.session.userId || story?.author_id === req.session.userId;

    if (!canDelete) {
      return res.status(403).json({ message: "You can only remove comments on your own writing." });
    }

    await pool.query(`DELETE FROM comments WHERE id = $1`, [comment.id]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/app/dashboard", requireAuth, async (req, res, next) => {
  try {
    const data = await getDashboardDataForUser(req.session.userId!);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/stories", requireAuth, async (req, res, next) => {
  try {
    const status = assertString(req.query.status, "draft") as StoryStatus;
    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid story status." });
    }

    const stories = await listStoriesForUser(req.session.userId!, status);
    res.json({ stories });
  } catch (error) {
    next(error);
  }
});

app.post("/api/stories", requireAuth, async (req, res, next) => {
  try {
    const promptId = assertString(req.body.promptId).trim() || null;
    let prompt:
      | {
          id: string;
          title: string;
          suggested_theme: string | null;
        }
      | null = null;

    if (promptId) {
      prompt = await queryOne<{ id: string; title: string; suggested_theme: string | null }>(
        `SELECT id, title, suggested_theme FROM prompts WHERE id = $1`,
        [promptId],
      );
    }

    const story = await queryOne<{ id: string }>(
      `
        INSERT INTO stories (
          author_id, slug, title, dek, body, theme, content_warning, allow_comments, status, prompt_id, word_count, reading_time_minutes
        )
        VALUES ($1, $2, $3, '', '', $4, null, true, 'draft', $5, 0, 1)
        RETURNING id
      `,
      [
        req.session.userId,
        `untitled-${Date.now()}`,
        prompt?.title ?? "Untitled",
        prompt?.suggested_theme ?? null,
        prompt?.id ?? null,
      ],
    );

    res.status(201).json({ storyId: story?.id });
  } catch (error) {
    next(error);
  }
});

app.get("/api/stories/:id", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.params.id);
    const story = await getStoryForEditor(storyId, req.session.userId!);
    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    let prompt: { id: string; title: string; body: string; suggested_theme: string | null; tone: string | null } | null = null;
    if (story.prompt_id) {
      prompt = await queryOne<{ id: string; title: string; body: string; suggested_theme: string | null; tone: string | null }>(
        `SELECT id, title, body, suggested_theme, tone FROM prompts WHERE id = $1`,
        [story.prompt_id],
      );
    }

    res.json({
      story: {
        id: story.id,
        slug: story.slug,
        title: story.title,
        dek: story.dek,
        body: story.body,
        theme: story.theme,
        contentWarning: story.content_warning,
        allowComments: story.allow_comments,
        status: story.status,
        wordCount: story.word_count,
        readingTimeMinutes: story.reading_time_minutes,
        updatedAt: story.updated_at,
        publishedAt: story.published_at,
        prompt: prompt
          ? {
              id: prompt.id,
              title: prompt.title,
              body: prompt.body,
              suggestedTheme: prompt.suggested_theme,
              tone: prompt.tone,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/stories/:id", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.params.id);
    const existing = await getStoryForEditor(storyId, req.session.userId!);
    if (!existing) {
      return res.status(404).json({ message: "Story not found." });
    }

    const input = sanitizeStoryInput(req.body as Record<string, unknown>);
    const wc = wordCount(input.body);
    const rt = readingTimeMinutes(input.body);

    const story = await queryOne<StoryRow>(
      `
        UPDATE stories
        SET
          title = $1,
          dek = $2,
          body = $3,
          theme = $4,
          content_warning = $5,
          allow_comments = $6,
          word_count = $7,
          reading_time_minutes = $8,
          updated_at = now()
        WHERE id = $9 AND author_id = $10
        RETURNING *
      `,
      [
        input.title || "Untitled",
        input.dek,
        input.body,
        input.theme,
        input.contentWarning,
        input.allowComments,
        wc,
        rt,
        storyId,
        req.session.userId,
      ],
    );

    res.json({
      story: {
        id: story!.id,
        slug: story!.slug,
        title: story!.title,
        dek: story!.dek,
        body: story!.body,
        theme: story!.theme,
        contentWarning: story!.content_warning,
        allowComments: story!.allow_comments,
        status: story!.status,
        wordCount: story!.word_count,
        readingTimeMinutes: story!.reading_time_minutes,
        updatedAt: story!.updated_at,
        publishedAt: story!.published_at,
        prompt: null,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/stories/:id/publish", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.params.id);
    const story = await getStoryForEditor(storyId, req.session.userId!);
    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    const validationError = validatePublishableStory({
      title: story.title,
      dek: story.dek,
      body: story.body,
      theme: story.theme,
      contentWarning: story.content_warning,
      allowComments: story.allow_comments,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const uniqueSlug = await buildUniquePublishedSlug(story.title, story.id);
    const updated = await queryOne<StoryRow>(
      `
        UPDATE stories
        SET
          slug = $1,
          status = 'published',
          published_at = now(),
          updated_at = now()
        WHERE id = $2 AND author_id = $3
        RETURNING *
      `,
      [uniqueSlug, story.id, req.session.userId],
    );

    res.json({
      story: {
        id: updated!.id,
        slug: updated!.slug,
        title: updated!.title,
        dek: updated!.dek,
        body: updated!.body,
        theme: updated!.theme,
        contentWarning: updated!.content_warning,
        allowComments: updated!.allow_comments,
        status: updated!.status,
        wordCount: updated!.word_count,
        readingTimeMinutes: updated!.reading_time_minutes,
        updatedAt: updated!.updated_at,
        publishedAt: updated!.published_at,
        prompt: null,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/stories/:id/archive", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.params.id);
    const updated = await queryOne<StoryRow>(
      `
        UPDATE stories
        SET status = 'archived', published_at = null, updated_at = now()
        WHERE id = $1 AND author_id = $2
        RETURNING *
      `,
      [storyId, req.session.userId],
    );

    if (!updated) {
      return res.status(404).json({ message: "Story not found." });
    }

    res.json({
      story: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        dek: updated.dek,
        body: updated.body,
        theme: updated.theme,
        contentWarning: updated.content_warning,
        allowComments: updated.allow_comments,
        status: updated.status,
        wordCount: updated.word_count,
        readingTimeMinutes: updated.reading_time_minutes,
        updatedAt: updated.updated_at,
        publishedAt: updated.published_at,
        prompt: null,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/stories/:id/restore", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.params.id);
    const updated = await queryOne<StoryRow>(
      `
        UPDATE stories
        SET status = 'draft', updated_at = now()
        WHERE id = $1 AND author_id = $2
        RETURNING *
      `,
      [storyId, req.session.userId],
    );

    if (!updated) {
      return res.status(404).json({ message: "Story not found." });
    }

    res.json({
      story: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        dek: updated.dek,
        body: updated.body,
        theme: updated.theme,
        contentWarning: updated.content_warning,
        allowComments: updated.allow_comments,
        status: updated.status,
        wordCount: updated.word_count,
        readingTimeMinutes: updated.reading_time_minutes,
        updatedAt: updated.updated_at,
        publishedAt: updated.published_at,
        prompt: null,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/stories/:id", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.params.id);
    await pool.query(`DELETE FROM stories WHERE id = $1 AND author_id = $2`, [storyId, req.session.userId]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/app/reading-list", requireAuth, async (req, res, next) => {
  try {
    const rows = await queryAll<StoryRow>(
      `
        SELECT
          stories.*,
          journal_users.display_name,
          journal_users.handle,
          journal_users.avatar_url,
          themes.name AS theme_name,
          themes.gradient_from,
          themes.gradient_to,
          true AS is_saved
        FROM reading_list
        INNER JOIN stories ON stories.id = reading_list.story_id
        INNER JOIN journal_users ON journal_users.id = stories.author_id
        LEFT JOIN themes ON themes.slug = stories.theme
        WHERE reading_list.user_id = $1 AND stories.status = 'published'
        ORDER BY reading_list.saved_at DESC
      `,
      [req.session.userId],
    );

    res.json({ stories: rows.map(storyToPreview) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/app/reading-list", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.body.storyId).trim();
    const story = await queryOne<{ id: string }>(`SELECT id FROM stories WHERE id = $1 AND status = 'published'`, [storyId]);
    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    await pool.query(
      `
        INSERT INTO reading_list (user_id, story_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, story_id) DO NOTHING
      `,
      [req.session.userId, storyId],
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/app/reading-list/:storyId", requireAuth, async (req, res, next) => {
  try {
    const storyId = assertString(req.params.storyId);
    await pool.query(`DELETE FROM reading_list WHERE user_id = $1 AND story_id = $2`, [req.session.userId, storyId]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/app/notifications", requireAuth, async (req, res, next) => {
  try {
    const rows = await queryAll<{
      id: string;
      story_id: string;
      story_title: string;
      story_slug: string;
      message: string;
      created_at: string;
      read_at: string | null;
      actor_name: string;
    }>(
      `
        SELECT
          notifications.id,
          notifications.story_id,
          stories.title AS story_title,
          stories.slug AS story_slug,
          notifications.message,
          notifications.created_at,
          notifications.read_at,
          COALESCE(journal_users.display_name, 'A reader') AS actor_name
        FROM notifications
        LEFT JOIN journal_users ON journal_users.id = notifications.actor_id
        LEFT JOIN stories ON stories.id = notifications.story_id
        WHERE notifications.user_id = $1
        ORDER BY notifications.created_at DESC
      `,
      [req.session.userId],
    );

    res.json({
      notifications: rows.map((row) => ({
        id: row.id,
        type: "comment" as const,
        storyId: row.story_id,
        storySlug: row.story_slug,
        storyTitle: row.story_title,
        actorName: row.actor_name,
        message: row.message,
        createdAt: row.created_at,
        readAt: row.read_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/app/notifications/read", requireAuth, async (req, res, next) => {
  try {
    await pool.query(`UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL`, [req.session.userId]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/app/profile", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user: userToResponse(user) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/app/profile", requireAuth, async (req, res, next) => {
  try {
    const displayName = assertString(req.body.displayName).trim().slice(0, 80);
    const bio = assertString(req.body.bio).trim().slice(0, 240) || null;

    if (!displayName) {
      return res.status(400).json({ message: "Display name is required." });
    }

    const user = await queryOne<UserRow>(
      `
        UPDATE journal_users
        SET display_name = $1, bio = $2, updated_at = now()
        WHERE id = $3
        RETURNING *
      `,
      [displayName, bio, req.session.userId],
    );

    res.json({ user: user ? userToResponse(user) : null });
  } catch (error) {
    next(error);
  }
});

if (isProduction) {
  const clientPathCandidates = [
    path.resolve(__dirname, "../../client"),
    path.resolve(__dirname, "../client"),
    path.resolve(process.cwd(), "dist/client"),
  ];
  const clientPath = clientPathCandidates.find((candidate) => fs.existsSync(candidate));
  const indexPath = clientPath ? path.join(clientPath, "index.html") : null;

  if (clientPath && indexPath && fs.existsSync(indexPath)) {
    app.use(express.static(clientPath));
    app.get(/^(?!\/api\/).*/, (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        next();
        return;
      }
      res.sendFile(indexPath);
    });
  }
}

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({
    message: error instanceof Error ? error.message : "Something went wrong.",
    supportEmail: SUPPORT_EMAIL,
  });
});

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  dbReadyPromise
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Inkline Journal API running on ${APP_BASE_URL}`);
      });
    })
    .catch((error) => {
      console.error("Failed to initialize Postgres:", error);
      process.exit(1);
    });
}

export default app;
export { dbReadyPromise };
