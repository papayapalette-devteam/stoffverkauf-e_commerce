const mongoose = require("mongoose");

const pageSectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  titleDe: { type: String, required: true },
  titleEn: { type: String, required: true },
  contentDe: { type: String, required: true },
  contentEn: { type: String, required: true },
});

const pageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nameDe: { type: String, required: true },
  nameEn: { type: String, required: true },
  path: { type: String, required: true },
  sections: [pageSectionSchema],
});

module.exports = mongoose.model("Page", pageSchema);
