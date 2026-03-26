const mongoose = require("mongoose");

const homeSectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  enabled: { type: Boolean, default: true },
});

module.exports = mongoose.model("HomeSection", homeSectionSchema);
