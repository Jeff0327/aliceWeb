const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    isAdmin: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);
const socialUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  has_email: { type: Boolean, required: true },
  kakaoToken: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
const SocialUser = mongoose.model("SocialUser", socialUserSchema);

module.exports = { User, SocialUser };
