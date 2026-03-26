const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: 100,
      min: 0,
    },
    uses: {
      type: Number,
      default: 0,
      min: 0,
    },
    expires: {
      type: String, // Storing as YYYY-MM-DD to match frontend
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
