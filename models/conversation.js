const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversation = new Schema(
  {
    recipients: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    text: String,
    media: Array,
    call: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversation", conversation);
