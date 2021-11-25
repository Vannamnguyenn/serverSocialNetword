require("dotenv").config;

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL,
} = process.env;

const oauth2Client = new OAuth2({
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND,
});

//send mail
const sendMail = (to, subject, url, txt) => {
  // setCredentials
  oauth2Client.setCredentials({
    refresh_token: MAILING_SERVICE_REFRESH_TOKEN,
  });
  // get access token
  const accessToken = oauth2Client.getAccessToken();
  // config node mailer
  const smptTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL,
      clientId: MAILING_SERVICE_CLIENT_ID,
      clientSecret: MAILING_SERVICE_CLIENT_SECRET,
      refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
      accessToken,
    },
  });
  // config mail option
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject,
    html: `

    <a style="display:block;margin : 1rem; font-size :2rem" href=${url}>Click to reset password</a>
      
      `,
  };
  smptTransport.sendMail(mailOptions, (err, result) => {
    if (err) {
      return err;
    }
    return result;
  });
};

module.exports = sendMail;
