const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shortUrlSchema = new Schema({
  urlCode: {
    type: String,
    required: true
  },
  fullUrl: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  }
});

const shortUrl = model("ShortUrl", shortUrlSchema);

module.exports = shortUrl;
