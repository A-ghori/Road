const mongoose = require("mongoose");
const { getMaxListeners } = require("../models/user.model");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      minlength: 5,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 10,
      match: /^\d{10}$/i,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/i,
    },
    password: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ["admin", "operator", "user", "superadmin"],
      default: "user",
    },
    userModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
