const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/connectDB");
const initRouter = require("./router/index");

const origin =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://social-network-app-fake.netlify.app";

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin,
  })
);
app.use(cookieParser());

connectDB();

initRouter(app);

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
