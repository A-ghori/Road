const userModel = require("../models/user.model")
const adminModel = require("../models/admin.model");
const jwt = require("jsonwebtoken");

const userMiddleWare = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Login required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModel.findById(decoded.userId);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminMiddleWare = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Login required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await adminModel.findById(decoded.adminId);
    if (!admin) return res.status(401).json({ message: "Admin not found" });
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { userMiddleWare, adminMiddleWare };

