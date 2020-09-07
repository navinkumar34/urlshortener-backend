require("dotenv").config();
require("./config/dbConfig.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const Url = require("./models/shorturl");
const shorturlRouter = require("./routers/shortnerRouter");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(compression());

app.get("/", (req, res) => {
  res.send("<h1>Url Shortner Server!</h1>");
});

app.get("/:code", async (req, res) => {
  try {
    await Url.findOne({ urlCode: req.params.code }, (err, url) => {
      if (err || !url) {
        return res.status(400).send("Invalid short Url");
      }

      url.updateOne({ clicks: ++url.clicks }, (err, success) => {
        if (err) {
          return res
            .status(500)
            .send("Something went wrong please refresh the page");
        }
        return res.redirect(url.fullUrl);
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Side Error" });
  }
});

app.use("/api/user", userRouter);
app.use("/api/shortenurl", shorturlRouter);

const Port = process.env.Port;

app.listen(Port || 8000, () => console.log("server running"));
