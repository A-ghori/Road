const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// view engine
app.set("view engine", "ejs");

// static folder
app.use(express.static(path.join(__dirname, "public")));

// route
app.get("/", (req, res) => {
  res.render("index");
});


// socket connection
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("Send Location", (data) => {
    console.log("Location:", data);

    io.emit("recived location", {
      id: socket.id,
      ...data,
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);

    io.emit("user disconnected", {
      id: socket.id,
    });
  });
});

// export server
module.exports = server;