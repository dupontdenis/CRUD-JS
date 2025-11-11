import express from "express";
import * as postController from "../controllers/postController.mjs";

const router = express.Router();

// List all posts
router.route("/").get(postController.getAllPosts);

// Show the form to create a post, and handle creation
router
  .route("/new")
  .get(postController.showNewPostForm)
  .post(postController.createPost);

// Show single post
router.route("/:id").get(postController.getPostById);

// Edit form (GET)
router.route("/:id/edit").get(postController.showEditForm);

// Update via POST (avoids client PUT issues)
router.route("/:id/update").post(postController.updatePost);

// Delete via POST (avoids client DELETE issues)
router.route("/:id/delete").post(postController.deletePost);

export default router;
