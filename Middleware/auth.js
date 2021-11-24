const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token)
    return res.status(401).json({ success: false, mgs: "Invalid token !" });
  try {
    let decode = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.userID = decode._id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, mgs: "Invalid token !" });
  }
};

module.exports = auth;
