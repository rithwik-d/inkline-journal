const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const nodemailer = require("nodemailer");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const EMAIL_VERIFY_TTL_HOURS = Number(process.env.EMAIL_VERIFY_TTL_HOURS) || 24;
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;

const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(path.join(dataDirectory, "inkline.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS email_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    consumed_at INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_posts_published_updated ON posts(is_published, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_user_updated ON posts(user_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_email_verifications_user_created ON email_verifications(user_id, created_at DESC);
`);

function columnExists(tableName, columnName) {
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .some((column) => column.name === columnName);
}

if (!columnExists("users", "is_verified")) {
  db.exec("ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0");
}

if (!columnExists("users", "email_verified_at")) {
  db.exec("ALTER TABLE users ADD COLUMN email_verified_at INTEGER");
}

const statements = {
  findUserByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
  findUserById: db.prepare(`SELECT * FROM users WHERE id = ?`),
  insertUser: db.prepare(`
    INSERT INTO users (email, password_hash, display_name, is_verified, email_verified_at, created_at)
    VALUES (?, ?, ?, 0, NULL, ?)
  `),
  updateUnverifiedUserCredentials: db.prepare(`
    UPDATE users
    SET password_hash = ?, display_name = ?
    WHERE id = ? AND is_verified = 0
  `),
  markUserVerified: db.prepare(`
    UPDATE users
    SET is_verified = 1, email_verified_at = ?
    WHERE id = ?
  `),
  clearEmailVerificationsForUser: db.prepare(`DELETE FROM email_verifications WHERE user_id = ?`),
  insertEmailVerification: db.prepare(`
    INSERT INTO email_verifications (user_id, token, expires_at, consumed_at, created_at)
    VALUES (?, ?, ?, NULL, ?)
  `),
  getEmailVerificationByToken: db.prepare(`
    SELECT *
    FROM email_verifications
    WHERE token = ?
    LIMIT 1
  `),
  consumeEmailVerification: db.prepare(`
    UPDATE email_verifications
    SET consumed_at = ?
    WHERE id = ?
  `),
  listPublicPosts: db.prepare(`
    SELECT
      posts.id,
      posts.user_id,
      posts.title,
      posts.content,
      posts.is_published,
      posts.created_at,
      posts.updated_at,
      users.display_name,
      users.email
    FROM posts
    INNER JOIN users ON users.id = posts.user_id
    WHERE posts.is_published = 1
    ORDER BY posts.updated_at DESC
  `),
  listUserPosts: db.prepare(`
    SELECT
      posts.id,
      posts.user_id,
      posts.title,
      posts.content,
      posts.is_published,
      posts.created_at,
      posts.updated_at,
      users.display_name,
      users.email
    FROM posts
    INNER JOIN users ON users.id = posts.user_id
    WHERE posts.user_id = ?
    ORDER BY posts.updated_at DESC
  `),
  getPostById: db.prepare(`
    SELECT
      posts.id,
      posts.user_id,
      posts.title,
      posts.content,
      posts.is_published,
      posts.created_at,
      posts.updated_at,
      users.display_name,
      users.email
    FROM posts
    INNER JOIN users ON users.id = posts.user_id
    WHERE posts.id = ?
  `),
  insertPost: db.prepare(`
    INSERT INTO posts (user_id, title, content, is_published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  updatePost: db.prepare(`
    UPDATE posts
    SET title = ?, content = ?, is_published = ?, updated_at = ?
    WHERE id = ?
  `),
  deletePost: db.prepare(`DELETE FROM posts WHERE id = ?`),
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@inkline-journal.local";

const hasSmtpCredentials = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);

const mailTransporter = hasSmtpCredentials
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const quotes = [
  "Stories are the shortest distance between strangers and understanding.",
  "A brave paragraph can outlive a thousand loud moments.",
  "Write what your future self would thank you for preserving.",
  "The softest words often carry the heaviest truths.",
];

app.locals.formatDate = (timestamp) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(Number(timestamp)));

app.locals.excerpt = (text, maxLength = 200) => {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
};

app.locals.currentYear = new Date().getFullYear();

function getQuoteForToday() {
  const dayIndex = new Date().getDate() % quotes.length;
  return quotes[dayIndex];
}

function normalizeCredentialsInput(body) {
  return {
    email: (body.email || "").trim().toLowerCase(),
    password: body.password || "",
  };
}

function normalizePostInput(body) {
  return {
    title: (body.title || "").trim(),
    content: (body.content || "").trim(),
    isPublished: body.isPublished === "on",
  };
}

function validateEmail(email) {
  return /.+@.+\..+/.test(email);
}

function validatePost(postInput) {
  const errors = [];

  if (!postInput.title) {
    errors.push("Title is required.");
  }

  if (postInput.title.length > 130) {
    errors.push("Title must be 130 characters or fewer.");
  }

  if (!postInput.content) {
    errors.push("Content is required.");
  }

  if (postInput.content.length > 12000) {
    errors.push("Content must be 12,000 characters or fewer.");
  }

  return errors;
}

function displayNameForUser(user) {
  if (user.display_name && user.display_name.trim().length > 0) {
    return user.display_name.trim();
  }

  return user.email.split("@")[0];
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function renderNotFound(res, message = "The requested content was not found.") {
  return res.status(404).render("404", { message, quote: getQuoteForToday() });
}

function renderForbidden(res, message = "You do not have access to this action.") {
  return res.status(403).render("403", { message, quote: getQuoteForToday() });
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    setFlash(req, "error", "Log in to continue.");
    return res.redirect("/login");
  }

  return next();
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendVerificationEmail(email, verificationLink) {
  if (!mailTransporter) {
    // eslint-disable-next-line no-console
    console.log(`[VERIFY LINK] ${email} => ${verificationLink}`);
    return;
  }

  await mailTransporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Verify your Inkline Journal account",
    text: `Welcome to Inkline Journal.\n\nVerify your email by opening this link:\n${verificationLink}\n\nThis link expires in ${EMAIL_VERIFY_TTL_HOURS} hours.`,
    html: `
      <p>Welcome to Inkline Journal.</p>
      <p>Verify your email by clicking this link:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>This link expires in ${EMAIL_VERIFY_TTL_HOURS} hours.</p>
    `,
  });
}

app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;

  const currentUser = req.session.userId ? statements.findUserById.get(req.session.userId) : null;
  res.locals.currentUser = currentUser;
  res.locals.currentUserName = currentUser ? displayNameForUser(currentUser) : null;

  next();
});

app.get("/", (req, res) => {
  const posts = statements.listPublicPosts.all();

  return res.render("index", {
    posts,
    quote: getQuoteForToday(),
    activePage: "home",
  });
});

app.get("/signup", (req, res) =>
  res.render("signup", {
    title: "Sign Up",
    activePage: "signup",
    formData: { email: "", displayName: "" },
    errors: [],
  })
);

app.post("/signup", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";
  const confirmPassword = req.body.confirmPassword || "";
  const displayName = (req.body.displayName || "").trim();
  const errors = [];

  if (!validateEmail(email)) {
    errors.push("Enter a valid email address.");
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    errors.push("Password and confirm password must match.");
  }

  if (displayName.length > 70) {
    errors.push("Display name must be 70 characters or fewer.");
  }

  const existingUser = email ? statements.findUserByEmail.get(email) : null;
  if (existingUser && existingUser.is_verified) {
    errors.push("An account with this email already exists.");
  }

  if (errors.length > 0) {
    return res.status(400).render("signup", {
      title: "Sign Up",
      activePage: "signup",
      formData: { email, displayName },
      errors,
    });
  }

  const now = Date.now();
  const passwordHash = await bcrypt.hash(password, 12);
  let userId;

  if (existingUser) {
    statements.updateUnverifiedUserCredentials.run(passwordHash, displayName || null, existingUser.id);
    userId = existingUser.id;
  } else {
    const insertResult = statements.insertUser.run(email, passwordHash, displayName || null, now);
    userId = Number(insertResult.lastInsertRowid);
  }

  const verificationToken = generateVerificationToken();
  const expiresAt = now + EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000;
  statements.clearEmailVerificationsForUser.run(userId);
  statements.insertEmailVerification.run(userId, verificationToken, expiresAt, now);
  const verificationLink = `${APP_BASE_URL}/verify-email?token=${verificationToken}`;

  try {
    await sendVerificationEmail(email, verificationLink);
  } catch (error) {
    return res.status(500).render("signup", {
      title: "Sign Up",
      activePage: "signup",
      formData: { email, displayName },
      errors: ["Unable to send verification email right now. Please try again."],
    });
  }

  if (!mailTransporter) {
    setFlash(req, "info", "Verification link is in console mode for local development. Check the server terminal.");
  } else {
    setFlash(req, "success", "Account created. Check your email and verify your account before signing in.");
  }
  return res.redirect("/login");
});

app.get("/login", (req, res) =>
  res.render("login", {
    title: "Sign In",
    activePage: "login",
    formData: { email: "" },
    errors: [],
  })
);

app.post("/login", async (req, res) => {
  const credentials = normalizeCredentialsInput(req.body);
  const errors = [];

  if (!validateEmail(credentials.email)) {
    errors.push("Enter a valid email address.");
  }

  if (!credentials.password) {
    errors.push("Password is required.");
  }

  const user = credentials.email ? statements.findUserByEmail.get(credentials.email) : null;

  if (errors.length === 0) {
    const isPasswordValid = user
      ? await bcrypt.compare(credentials.password, user.password_hash)
      : false;

    if (!isPasswordValid) {
      errors.push("Invalid email or password.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).render("login", {
      title: "Sign In",
      activePage: "login",
      formData: { email: credentials.email },
      errors,
    });
  }

  if (!user.is_verified) {
    return res.status(403).render("login", {
      title: "Sign In",
      activePage: "login",
      formData: { email: credentials.email },
      errors: ["Verify your email first using the signup verification link."],
    });
  }

  req.session.userId = user.id;

  setFlash(req, "success", "Sign in successful. Welcome to your writing dashboard.");
  return res.redirect("/dashboard");
});

app.get("/verify-email", (req, res) => {
  const token = String(req.query.token || "").trim();
  if (!token) {
    setFlash(req, "error", "Verification link is invalid.");
    return res.redirect("/login");
  }

  const record = statements.getEmailVerificationByToken.get(token);
  const now = Date.now();

  if (!record || record.consumed_at || record.expires_at < now) {
    setFlash(req, "error", "Verification link is invalid or expired.");
    return res.redirect("/login");
  }

  statements.consumeEmailVerification.run(now, record.id);
  statements.markUserVerified.run(now, record.user_id);

  setFlash(req, "success", "Email verified. You can sign in now.");
  return res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.get("/dashboard", requireAuth, (req, res) => {
  const posts = statements.listUserPosts.all(req.session.userId);

  return res.render("dashboard", {
    title: "Dashboard",
    activePage: "dashboard",
    posts,
    quote: getQuoteForToday(),
  });
});

app.get("/posts/new", requireAuth, (req, res) =>
  res.render("new", {
    title: "Write Story",
    activePage: "new",
    formData: {
      title: "",
      content: "",
      isPublished: true,
    },
    errors: [],
  })
);

app.post("/posts", requireAuth, (req, res) => {
  const formData = normalizePostInput(req.body);
  const errors = validatePost(formData);

  if (errors.length > 0) {
    return res.status(400).render("new", {
      title: "Write Story",
      activePage: "new",
      formData,
      errors,
    });
  }

  const now = Date.now();
  statements.insertPost.run(
    req.session.userId,
    formData.title,
    formData.content,
    formData.isPublished ? 1 : 0,
    now,
    now
  );

  setFlash(req, "success", formData.isPublished ? "Post published." : "Draft saved.");
  return res.redirect("/dashboard");
});

app.get("/posts/:id", (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const post = Number.isNaN(postId) ? null : statements.getPostById.get(postId);

  if (!post) {
    return renderNotFound(res);
  }

  const isOwner = req.session.userId && req.session.userId === post.user_id;
  if (!post.is_published && !isOwner) {
    return renderNotFound(res, "This story is currently private.");
  }

  return res.render("show", {
    title: post.title,
    activePage: "home",
    post,
    isOwner,
  });
});

app.get("/posts/:id/edit", requireAuth, (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const post = Number.isNaN(postId) ? null : statements.getPostById.get(postId);

  if (!post) {
    return renderNotFound(res);
  }

  if (post.user_id !== req.session.userId) {
    return renderForbidden(res);
  }

  return res.render("edit", {
    title: "Edit Story",
    activePage: "dashboard",
    post,
    formData: {
      title: post.title,
      content: post.content,
      isPublished: Boolean(post.is_published),
    },
    errors: [],
  });
});

app.patch("/posts/:id", requireAuth, (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const post = Number.isNaN(postId) ? null : statements.getPostById.get(postId);

  if (!post) {
    return renderNotFound(res);
  }

  if (post.user_id !== req.session.userId) {
    return renderForbidden(res);
  }

  const formData = normalizePostInput(req.body);
  const errors = validatePost(formData);

  if (errors.length > 0) {
    return res.status(400).render("edit", {
      title: "Edit Story",
      activePage: "dashboard",
      post,
      formData,
      errors,
    });
  }

  statements.updatePost.run(
    formData.title,
    formData.content,
    formData.isPublished ? 1 : 0,
    Date.now(),
    postId
  );

  setFlash(req, "success", formData.isPublished ? "Story updated and published." : "Story updated as draft.");
  return res.redirect("/dashboard");
});

app.delete("/posts/:id", requireAuth, (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const post = Number.isNaN(postId) ? null : statements.getPostById.get(postId);

  if (!post) {
    return renderNotFound(res);
  }

  if (post.user_id !== req.session.userId) {
    return renderForbidden(res);
  }

  statements.deletePost.run(postId);
  setFlash(req, "success", "Story deleted.");
  return res.redirect("/dashboard");
});

app.use((req, res) => renderNotFound(res, "This page doesn't exist in Inkline Journal."));

app.use((error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).render("500", {
    message: "Something broke while loading this page. Please try again.",
    quote: getQuoteForToday(),
    activePage: "home",
    title: "Server Error",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Inkline Journal running on http://localhost:${PORT}`);
  });
}

module.exports = app;
