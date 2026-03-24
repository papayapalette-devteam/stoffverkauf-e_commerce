// models/BlogPost.ts
const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["published", "draft"], default: "draft" },
  date: { type: Date, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // store image path
});

module.exports= mongoose.model("BlogPost", blogPostSchema);