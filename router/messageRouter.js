const express = require("express");
const messageController = require("../controllers/messageController");
const Router = express.Router();
const auth = require("../Middleware/auth");

Router.post("/conversation", auth, messageController.createConversation);
Router.post("/message", auth, messageController.createMessage);
Router.delete("/conversation/:id", auth, messageController.deleteConversation);
Router.delete("/message/:id", auth, messageController.deleteMessage);
Router.get("/conversation", auth, messageController.getConversations);
Router.get("/message/:id", auth, messageController.getMessages);

module.exports = Router;
