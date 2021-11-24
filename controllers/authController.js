require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const mailer = require("../util/SendMail/Mailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const { MAILING_SERVICE_CLIENT_ID, GENERATE_PASSWORD } = process.env;

const client = new OAuth2(MAILING_SERVICE_CLIENT_ID);

const cookiesOptions = {
  httpOnly: true,
  path: "/api/v1/auth/refresh_token",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
};

class AuthController {
  //  register nomal account
  async register(req, res) {
    const { email, password, fullname, gender, phone } = req.body;
    const checkExist = await User.findOne({ email });
    if (checkExist)
      return res.status(403).json({ success: false, msg: "User already exists !" });
    const hashPassword = bcrypt.hashSync(password, 12);
    const newUser = await User.create({
      email,
      password: hashPassword,
      fullname,
      gender,
      phone,
    });
    const access_token = generateAccessToken({ _id: newUser._id });
    const refresh_token = generateRefeshToken({ _id: newUser._id });
    res.cookie("refresh_token", refresh_token, cookiesOptions);

    delete newUser.password;
    return res.status(201).json({
      success: true,
      msg: "Create successfully !",
      user: newUser,
      access_token,
    });
  }
  // login to account
  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(403).json({ success: false, msg: "Incorrect email or password" });
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch)
      return res.status(403).json({ success: false, msg: "Incorrect email or password" });
    const access_token = generateAccessToken({ _id: user._id });
    const refresh_token = generateRefeshToken({ _id: user._id });
    res.cookie("refresh_token", refresh_token, cookiesOptions);
    return res.status(201).json({
      success: true,
      msg: "Login successfully !",
      user,
      access_token,
    });
  }
  //login by google
  async loginByGoogle(req, res) {
    try {
      const { tokenId } = req.body;
      const verify = await client.verifyIdToken({
        idToken: tokenId,
      });
      const data = verify.getPayload();
      const { email, name, picture } = data;
      let user = await User.findOne({ email }).select("-password");
      if (!user) {
        user = new User({
          fullname: name,
          email,
          avatar: picture,
          type: "google",
          password: bcrypt.hashSync(GENERATE_PASSWORD + email, 12),
        });
        await user.save();
      }
      const access_token = generateAccessToken({ _id: user._id });
      const refresh_token = generateRefeshToken({ _id: user._id });
      res.cookie("refresh_token", refresh_token, cookiesOptions);
      return res.status(201).json({
        success: true,
        msg: "Login successfully !",
        user,
        access_token,
      });
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        success: false,
        msg: "Can't authenticate ! Please try again !",
      });
    }
  }
  // login by facebook
  async loginByFacebook(req, res) {
    try {
      const { userID, accessToken } = req.body;
      const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
      const response = await fetch(URL).then(function (response) {
        return response.json();
      });
      const { id, name, email, picture } = response;
      let newUser = await User.findOne({
        email: email || `${id}@facebook.com`,
      }).select("-password");
      if (!newUser) {
        newUser = new User({
          fullname: name,
          email,
          password: bcrypt.hashSync(GENERATE_PASSWORD + email, 12),
          avatar: picture.data.url,
          type: "facebook",
        });
        await newUser.save();
      }
      const access_token = generateAccessToken({ _id: newUser._id });
      const refresh_token = generateRefeshToken({ _id: newUser._id });
      res.cookie("refresh_token", refresh_token, cookiesOptions);
      return res.status(201).json({
        success: true,
        msg: "Login successfully !",
        user: newUser,
        access_token,
      });
    } catch (error) {
      console.log(error);
      return res.status(403).json({
        success: false,
        msg: "Can't authenticate ! Please try again !",
      });
    }
  }
  // log out account
  logout(req, res) {
    res.clearCookie("refresh_token", {
      path: "/api/v1/auth/refresh_token",
    });
    return res.status(200).json({ success: true, msg: "Logout successfully !" });
  }
  // get access token by refresh token
  async refresh_token(req, res) {
    const { refresh_token } = req.cookies;
    console.log(req.cookies);
    try {
      const check = await jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
      const user = await User.findById(check._id).select("-password");
      const access_token = generateAccessToken({ _id: user._id });
      return res.status(201).json({ success: true, access_token, user });
    } catch (error) {
      return res.status(400).json({ success: false, msg: "Refresh toke is invalid !" });
    }
  }
  // mail to forgot password
  async mailForgotPassword(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email: email }).select("_id type");
    if (!user) return res.status(400).json({ success: false, msg: "Invalid email !" });
    if (user.type !== "nomal") {
      return res.status(400).json({
        success: false,
        msg: "Can't not reset password for account google or facebook !",
      });
    }
    const tokenResetPass = generateForgotPassToken({ _id: user._id });
    const url = `${process.env.CLIENT_URL}/reset-password/${tokenResetPass}`;
    try {
      mailer(email, "RESET PASSWORD", url, "Get password");
      return res.status(200).json({
        success: true,
        msg: "Request successfully please check your email !",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: "Server is not responding ! Please try again later.",
      });
    }
  }
  // reset password for user
  async resetPassword(req, res) {
    try {
      const token = jwt.verify(req.body.token, process.env.RESET_PASSWORD_SECRET);
      const { password } = req.body;
      const hashPassword = bcrypt.hashSync(password, 12);
      await User.findByIdAndUpdate(token._id, {
        password: hashPassword,
      });
      return res.status(201).json({
        success: true,
        msg: "Updated password successfully ! Please login !",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: "Token is invalid !",
      });
    }
  }
}
// generateAccessToken
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN, {
    expiresIn: "1day",
  });
};
// generateForgotPassToken
const generateForgotPassToken = (payload) => {
  return jwt.sign(payload, process.env.RESET_PASSWORD_SECRET, {
    expiresIn: "7day",
  });
};
// generateRefeshToken
const generateRefeshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN, {
    expiresIn: "30day",
  });
};

module.exports = new AuthController();
