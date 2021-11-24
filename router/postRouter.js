const express = require("express");
const Router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../Middleware/auth");

Router.post("/create", auth, postController.createPost);
Router.put("/update/:id", auth, postController.updatePost);
Router.delete("/delete/:id", auth, postController.deletePost);
Router.patch("/liked/:id", auth, postController.toggleLikePost);
Router.get("/discover", auth, postController.getDiscoverPosts);
Router.patch("/saved/:id", auth, postController.toggleSavePost);
Router.get("/saved", auth, postController.getSavedPosts);
Router.get("/user/:slug", auth, postController.getUserPosts);
Router.get("/:id", auth, postController.getPost);
Router.get("/", auth, postController.getPosts);

module.exports = Router;
