const express = require("express");
const cors = require("cors");
// Here all routes
const adminRoutes = require("./Routes/adminRoutes");
const authRoutes = require("./Routes/publicRoutes");
const roadRoute = require("./Routes/Road_Routes");
const sensorRoutes = require("./Routes/sensorRoutes");
const app = express();
app.use(cors({
  origin: ["http://localhost:3000","http://localhost:3001", "http://localhost:3002"],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

//const PORT = process.env.PORT || 3001;

// All app.use routes

app.use("/api/auth", authRoutes);
app.use("/api/auth", adminRoutes);
app.use("/api", roadRoute);
app.use("/api/sensor", sensorRoutes);
module.exports = app;
