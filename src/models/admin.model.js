const mongoose = require("mongoose");
const { getMaxListeners } = require("../models/user.model");
const bcrypt = require("bcryptjs");


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
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "operator", "user", "superadmin"],
      default: "user",
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
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

// Password Hash 
adminSchema.pre("save", async function() {
  if(!this.isModified("password")) {
    return ;
  }
  this.password = await bcrypt.hash(this.password,12);
  // next();
});

//Password Compare
// adminSchema.methods.comparePassword = function(password){
//   return bcrypt.compare(password, this.password);
// };

// Checked Locked 
adminSchema.methods.isLocked = function(){
  return this.lockUntil && this.lockUntil > Date.now();
}



const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
