const nodeMailer = require("nodemailer");
require("dotenv").config;

const mailHost = "smtp.gmail.com";
const mailPort = 587;

const sendMaiWithPass = (to, subject, htmlContent) => {
  const transporter = nodeMailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: false,
    auth: {
      user: process.env.GMAIL_ACCOUNT,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  const options = {
    from: process.env.GMAIL_ACCOUNT,
    to: to,
    subject: subject,
    html: htmlContent,
  };
  return transporter.sendMail(options);
};

module.exports = {
  sendMaiWithPass: sendMaiWithPass,
};
