const mongoose = require("mongoose");
require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

function connectDB() {
  try {
    mongoose
      .connect(mongoURI, {
        maxPoolSize: 10,
      })
      .then(() => {
        console.log("MongodDb is Connectd");
      })
      .catch((err) => {
        console.log("Mongo DB is throwing Error", err);
      });
  } catch (err) {
    console.log("Mongo DB connection threw an exception", err);
  }
}
module.exports = connectDB;
