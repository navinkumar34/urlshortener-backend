require("dotenv").config();
const express = require("express");
const router = express.Router();
const validUrl = require("valid-url");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");

const Url = require("../models/shorturl");

router
  .post("/", async (req, res) => {
    const { token, fullUrl } = req.body;
    const data = jwt.verify(token, process.env.JWT_KEY);
    if (!data) {
      return res.status(400).json({ login: "please login again" });
    }
    if (!validUrl.isUri(fullUrl)) {
      return res.status(400).json({ error: "Invalid URL" });
    }
    try {
      let url = await Url.findOne({ fullUrl });
      if (url) {
        return res.status(200).json({ shorturl: url.shortUrl });
      }
      const urlCode = shortId.generate();
      const shortUrl = process.env.base_URL + "/" + urlCode;
      url = new Url({
        urlCode,
        fullUrl,
        shortUrl
      });

      await url.save((err, success) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Something went wrong, please try again" });
        }
        return res.status(200).json({ shorturl: url.shortUrl });
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Something went wrong, please try again" });
    }
  })
  .post("/all", async (req, res) => {
    const { token } = req.body;
    const data = await jwt.verify(token, process.env.JWT_KEY);
    if (!data) {
      return res.status(400).json({ login: "please login again" });
    }
    const shortUrls = await Url.find();
    if (shortUrls) {
      console.log(shortUrls);
      return res.status(200).json({ shortUrls: shortUrls });
    } else {
      return res.status(500).json({ error: "Internal Server error" });
    }
  })
  .get("/count", async (req, res) => {
    Url.countDocuments({}, (err, count) => {
      if (err) {
        return res.status(200).json({ count: 100 });
      }
      return res.status(200).json({ count: count });
    });
  });

module.exports = router;
