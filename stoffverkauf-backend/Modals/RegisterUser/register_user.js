// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  agreed: { type: Boolean, required: true }, 
  phone: { type: Number},
  address: { type: String },
}, { timestamps: true });

module.exports= mongoose.model("User", userSchema);