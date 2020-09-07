require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "urlshortner"
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.log("MongoDB connection error");
  console.error(error);
});

db.once("open", function () {
  console.log("Connection established");
});

module.export = db;
