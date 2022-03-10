const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const Schema = mongoose.Schema;

const user = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: ["fullname"],
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
      default:
        "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-image-icon-default-avatar-profile-icon-social-media-user-vector-image-209162840.jpg",
    },
    gender: {
      type: String,
      default: "Male",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    story: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["nomal", "facebook", "google"],
      default: "nomal",
    },
    followers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
    role: { type: Number, enum: [0, 1, 2], default: 0 },
    saved: [{ type: mongoose.Types.ObjectId, ref: "post" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", user);
