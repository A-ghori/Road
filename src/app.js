const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser")
// Here all routes
const authRoutes = require("./Routes/publicRoutes");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

// All app.use routes
app.use("/api/auth",authRoutes)
module.exports = app;
