const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/connectDB");
const initRouter = require("./router/index");
const socketIO = require("socket.io");
const handleSocket = require("./socket");
const { PeerServer } = require("peer");

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://social-connect-world.netlify.app"],
  })
);
app.use(cookieParser());

connectDB();

initRouter(app);

PeerServer({ port: 3001, path: "/" });

const server = app.listen(PORT, () => {
  socketIO(server, {
    cors: {
      origin: ["http://localhost:3000", "https://social-connect-world.netlify.app"],
    },
  }).on("connection", (socket) => {
    console.log("A new user connected : " + socket.id);
    handleSocket(socket);
  });
});
