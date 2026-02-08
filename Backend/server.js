const express = require("express");
const app = require("./src/app");
const connectDb = require("./src/db/db");
const server = require("./map_server")

 
require("dotenv").config();
connectDb();

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});