const authRouter = require("./authRouter");
const userRouter = require("./userRouter");
const postRouter = require("./postRouter");
const commentRouter = require("./commentRouter");
const notifyRouter = require("./notifyRouter");
const chat = require("./messageRouter");

const initRouter = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/post", postRouter);
  app.use("/api/v1/comment", commentRouter);
  app.use("/api/v1/notify", notifyRouter);
  app.use("/api/v1/chat", chat);
};

module.exports = initRouter;
