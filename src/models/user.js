const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 64
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    passwordhash: {
      type: String,
      required: true
    },
    resetLink: {
      data: String,
      default: ""
    }
  },
  { timestamps: true }
);

const User = model("User", UserSchema);
module.exports = User;
