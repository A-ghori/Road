const express = require("express");
const app = require("./src/app");
const connectDb = require("./src/db/db");
const server = require("./map_server")

 
require("dotenv").config();
connectDb();
  
server.listen(process.env.PORT || 3005,"0.0.0.0", () => {
  console.log(`Server running on ${process.env.PORT || 3005}`);
});