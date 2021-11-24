const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/connectDB");
const initRouter = require("./router/index");

app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());

connectDB();

initRouter(app);

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
