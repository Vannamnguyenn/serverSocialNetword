const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const message = new Schema(
  {
    text: String,
    sender: { type: mongoose.Types.ObjectId, ref: "user" },
    media: Array,
    conversation: { type: mongoose.Types.ObjectId, ref: "conversation" },
    recipients: { type: mongoose.Types.ObjectId, ref: "user" },
    call: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", message);
