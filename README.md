# Blog Website (Node + Express + EJS)

An in-memory blog web application where users can create, view, edit, and delete posts.  
No database is used in this version, so posts reset when the server restarts.

## Features

- Create new blog posts
- View all posts on the home page
- Open full post pages
- Edit existing posts
- Delete posts
- Responsive, custom-styled UI for desktop and mobile

## Tech Stack

- Node.js
- Express.js
- EJS
- Method Override (for PATCH/DELETE form actions)
- CSS (custom responsive styling)

## Run Locally

```bash
npm install
npm start
```

App runs at:

```text
http://localhost:3000
```

For auto-reload during development:

```bash
npm run dev
```

## GitHub Pages Version

This repository also includes a static GitHub Pages version under `docs/` with client-side CRUD behavior.
