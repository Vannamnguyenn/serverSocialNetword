const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const post = new Schema(
  {
    content: {
      type: String,
    },
    images: {
      type: Array,
      required: true,
    },
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("post", post);
