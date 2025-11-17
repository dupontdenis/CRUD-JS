import BlogPost from "../models/blogspot.mjs";

// Reusable validation helper: trims inputs and returns sanitized values + errors
function validatePostInput(titleInput, bodyInput, options = {}) {
  const titleMax = options.titleMax ?? 10;
  const bodyMax = options.bodyMax ?? 100;

  const title = typeof titleInput === "string" ? titleInput.trim() : "";
  const body = typeof bodyInput === "string" ? bodyInput.trim() : "";

  const errors = [];
  if (!title) errors.push("Title is required.");
  if (!body) errors.push("Body is required.");
  if (title && title.length > titleMax)
    errors.push(`Title must be ${titleMax} characters or fewer.`);
  if (body && body.length > bodyMax) errors.push("Body is too long.");

  return { title, body, errors };
}

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find();

    // Demonstrate virtuals and methods
    const postsWithExtras = posts.map((post) => ({
      id: post._id,
      title: post.title,
      body: post.body,
      url: post.url, // Virtual property
      summary: post.getSummary(50), // Instance method
    }));

    res.render("index", { posts: postsWithExtras });
  } catch (error) {
    res.status(500).send("Error fetching posts: " + error.message);
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render("detail", {
      post: {
        id: post._id,
        title: post.title,
        body: post.body,
        url: post.url, // Virtual
      },
    });
  } catch (error) {
    res.status(500).send("Error fetching post: " + error.message);
  }
};

// Show form to create a new post
export const showNewPostForm = (req, res) => {
  // Render the self-contained `new.ejs` view. The view uses static labels and form action.
  return res.render("new");
};

// Handle creation of a new post
export const createPost = async (req, res) => {
  try {
    // Pull and sanitize inputs
    const { title: rawTitle, body: rawBody, errors } = validatePostInput(
      req.body.title,
      req.body.body
    );

    if (errors.length > 0) {
      // Render the form again with error messages and previously entered values.
      return res.status(400).render("new", {
        errors,
        title: rawTitle,
        body: rawBody,
      });
    }

    const newPost = new BlogPost({ title: rawTitle, body: rawBody });
    const saved = await newPost.save();

    // Redirect to the newly created post detail
    return res.redirect(`/posts/${saved._id}`);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).send("Error creating post: " + error.message);
  }
};

// Delete a post by ID
export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send("Post not found");
    }
    // Redirect to list after deletion
    return res.redirect("/posts/");
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).send("Error deleting post: " + error.message);
  }
};

// Show edit form (reuses new.ejs)
export const showEditForm = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    // The view contains static labels and computes the form action from post.id.
    return res.render("edit", {
      post: { id: post._id, title: post.title, body: post.body },
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    return res.status(500).send("Error: " + error.message);
  }
};

// Handle edit submission (POST)
export const updatePost = async (req, res) => {
  try {
    // Use the shared validator so create/update share the same rules by default
    const { title: rawTitle, body: rawBody, errors } = validatePostInput(
      req.body.title,
      req.body.body
    );

    if (errors.length > 0) {
      // On validation error, re-render the edit view with errors and prefills.
      return res.status(400).render("edit", {
        errors,
        post: { id: req.params.id, title: rawTitle, body: rawBody },
      });
    }

    const updated = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { title: rawTitle, body: rawBody },
      { new: true }
    );
    if (!updated) return res.status(404).send("Post not found");
    return res.redirect(`/posts/${updated._id}`);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).send("Error updating post: " + error.message);
  }
};
