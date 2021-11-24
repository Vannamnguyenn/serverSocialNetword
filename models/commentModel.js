const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comment = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    tag: Object,
    reply: mongoose.Types.ObjectId,
    postID: { type: mongoose.Types.ObjectId },
    postUserID: { type: mongoose.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comment", comment);
