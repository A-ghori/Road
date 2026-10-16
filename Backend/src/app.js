const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables (.env file se GOOGLE_MAPS_API_KEY aayegi)
dotenv.config();
console.log("Loaded API Key:", process.env.GOOGLE_MAPS_API_KEY ? "FOUND" : "NOT FOUND");

// Existing routes
const adminRoutes = require("./Routes/adminRoutes");
const authRoutes = require("./Routes/publicRoutes");
const roadRoute = require("./Routes/Road_Routes");
//const sensorRoutes = require("./Routes/sensorRoutes");
const createDamageReport = require("./Routes/damage_Routes");

// Naya Places route 
const placesRoutes = require("./Routes/place_routes");

const app = express();

app.use(express.json());

// CORS configuration (Vite port 5173 include kiya hai)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://road-jit2.vercel.app"
    ],
    credentials: true
  })
);

// Route mountings
app.use("/api/auth", authRoutes);
app.use("/api/auth", adminRoutes);
app.use("/api", roadRoute);
//app.use("/api/sensor", sensorRoutes);
app.use("/api/places", placesRoutes); // -> /api/places/nearby?lat=...&lng=...&type=hospital
app.use('/api/damage',createDamageReport)
module.exports = app;