const express = require("express");
const Router = express.Router();
const notifyController = require("../controllers/notifyController");
const auth = require("../Middleware/auth");

Router.get("/", auth, notifyController.getNotify);
Router.post("/create", auth, notifyController.create);
Router.delete("/delete-all", auth, notifyController.deleteAllNofifies);
Router.patch("/change-is-read/:id", auth, notifyController.changeIsRead);
Router.delete("/delete", auth, notifyController.removeNotify);

module.exports = Router;
