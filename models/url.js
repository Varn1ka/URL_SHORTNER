const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  shortId: String,
  originalUrl: String,
  owner: { type: Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Url", urlSchema);
