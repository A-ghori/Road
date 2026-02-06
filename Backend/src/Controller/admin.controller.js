const express = require("express");
const adminModel = require("../models/admin.model");
const {MAX_LOGIN_ATTEMPTS, LOCK_TIME} = require("../config/security");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin Register Hidden Route
const adminRegister = async (req, res) => {
  const { email, password, name, phone, role } = req.body;
  try {
    const adminAlreadyRegister = await adminModel.findOne({
      email,
      phone,
    });
    if (!adminAlreadyRegister) {
      // const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await adminModel.create({
        email,
        password,
        name,
        phone,
        role,
      });
      const token = jwt.sign(
        {
          adminId: admin._id,
        },
        process.env.JWT_SECRET,
      );
      console.log("Admin Registered Token is :", token);
      res.cookie("token", token);
      return res.status(201).json({
        success: true,
        message: "Admin registered successfully",
      });
    } else {
      res.status(401).json({
        message: "Admin Already Registered",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Internal Server Error",
      success: false,
    });
  }
};

// Admin Login Hidden Route
const adminLogin = async (req, res) => {
  const { email, password, phone } = req.body;
  try {
    const admin = await adminModel.findOne({
      email,
      phone,
    }).select("+password");
    if (!admin) {
      return res.status(401).json({
        message: "Admin Not Found",
      });
    }

    // Check Locked
    if(admin.isLocked()) {
      return res.status(423).json({
        message: "Account Locked.Be a Gentleman donot be as an ashole.Try Again Later",
        unlockAt: admin.lockUntil,
      })
    }
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      // Wrong Password
      admin.loginAttempts +=1;
      if(admin.loginAttempts >= MAX_LOGIN_ATTEMPTS){
        admin.lockUntil = Date.now() + LOCK_TIME;
      };
      await admin.save();
      return res.status(401).json({
        message: "Invalid Login",
        success: false,
        attemptsLeft: Math.max(
          0,
          MAX_LOGIN_ATTEMPTS - admin.loginAttempts
        ),
      });
    }

    // Couter Reset / Cirrect Password -> reset attempts
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();
    
    // JWT 
    const token = jwt.sign(
      {
        adminId: admin._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "365d",
      },
    );
    console.log("Admin Login Token is :", token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Admin Login Successfully",
      admin: {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Internal Server Error",
      success: false,
    });
  }
};

// Check Further Admin Check
const checkAdmin = async (req, res) => {
  if (req.admin) {
    res.status(200).json({
      success: true,
      message: "Admin Login Successfully and Aldready Registerd",
      admin: {
        name: req.admin.name,
        email: req.admin.email,
        phone: req.admin.phone,
        role: req.admin.role,
        _id: req.admin._id,
      },
    });
  } else {
    res.status(401).json({
      message: "Admin Not Found Or Never Registered or Login",
      success: false,
    });
  }
};

// Admin Logout
const adminLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "User Logout Successfully",
  });
};

module.exports = {
  adminRegister,
  adminLogin,
  checkAdmin,
  adminLogout,
};
