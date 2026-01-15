const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Here all routes

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

// All app.use routes

module.exports = app;
