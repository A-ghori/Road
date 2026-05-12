const express = require("express");
const app = require("./src/app");
const connectDb = require("./src/db/db");
const server = require("./map_server")

 const PORT = process.env.PORT || 3005;
require("dotenv").config();
connectDb();
  
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is live on port ${PORT}`);
});