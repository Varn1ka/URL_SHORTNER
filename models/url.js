const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  shortId: String,
  originalUrl: String,
});

module.exports = mongoose.model("Url", urlSchema);