const express = require("express");
const methodOverride = require("method-override");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.locals.formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);

app.locals.excerpt = (text, maxLength = 180) => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
};

app.locals.currentYear = new Date().getFullYear();

const posts = [];
let nextId = 1;

function normalizePostInput(body) {
  return {
    title: (body.title || "").trim(),
    author: (body.author || "").trim(),
    content: (body.content || "").trim(),
  };
}

function validatePost(postInput) {
  const errors = [];

  if (!postInput.title) {
    errors.push("Title is required.");
  }

  if (postInput.title.length > 120) {
    errors.push("Title must be 120 characters or fewer.");
  }

  if (postInput.author.length > 80) {
    errors.push("Author name must be 80 characters or fewer.");
  }

  if (!postInput.content) {
    errors.push("Post content is required.");
  }

  return errors;
}

function getPostById(id) {
  return posts.find((post) => post.id === id);
}

function renderNotFound(res, message = "The requested post could not be found.") {
  return res.status(404).render("404", { message });
}

app.get("/", (req, res) => {
  const sortedPosts = [...posts].sort((a, b) => b.updatedAt - a.updatedAt);
  res.render("index", { posts: sortedPosts });
});

app.get("/posts/new", (req, res) => {
  res.render("new", {
    formData: { title: "", author: "", content: "" },
    errors: [],
  });
});

app.post("/posts", (req, res) => {
  const formData = normalizePostInput(req.body);
  const errors = validatePost(formData);

  if (errors.length > 0) {
    return res.status(400).render("new", { formData, errors });
  }

  const timestamp = new Date();
  posts.push({
    id: nextId,
    title: formData.title,
    author: formData.author || "Anonymous",
    content: formData.content,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  nextId += 1;
  return res.redirect("/");
});

app.get("/posts/:id", (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const post = getPostById(postId);

  if (!post) {
    return renderNotFound(res);
  }

  return res.render("show", { post });
});

app.get("/posts/:id/edit", (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const post = getPostById(postId);

  if (!post) {
    return renderNotFound(res);
  }

  return res.render("edit", { formData: post, errors: [], post });
});

app.patch("/posts/:id", (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const post = getPostById(postId);

  if (!post) {
    return renderNotFound(res);
  }

  const formData = normalizePostInput(req.body);
  const errors = validatePost(formData);

  if (errors.length > 0) {
    return res.status(400).render("edit", { formData, errors, post });
  }

  post.title = formData.title;
  post.author = formData.author || "Anonymous";
  post.content = formData.content;
  post.updatedAt = new Date();

  return res.redirect(`/posts/${post.id}`);
});

app.delete("/posts/:id", (req, res) => {
  const postId = Number.parseInt(req.params.id, 10);
  const postIndex = posts.findIndex((post) => post.id === postId);

  if (postIndex === -1) {
    return renderNotFound(res);
  }

  posts.splice(postIndex, 1);
  return res.redirect("/");
});

app.use((req, res) => renderNotFound(res, "The page you requested does not exist."));

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Blog app is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
