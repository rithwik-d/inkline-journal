const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const nodemailer = require("nodemailer");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) || 10;

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

  CREATE TABLE IF NOT EXISTS login_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    otp_code TEXT NOT NULL,
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
  CREATE INDEX IF NOT EXISTS idx_otps_user_created ON login_otps(user_id, created_at DESC);
`);

const statements = {
  findUserByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
  findUserById: db.prepare(`SELECT * FROM users WHERE id = ?`),
  insertUser: db.prepare(`
    INSERT INTO users (email, password_hash, display_name, created_at)
    VALUES (?, ?, ?, ?)
  `),
  insertOtp: db.prepare(`
    INSERT INTO login_otps (user_id, otp_code, expires_at, consumed_at, created_at)
    VALUES (?, ?, ?, NULL, ?)
  `),
  getLatestOtpForUser: db.prepare(`
    SELECT *
    FROM login_otps
    WHERE user_id = ? AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `),
  consumeOtp: db.prepare(`UPDATE login_otps SET consumed_at = ? WHERE id = ?`),
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

function clearPendingOtp(sessionObject) {
  delete sessionObject.pendingOtpUserId;
  delete sessionObject.pendingOtpEmail;
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

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(email, otpCode) {
  if (!mailTransporter) {
    // eslint-disable-next-line no-console
    console.log(`[OTP] ${email} => ${otpCode}`);
    return;
  }

  await mailTransporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Your Inkline Journal login OTP",
    text: `Your one-time login code is ${otpCode}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    html: `<p>Your one-time login code is <strong>${otpCode}</strong>.</p><p>It expires in ${OTP_TTL_MINUTES} minutes.</p>`,
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
  if (existingUser) {
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

  const passwordHash = await bcrypt.hash(password, 12);
  statements.insertUser.run(email, passwordHash, displayName || null, Date.now());

  setFlash(req, "success", "Account created. Log in to receive your OTP.");
  return res.redirect("/login");
});

app.get("/login", (req, res) =>
  res.render("login", {
    title: "Login",
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
      title: "Login",
      activePage: "login",
      formData: { email: credentials.email },
      errors,
    });
  }

  const otpCode = generateOtpCode();
  const now = Date.now();
  const expiresAt = now + OTP_TTL_MINUTES * 60 * 1000;
  statements.insertOtp.run(user.id, otpCode, expiresAt, now);

  try {
    await sendOtpEmail(user.email, otpCode);
  } catch (error) {
    return res.status(500).render("login", {
      title: "Login",
      activePage: "login",
      formData: { email: credentials.email },
      errors: ["Unable to send OTP email right now. Try again in a minute."],
    });
  }

  req.session.pendingOtpUserId = user.id;
  req.session.pendingOtpEmail = user.email;

  if (!mailTransporter) {
    setFlash(
      req,
      "info",
      "OTP delivery is in console mode for local development. Check the server terminal for the code."
    );
  }

  return res.redirect("/verify-otp");
});

app.get("/verify-otp", (req, res) => {
  if (!req.session.pendingOtpUserId || !req.session.pendingOtpEmail) {
    setFlash(req, "error", "Start with login to verify your OTP.");
    return res.redirect("/login");
  }

  return res.render("verify-otp", {
    title: "Verify OTP",
    activePage: "login",
    pendingEmail: req.session.pendingOtpEmail,
    errors: [],
  });
});

app.post("/verify-otp", (req, res) => {
  const otpInput = (req.body.otp || "").trim();

  if (!req.session.pendingOtpUserId || !req.session.pendingOtpEmail) {
    setFlash(req, "error", "Start with login to verify your OTP.");
    return res.redirect("/login");
  }

  if (!/^\d{6}$/.test(otpInput)) {
    return res.status(400).render("verify-otp", {
      title: "Verify OTP",
      activePage: "login",
      pendingEmail: req.session.pendingOtpEmail,
      errors: ["Enter the 6-digit OTP code."],
    });
  }

  const otpRecord = statements.getLatestOtpForUser.get(req.session.pendingOtpUserId);
  const now = Date.now();

  if (!otpRecord || otpRecord.expires_at < now || otpRecord.otp_code !== otpInput) {
    return res.status(400).render("verify-otp", {
      title: "Verify OTP",
      activePage: "login",
      pendingEmail: req.session.pendingOtpEmail,
      errors: ["Invalid or expired OTP. Please login again to request a new code."],
    });
  }

  statements.consumeOtp.run(now, otpRecord.id);
  req.session.userId = req.session.pendingOtpUserId;
  clearPendingOtp(req.session);

  setFlash(req, "success", "Login successful. Welcome to your writing dashboard.");
  return res.redirect("/dashboard");
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
