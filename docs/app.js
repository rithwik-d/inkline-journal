const posts = [];
let nextId = 1;
let editingPostId = null;

const form = document.querySelector("#post-form");
const titleInput = document.querySelector("#title");
const authorInput = document.querySelector("#author");
const contentInput = document.querySelector("#content");
const postIdInput = document.querySelector("#post-id");
const postsList = document.querySelector("#posts-list");
const emptyState = document.querySelector("#posts-empty");
const formHeading = document.querySelector("#form-heading");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const formError = document.querySelector("#form-error");
const postTemplate = document.querySelector("#post-template");

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function validateInput(postInput) {
  if (!postInput.title) {
    return "Title is required.";
  }

  if (postInput.title.length > 120) {
    return "Title must be 120 characters or fewer.";
  }

  if (postInput.author.length > 80) {
    return "Author name must be 80 characters or fewer.";
  }

  if (!postInput.content) {
    return "Content is required.";
  }

  return "";
}

function resetForm() {
  form.reset();
  postIdInput.value = "";
  editingPostId = null;
  formHeading.textContent = "Create Post";
  submitButton.textContent = "Publish Post";
  cancelEditButton.classList.add("hidden");
  formError.textContent = "";
  formError.classList.add("hidden");
}

function startEdit(post) {
  editingPostId = post.id;
  postIdInput.value = String(post.id);
  titleInput.value = post.title;
  authorInput.value = post.author === "Anonymous" ? "" : post.author;
  contentInput.value = post.content;
  formHeading.textContent = "Edit Post";
  submitButton.textContent = "Save Changes";
  cancelEditButton.classList.remove("hidden");
  formError.textContent = "";
  formError.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPosts() {
  postsList.innerHTML = "";

  if (posts.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  [...posts]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((post) => {
      const node = postTemplate.content.cloneNode(true);
      node.querySelector(".post-title").textContent = post.title;
      node.querySelector(".meta").textContent = `By ${post.author} • Updated ${formatDate(post.updatedAt)}`;
      node.querySelector(".post-content").textContent = post.content;

      node.querySelector(".action-edit").addEventListener("click", () => startEdit(post));

      node.querySelector(".action-delete").addEventListener("click", () => {
        const deleteConfirmed = window.confirm("Delete this post permanently?");
        if (!deleteConfirmed) {
          return;
        }

        const postIndex = posts.findIndex((entry) => entry.id === post.id);
        if (postIndex !== -1) {
          posts.splice(postIndex, 1);
        }

        if (editingPostId === post.id) {
          resetForm();
        }

        renderPosts();
      });

      postsList.appendChild(node);
    });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const postInput = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    content: contentInput.value.trim(),
  };

  const validationError = validateInput(postInput);
  if (validationError) {
    formError.textContent = validationError;
    formError.classList.remove("hidden");
    return;
  }

  formError.textContent = "";
  formError.classList.add("hidden");

  if (editingPostId !== null) {
    const existingPost = posts.find((post) => post.id === editingPostId);

    if (existingPost) {
      existingPost.title = postInput.title;
      existingPost.author = postInput.author || "Anonymous";
      existingPost.content = postInput.content;
      existingPost.updatedAt = new Date();
    }
  } else {
    const timestamp = new Date();
    posts.push({
      id: nextId,
      title: postInput.title,
      author: postInput.author || "Anonymous",
      content: postInput.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    nextId += 1;
  }

  resetForm();
  renderPosts();
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
});

renderPosts();
