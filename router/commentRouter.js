const express = require("express");
const Router = express.Router();
const commentController = require("../controllers/commentController");
const auth = require("../Middleware/auth");

Router.post("/create", auth, commentController.createComment);
Router.patch("/update/:id", auth, commentController.updateComment);
Router.delete("/delete/:id", auth, commentController.deleteComment);
Router.patch("/toggle-like/:id", auth, commentController.toggleLikeComment);

module.exports = Router;
