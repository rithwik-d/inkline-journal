require("dotenv").config();

const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function readBooleanFlag(value, defaultValue = false) {
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

const defaultSsl = process.env.NODE_ENV === "production";
const shouldUseSsl = readBooleanFlag(process.env.PGSSL, defaultSsl);
const hasConnectionString = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);

const poolConfig = hasConnectionString
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {};

if (shouldUseSsl) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  // eslint-disable-next-line no-console
  console.error("Unexpected Postgres pool error", error);
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at BIGINT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_published_updated
      ON posts(is_published, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_posts_user_updated
      ON posts(user_id, updated_at DESC);
  `);

}

const dbReadyPromise = initializeDatabase();

async function queryOne(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function queryAll(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function findUserByEmail(email) {
  return queryOne(`SELECT * FROM users WHERE email = $1`, [email]);
}

async function findUserById(userId) {
  return queryOne(`SELECT * FROM users WHERE id = $1`, [userId]);
}

async function createUser(email, passwordHash, displayName, createdAt) {
  const row = await queryOne(
    `
      INSERT INTO users (email, password_hash, display_name, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [email, passwordHash, displayName, createdAt]
  );

  return row.id;
}

async function listPublicPosts() {
  return queryAll(
    `
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
      WHERE posts.is_published = TRUE
      ORDER BY posts.updated_at DESC
    `
  );
}

async function listUserPosts(userId) {
  return queryAll(
    `
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
      WHERE posts.user_id = $1
      ORDER BY posts.updated_at DESC
    `,
    [userId]
  );
}

async function getPostById(postId) {
  return queryOne(
    `
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
      WHERE posts.id = $1
      LIMIT 1
    `,
    [postId]
  );
}

async function createPost(userId, title, content, isPublished, createdAt, updatedAt) {
  await pool.query(
    `
      INSERT INTO posts (user_id, title, content, is_published, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [userId, title, content, isPublished, createdAt, updatedAt]
  );
}

async function updatePost(postId, title, content, isPublished, updatedAt) {
  await pool.query(
    `
      UPDATE posts
      SET title = $1, content = $2, is_published = $3, updated_at = $4
      WHERE id = $5
    `,
    [title, content, isPublished, updatedAt, postId]
  );
}

async function deletePost(postId) {
  await pool.query(`DELETE FROM posts WHERE id = $1`, [postId]);
}

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

app.use(async (req, res, next) => {
  try {
    await dbReadyPromise;
    next();
  } catch (error) {
    next(error);
  }
});

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

app.use(async (req, res, next) => {
  try {
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;

    const currentUser = req.session.userId ? await findUserById(req.session.userId) : null;
    res.locals.currentUser = currentUser;
    res.locals.currentUserName = currentUser ? displayNameForUser(currentUser) : null;

    next();
  } catch (error) {
    next(error);
  }
});

app.get("/", async (req, res, next) => {
  try {
    const posts = await listPublicPosts();

    return res.render("index", {
      posts,
      quote: getQuoteForToday(),
      activePage: "home",
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/signup", (req, res) =>
  res.render("signup", {
    title: "Sign Up",
    activePage: "signup",
    formData: { email: "", displayName: "" },
    errors: [],
  })
);

app.post("/signup", async (req, res, next) => {
  try {
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

    const existingUser = email ? await findUserByEmail(email) : null;
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

    const now = Date.now();
    const passwordHash = await bcrypt.hash(password, 12);
    await createUser(email, passwordHash, displayName || null, now);

    setFlash(req, "success", "Account created. Sign in to continue.");

    return res.redirect("/login");
  } catch (error) {
    return next(error);
  }
});

app.get("/login", (req, res) =>
  res.render("login", {
    title: "Sign In",
    activePage: "login",
    formData: { email: "" },
    errors: [],
  })
);

app.post("/login", async (req, res, next) => {
  try {
    const credentials = normalizeCredentialsInput(req.body);
    const errors = [];

    if (!validateEmail(credentials.email)) {
      errors.push("Enter a valid email address.");
    }

    if (!credentials.password) {
      errors.push("Password is required.");
    }

    const user = credentials.email ? await findUserByEmail(credentials.email) : null;

    if (errors.length === 0) {
      const isPasswordValid = user ? await bcrypt.compare(credentials.password, user.password_hash) : false;

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

    req.session.userId = user.id;

    setFlash(req, "success", "Sign in successful. Welcome to your writing dashboard.");
    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const posts = await listUserPosts(req.session.userId);

    return res.render("dashboard", {
      title: "Dashboard",
      activePage: "dashboard",
      posts,
      quote: getQuoteForToday(),
    });
  } catch (error) {
    return next(error);
  }
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

app.post("/posts", requireAuth, async (req, res, next) => {
  try {
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
    await createPost(req.session.userId, formData.title, formData.content, formData.isPublished, now, now);

    setFlash(req, "success", formData.isPublished ? "Post published." : "Draft saved.");
    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

app.get("/posts/:id", async (req, res, next) => {
  try {
    const postId = Number.parseInt(req.params.id, 10);
    const post = Number.isNaN(postId) ? null : await getPostById(postId);

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
  } catch (error) {
    return next(error);
  }
});

app.get("/posts/:id/edit", requireAuth, async (req, res, next) => {
  try {
    const postId = Number.parseInt(req.params.id, 10);
    const post = Number.isNaN(postId) ? null : await getPostById(postId);

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
  } catch (error) {
    return next(error);
  }
});

app.patch("/posts/:id", requireAuth, async (req, res, next) => {
  try {
    const postId = Number.parseInt(req.params.id, 10);
    const post = Number.isNaN(postId) ? null : await getPostById(postId);

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

    await updatePost(postId, formData.title, formData.content, formData.isPublished, Date.now());

    setFlash(req, "success", formData.isPublished ? "Story updated and published." : "Story updated as draft.");
    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
});

app.delete("/posts/:id", requireAuth, async (req, res, next) => {
  try {
    const postId = Number.parseInt(req.params.id, 10);
    const post = Number.isNaN(postId) ? null : await getPostById(postId);

    if (!post) {
      return renderNotFound(res);
    }

    if (post.user_id !== req.session.userId) {
      return renderForbidden(res);
    }

    await deletePost(postId);
    setFlash(req, "success", "Story deleted.");
    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
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
  dbReadyPromise
    .then(() => {
      app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Inkline Journal running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize Postgres:", error.message);
      process.exit(1);
    });
}

module.exports = app;
