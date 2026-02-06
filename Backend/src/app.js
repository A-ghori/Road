const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Here all routes
const cookieParser = require("cookie-parser");
// Here all routes
const adminRoutes = require("./Routes/adminRoutes");
const authRoutes = require("./Routes/publicRoutes");
const reportRoute = require("./Routes/reportRoutes");
const roadRouter = require("./Routes/Road_Routes");
const { loadRoadGraph } = require("./Loader_Graph.js/LoaderRoadGraph");
const roadRoutesFactory = require("./Routes/Road_Routes");
const app = express();
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

// All app.use routes

app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", adminRoutes);
app.use("/api", reportRoute);
(async () => {
  try {
    const graph = await loadRoadGraph("chunk1.osm.pbf");

    app.use("/api", roadRoutesFactory(graph));

    console.log("Road routes loaded ");
  } catch (err) {
    console.error("Graph loading failed ❌", err);
  }
})();
module.exports = app;
