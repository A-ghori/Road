const express = require("express");
// Here all routes
const adminRoutes = require("./Routes/adminRoutes");
const authRoutes = require("./Routes/publicRoutes");
const roadRoute = require("./Routes/Road_Routes");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// All app.use routes

app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", adminRoutes);
app.use("/api", roadRoute);

module.exports = app;
