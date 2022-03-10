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

const origin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://social-network-app-fake.netlify.app";

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "https://social-network-app-fake.netlify.app",
      "http://localhost:3000",
      "http://192.168.43.99:3000",
    ],
  })
);
app.use(cookieParser());

connectDB();

initRouter(app);

PeerServer({ port: 3001, path: "/" });

const server = app.listen(PORT, () => {
  socketIO(server, {
    cors: {
      origin: [
        "https://social-network-app-fake.netlify.app",
        "http://localhost:3000",
        "http://192.168.43.99:3000",
      ],
    },
  }).on("connection", (socket) => {
    console.log("A new user connected : " + socket.id);
    handleSocket(socket);
  });
});
