const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Notify = new Schema(
  {
    postID: mongoose.Types.ObjectId,
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    recipients: [mongoose.Types.ObjectId],
    content: String,
    text: String,
    url: String,
    isRead: [mongoose.Types.ObjectId],
  },
  { timestamps: true }
);

module.exports = mongoose.model("notify", Notify);
